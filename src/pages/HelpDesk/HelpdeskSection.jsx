import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  Clock3,
  Eye,
  FileText,
  MessageSquare,
  Plus,
  Search,
  Send,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import {
  addTicketComment,
  createTicket,
  getTicketTaxonomy,
  getMyTickets,
  getTicketById,
  markTicketClosedWithoutResolution,
  requestTicketFollowUp,
  resolveAttachmentUrl,
} from "../../services/ticket.service";

const STATUS_TABS = [
  { key: "all", label: "All", apiValue: "" },
  { key: "pending", label: "Pending", apiValue: "Pending" },
  { key: "in-progress", label: "In Progress", apiValue: "In-Progress" },
  { key: "resolved", label: "Resolved", apiValue: "Resolved" },
  { key: "closed", label: "Closed", apiValue: "Closed" },
];

const PRIORITY_OPTIONS = ["Low", "Medium", "High"];
const HELP_TYPE_OPTIONS = ["Academic", "Technical"];

const DEFAULT_FORM = {
  title: "",
  description: "",
  helpType: "",
  queryCategory: "",
  querySubCategory: "",
  priority: "Medium",
  files: [],
};

const DEFAULT_COMMENT_FORM = {
  message: "",
  files: [],
};

const DEFAULT_TAXONOMY = {
  followUpAfterHours: 48,
  escalationLevels: [],
  routedToRoles: [],
  categories: [],
};

const statusBadgeClass = (status) => {
  switch (String(status || "").toLowerCase()) {
    case "pending":
      return "bg-amber-100 text-amber-700";
    case "in-progress":
      return "bg-blue-100 text-blue-700";
    case "resolved":
      return "bg-emerald-100 text-emerald-700";
    case "closed":
      return "bg-gray-200 text-gray-700";
    default:
      return "bg-gray-100 text-gray-600";
  }
};

const priorityClass = (priority) => {
  switch (String(priority || "").toLowerCase()) {
    case "high":
      return "text-red-600";
    case "medium":
      return "text-amber-600";
    case "low":
      return "text-emerald-600";
    default:
      return "text-gray-600";
  }
};

const helpTypeBadgeClass = (helpType) => {
  if (String(helpType || "").toLowerCase() === "technical") {
    return "bg-purple-100 text-purple-700";
  }
  return "bg-indigo-100 text-indigo-700";
};

const formatDate = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString();
};

const toIsoDate = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date;
};

const isFollowUpAllowed = (ticket) => {
  if (!ticket) return false;
  if (String(ticket.status || "").toLowerCase() === "closed") return false;
  const eligibleAt = toIsoDate(ticket.followUpEligibleAt);
  if (eligibleAt) {
    return Date.now() >= eligibleAt.getTime();
  }
  const createdAt = toIsoDate(ticket.createdAt);
  const lastUpdateAt = toIsoDate(ticket.lastUpdateAt || ticket.updatedAt);
  const base = lastUpdateAt || createdAt;
  if (!base) return false;
  return Date.now() >= base.getTime() + 48 * 60 * 60 * 1000;
};

const HelpdeskSection = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState("all");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const [tickets, setTickets] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
    hasNext: false,
    hasPrev: false,
  });
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState(DEFAULT_FORM);
  const [submittingCreate, setSubmittingCreate] = useState(false);
  const [taxonomy, setTaxonomy] = useState(DEFAULT_TAXONOMY);
  const [loadingTaxonomy, setLoadingTaxonomy] = useState(false);
  const [submittingFollowUp, setSubmittingFollowUp] = useState(false);
  const [submittingClosedWithoutResolution, setSubmittingClosedWithoutResolution] =
    useState(false);
  const [showClosedWithoutResolutionModal, setShowClosedWithoutResolutionModal] =
    useState(false);
  const [closedWithoutResolutionForm, setClosedWithoutResolutionForm] = useState({
    reasonCategory: "",
    reasonSubCategory: "",
  });

  const [selectedTicketId, setSelectedTicketId] = useState("");
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [loadingTicket, setLoadingTicket] = useState(false);
  const [commentForm, setCommentForm] = useState(DEFAULT_COMMENT_FORM);
  const [submittingComment, setSubmittingComment] = useState(false);

  const activeTabConfig = useMemo(
    () => STATUS_TABS.find((item) => item.key === activeTab) || STATUS_TABS[0],
    [activeTab]
  );

  const categoryOptions = useMemo(
    () => (Array.isArray(taxonomy.categories) ? taxonomy.categories : []),
    [taxonomy.categories]
  );

  const selectedCategoryConfig = useMemo(
    () =>
      categoryOptions.find(
        (entry) =>
          String(entry?.name || "").toLowerCase() ===
          String(createForm.queryCategory || "").toLowerCase()
      ) || null,
    [categoryOptions, createForm.queryCategory]
  );

  const subCategoryOptions = useMemo(
    () =>
      Array.isArray(selectedCategoryConfig?.subCategories)
        ? selectedCategoryConfig.subCategories
        : [],
    [selectedCategoryConfig]
  );

  const closedReasonCategoryConfig = useMemo(
    () =>
      categoryOptions.find(
        (entry) =>
          String(entry?.name || "").toLowerCase() ===
          String(closedWithoutResolutionForm.reasonCategory || "").toLowerCase()
      ) || null,
    [categoryOptions, closedWithoutResolutionForm.reasonCategory]
  );

  const closedReasonSubCategoryOptions = useMemo(
    () =>
      Array.isArray(closedReasonCategoryConfig?.subCategories)
        ? closedReasonCategoryConfig.subCategories
        : [],
    [closedReasonCategoryConfig]
  );

  const summary = useMemo(() => {
    const totals = {
      total: pagination.total || tickets.length,
      pending: 0,
      inProgress: 0,
      resolved: 0,
      closed: 0,
    };
    tickets.forEach((ticket) => {
      const normalized = String(ticket.status || "").toLowerCase();
      if (normalized === "pending") totals.pending += 1;
      if (normalized === "in-progress") totals.inProgress += 1;
      if (normalized === "resolved") totals.resolved += 1;
      if (normalized === "closed") totals.closed += 1;
    });
    return totals;
  }, [tickets, pagination.total]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const loadTaxonomy = async () => {
    setLoadingTaxonomy(true);
    try {
      const response = await getTicketTaxonomy();
      const nextTaxonomy = response?.taxonomy || DEFAULT_TAXONOMY;
      setTaxonomy({
        followUpAfterHours: Number(nextTaxonomy?.followUpAfterHours || 48) || 48,
        escalationLevels: Array.isArray(nextTaxonomy?.escalationLevels)
          ? nextTaxonomy.escalationLevels
          : [],
        routedToRoles: Array.isArray(nextTaxonomy?.routedToRoles)
          ? nextTaxonomy.routedToRoles
          : [],
        categories: Array.isArray(nextTaxonomy?.categories)
          ? nextTaxonomy.categories
          : [],
      });
    } catch (error) {
      toast.error(error?.response?.data?.error || "Failed to load helpdesk categories.");
      setTaxonomy(DEFAULT_TAXONOMY);
    } finally {
      setLoadingTaxonomy(false);
    }
  };

  const loadTickets = async ({ keepLoading = false } = {}) => {
    if (keepLoading) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const response = await getMyTickets({
        status: activeTabConfig.apiValue || undefined,
        search: search || undefined,
        page,
        limit,
        sort: "-createdAt",
      });

      const data = Array.isArray(response?.data)
        ? response.data
        : Array.isArray(response?.tickets)
          ? response.tickets
          : [];
      const resolvedPage = Number(response?.page || response?.pagination?.page || page);
      const resolvedLimit = Number(response?.limit || response?.pagination?.limit || limit);
      const resolvedTotal = Number(response?.total || response?.pagination?.total || 0);
      const resolvedTotalPages = Number(
        response?.totalPages || response?.pagination?.totalPages || 1
      );

      setTickets(data);
      setPagination({
        page: resolvedPage,
        totalPages: resolvedTotalPages,
        total: resolvedTotal,
        hasNext:
          response?.pagination?.hasNext !== undefined
            ? Boolean(response.pagination.hasNext)
            : resolvedPage < resolvedTotalPages,
        hasPrev:
          response?.pagination?.hasPrev !== undefined
            ? Boolean(response.pagination.hasPrev)
            : resolvedPage > 1 && resolvedTotal > resolvedLimit,
      });
    } catch (error) {
      toast.error(error?.response?.data?.error || "Failed to load tickets.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadTicketDetail = async (id) => {
    if (!id) return;
    setLoadingTicket(true);
    try {
      const response = await getTicketById(id);
      setSelectedTicket(response?.ticket || null);
      setSelectedTicketId(id);
    } catch (error) {
      setSelectedTicket(null);
      setSelectedTicketId("");
      toast.error(error?.response?.data?.error || "Failed to load ticket details.");
    } finally {
      setLoadingTicket(false);
    }
  };

  useEffect(() => {
    loadTickets();
  }, [activeTabConfig.apiValue, search, page, limit]);

  useEffect(() => {
    loadTaxonomy();
  }, []);

  const handleCreateTicket = async (event) => {
    event.preventDefault();

    if (
      !createForm.title.trim() ||
      !createForm.description.trim() ||
      !createForm.helpType.trim() ||
      !createForm.queryCategory.trim() ||
      !createForm.querySubCategory.trim()
    ) {
      toast.error(
        "Help type, title, description, query category and sub-category are required."
      );
      return;
    }

    const formData = new FormData();
    formData.append("title", createForm.title.trim());
    formData.append("description", createForm.description.trim());
    formData.append("helpType", createForm.helpType.trim());
    formData.append("queryCategory", createForm.queryCategory.trim());
    formData.append("querySubCategory", createForm.querySubCategory.trim());
    formData.append("category", createForm.queryCategory.trim());
    formData.append("priority", createForm.priority || "Medium");
    createForm.files.forEach((file) => {
      formData.append("files", file);
    });

    setSubmittingCreate(true);
    try {
      const response = await createTicket(formData);
      toast.success(response?.message || "Ticket created successfully.");
      setShowCreateModal(false);
      setCreateForm(DEFAULT_FORM);
      setPage(1);
      await loadTickets({ keepLoading: true });
    } catch (error) {
      toast.error(error?.response?.data?.error || "Failed to create ticket.");
    } finally {
      setSubmittingCreate(false);
    }
  };

  const handleAddComment = async (event) => {
    event.preventDefault();
    if (!selectedTicketId) return;

    if (!commentForm.message.trim() && commentForm.files.length === 0) {
      toast.error("Add a message or an attachment.");
      return;
    }

    const formData = new FormData();
    formData.append("message", commentForm.message.trim());
    commentForm.files.forEach((file) => {
      formData.append("attachments", file);
    });

    setSubmittingComment(true);
    try {
      const response = await addTicketComment(selectedTicketId, formData);
      setSelectedTicket(response?.ticket || selectedTicket);
      setCommentForm(DEFAULT_COMMENT_FORM);
      toast.success(response?.message || "Comment added.");
      await loadTickets({ keepLoading: true });
    } catch (error) {
      toast.error(error?.response?.data?.error || "Failed to add comment.");
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleRequestFollowUp = async () => {
    if (!selectedTicketId) return;
    setSubmittingFollowUp(true);
    try {
      const response = await requestTicketFollowUp(selectedTicketId);
      setSelectedTicket(response?.ticket || selectedTicket);
      toast.success(response?.message || "Follow-up requested.");
      await loadTickets({ keepLoading: true });
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to request follow-up.");
    } finally {
      setSubmittingFollowUp(false);
    }
  };

  const handleMarkClosedWithoutResolution = async (event) => {
    event.preventDefault();
    if (!selectedTicketId) return;
    if (
      !closedWithoutResolutionForm.reasonCategory ||
      !closedWithoutResolutionForm.reasonSubCategory
    ) {
      toast.error("Please select reason category and sub-category.");
      return;
    }
    setSubmittingClosedWithoutResolution(true);
    try {
      const response = await markTicketClosedWithoutResolution(selectedTicketId, {
        closedWithoutResolutionReasonCategory:
          closedWithoutResolutionForm.reasonCategory,
        closedWithoutResolutionReasonSubCategory:
          closedWithoutResolutionForm.reasonSubCategory,
      });
      setSelectedTicket(response?.ticket || selectedTicket);
      setShowClosedWithoutResolutionModal(false);
      setClosedWithoutResolutionForm({ reasonCategory: "", reasonSubCategory: "" });
      toast.success(response?.message || "Ticket escalated to grievance chairman.");
      await loadTickets({ keepLoading: true });
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          error?.response?.data?.error ||
          "Failed to mark closed without resolution."
      );
    } finally {
      setSubmittingClosedWithoutResolution(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-6">
      <div className="max-w-7xl mx-auto px-4 space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="p-2 rounded-full bg-white shadow-sm hover:bg-gray-50"
            >
              <ArrowLeft className="h-5 w-5 text-gray-700" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Helpdesk</h1>
              <p className="text-sm text-gray-600">Raise and track your support tickets.</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" /> Raise Ticket
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
            <p className="text-xs text-gray-500">Total</p>
            <p className="text-xl font-semibold text-gray-900">{summary.total}</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
            <p className="text-xs text-gray-500">Pending</p>
            <p className="text-xl font-semibold text-amber-700">{summary.pending}</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
            <p className="text-xs text-gray-500">In Progress</p>
            <p className="text-xl font-semibold text-blue-700">{summary.inProgress}</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
            <p className="text-xs text-gray-500">Resolved</p>
            <p className="text-xl font-semibold text-emerald-700">{summary.resolved}</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
            <p className="text-xs text-gray-500">Closed</p>
            <p className="text-xl font-semibold text-gray-700">{summary.closed}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
            <div className="flex flex-wrap gap-2">
              {STATUS_TABS.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => {
                    setActiveTab(tab.key);
                    setPage(1);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                    activeTab === tab.key
                      ? "bg-primary text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="relative w-full md:w-72">
              <Search className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="Search by Ticket ID/title/category"
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/40 focus:outline-none"
              />
            </div>
          </div>

          {loading ? (
            <div className="py-16 text-center text-gray-600">Loading tickets...</div>
          ) : tickets.length === 0 ? (
            <div className="py-16 text-center text-gray-600">
              <AlertCircle className="h-8 w-8 mx-auto mb-2 text-gray-400" />
              No tickets found.
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr className="text-left text-xs uppercase tracking-wide text-gray-500">
                      <th className="px-3 py-2">Ticket</th>
                      <th className="px-3 py-2">Category / Sub-category</th>
                      <th className="px-3 py-2">Help Type</th>
                      <th className="px-3 py-2">Priority</th>
                      <th className="px-3 py-2">Status</th>
                      <th className="px-3 py-2">Escalation</th>
                      <th className="px-3 py-2">Last Update</th>
                      <th className="px-3 py-2">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {tickets.map((ticket) => (
                      <tr key={ticket._id || ticket.ticketId} className="hover:bg-gray-50">
                        <td className="px-3 py-3">
                          <p className="text-sm font-semibold text-gray-900">{ticket.ticketId}</p>
                          <p className="text-sm text-gray-700">{ticket.title}</p>
                        </td>
                        <td className="px-3 py-3 text-sm text-gray-700">
                          <div>{ticket.queryCategory || ticket.category || "-"}</div>
                          <div className="text-xs text-gray-500">
                            {ticket.querySubCategory || "-"}
                          </div>
                        </td>
                        <td className="px-3 py-3 text-sm">
                          <span
                            className={`px-2.5 py-1 rounded-full text-xs font-semibold ${helpTypeBadgeClass(ticket.helpType)}`}
                          >
                            {ticket.helpType || "Academic"}
                          </span>
                        </td>
                        <td className={`px-3 py-3 text-sm font-medium ${priorityClass(ticket.priority)}`}>
                          {ticket.priority}
                        </td>
                        <td className="px-3 py-3 text-sm">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusBadgeClass(ticket.status)}`}>
                            {ticket.status}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-xs text-gray-700">
                          <div className="font-semibold">
                            {ticket.escalationLevel || "-"}
                          </div>
                          {Array.isArray(ticket.frontlineLevels) &&
                          ticket.frontlineLevels.length > 1 ? (
                            <div className="text-[11px] text-gray-500">
                              Eligible: {ticket.frontlineLevels.join(" / ")}
                            </div>
                          ) : null}
                          <div>{ticket.routedToRole || "-"}</div>
                        </td>
                        <td className="px-3 py-3 text-sm text-gray-700">{formatDate(ticket.lastUpdateAt || ticket.updatedAt)}</td>
                        <td className="px-3 py-3 text-sm">
                          <button
                            type="button"
                            onClick={() => loadTicketDetail(ticket._id || ticket.ticketId)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded border border-gray-300 hover:bg-gray-100"
                          >
                            <Eye className="h-4 w-4" /> View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  Page {pagination.page} of {pagination.totalPages}
                  {refreshing ? " (refreshing...)" : ""}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={!pagination.hasPrev}
                    onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                    className="px-3 py-1.5 rounded border border-gray-300 disabled:opacity-40"
                  >
                    Prev
                  </button>
                  <button
                    type="button"
                    disabled={!pagination.hasNext}
                    onClick={() => setPage((prev) => prev + 1)}
                    className="px-3 py-1.5 rounded border border-gray-300 disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/40 z-40 flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-white rounded-xl shadow-xl">
            <div className="flex items-center justify-between px-5 py-4 border-b">
              <h3 className="text-lg font-semibold text-gray-900">Raise New Ticket</h3>
              <button type="button" onClick={() => setShowCreateModal(false)} className="p-1 rounded hover:bg-gray-100">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTicket} className="p-5 space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Title</label>
                <input
                  value={createForm.title}
                  onChange={(event) => setCreateForm((prev) => ({ ...prev, title: event.target.value }))}
                  maxLength={180}
                  className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="Short summary of the issue"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Help Type</label>
                  <select
                    value={createForm.helpType}
                    onChange={(event) =>
                      setCreateForm((prev) => ({ ...prev, helpType: event.target.value }))
                    }
                    className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2"
                    required
                  >
                    <option value="">Select help type</option>
                    {HELP_TYPE_OPTIONS.map((helpType) => (
                      <option key={helpType} value={helpType}>
                        {helpType}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Query Category</label>
                  <select
                    value={createForm.queryCategory}
                    onChange={(event) =>
                      setCreateForm((prev) => ({
                        ...prev,
                        queryCategory: event.target.value,
                        querySubCategory: "",
                      }))
                    }
                    className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2"
                    required
                    disabled={loadingTaxonomy}
                  >
                    <option value="">
                      {loadingTaxonomy ? "Loading categories..." : "Select query category"}
                    </option>
                    {categoryOptions.map((category) => (
                      <option key={category.name} value={category.name}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Query Sub-category</label>
                  <select
                    value={createForm.querySubCategory}
                    onChange={(event) =>
                      setCreateForm((prev) => ({
                        ...prev,
                        querySubCategory: event.target.value,
                      }))
                    }
                    className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2"
                    required
                    disabled={!createForm.queryCategory}
                  >
                    <option value="">Select query sub-category</option>
                    {subCategoryOptions.map((subCategory) => (
                      <option key={subCategory} value={subCategory}>
                        {subCategory}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Priority</label>
                  <select
                    value={createForm.priority}
                    onChange={(event) => setCreateForm((prev) => ({ ...prev, priority: event.target.value }))}
                    className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2"
                  >
                    {PRIORITY_OPTIONS.map((priority) => (
                      <option key={priority} value={priority}>
                        {priority}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Description</label>
                <textarea
                  value={createForm.description}
                  onChange={(event) => setCreateForm((prev) => ({ ...prev, description: event.target.value }))}
                  rows={5}
                  maxLength={5000}
                  className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="Explain the issue with relevant details"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Attachments (optional)</label>
                <input
                  type="file"
                  multiple
                  onChange={(event) =>
                    setCreateForm((prev) => ({
                      ...prev,
                      files: Array.from(event.target.files || []),
                    }))
                  }
                  className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button type="button" onClick={() => setShowCreateModal(false)} className="px-4 py-2 rounded-lg border border-gray-300">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingCreate}
                  className="px-4 py-2 rounded-lg bg-primary text-white disabled:opacity-50"
                >
                  {submittingCreate ? "Submitting..." : "Submit Ticket"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedTicketId && (
        <div className="fixed inset-0 bg-black/40 z-50 flex justify-end">
          <div className="w-full max-w-2xl bg-white h-full overflow-y-auto">
            <div className="px-5 py-4 border-b flex items-center justify-between sticky top-0 bg-white z-10">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Ticket Details</h3>
                <p className="text-sm text-gray-600">{selectedTicket?.ticketId || selectedTicketId}</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedTicketId("");
                  setSelectedTicket(null);
                  setCommentForm(DEFAULT_COMMENT_FORM);
                }}
                className="p-1 rounded hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {loadingTicket || !selectedTicket ? (
              <div className="p-8 text-center text-gray-600">Loading ticket...</div>
            ) : (
              <div className="p-5 space-y-6">
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-semibold ${helpTypeBadgeClass(selectedTicket.helpType)}`}
                    >
                      {selectedTicket.helpType || "Academic"}
                    </span>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusBadgeClass(selectedTicket.status)}`}>
                      {selectedTicket.status}
                    </span>
                    <span className={`text-sm font-semibold ${priorityClass(selectedTicket.priority)}`}>
                      {selectedTicket.priority}
                    </span>
                    <span className="text-sm text-gray-600">
                      {selectedTicket.queryCategory || selectedTicket.category}
                    </span>
                  </div>
                  <h4 className="text-base font-semibold text-gray-900">{selectedTicket.title}</h4>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{selectedTicket.description}</p>
                  <p className="text-xs text-gray-600">
                    Sub-category: {selectedTicket.querySubCategory || "-"}
                  </p>
                  <p className="text-xs text-gray-600">
                    Escalation: {selectedTicket.escalationLevel || "-"} /{" "}
                    {selectedTicket.routedToRole || "-"}
                  </p>
                  {Array.isArray(selectedTicket.frontlineLevels) &&
                  selectedTicket.frontlineLevels.length > 1 ? (
                    <p className="text-xs text-gray-600">
                      Eligible frontlines: {selectedTicket.frontlineLevels.join(" / ")}
                    </p>
                  ) : null}
                  <p className="text-xs text-gray-600">
                    Follow-up eligible at: {formatDate(selectedTicket.followUpEligibleAt)}
                  </p>
                  <p className="text-xs text-gray-600">
                    Resolution Status: {selectedTicket.resolutionStatus || "Unresolved"}
                  </p>
                  <p className="text-xs text-gray-500">Last update: {formatDate(selectedTicket.lastUpdateAt || selectedTicket.updatedAt)}</p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={handleRequestFollowUp}
                    disabled={
                      submittingFollowUp ||
                      !isFollowUpAllowed(selectedTicket) ||
                      String(selectedTicket.status || "").toLowerCase() === "closed"
                    }
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-amber-300 text-amber-700 disabled:opacity-50"
                  >
                    <Clock3 className="h-4 w-4" />
                    {submittingFollowUp ? "Requesting..." : "Follow up after 48hrs"}
                  </button>
                  <button
                    type="button"
                    disabled={String(selectedTicket.status || "") !== "Closed"}
                    onClick={() => setShowClosedWithoutResolutionModal(true)}
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-red-300 text-red-700 disabled:opacity-50"
                  >
                    <AlertCircle className="h-4 w-4" />
                    Closed without resolution
                  </button>
                </div>

                <div>
                  <h5 className="text-sm font-semibold text-gray-800 mb-2">Ticket Attachments</h5>
                  {selectedTicket.attachments?.length ? (
                    <div className="space-y-2">
                      {selectedTicket.attachments.map((attachment, index) => (
                        <a
                          key={`${attachment.url}-${index}`}
                          href={resolveAttachmentUrl(attachment.url)}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-2 text-sm text-primary hover:underline"
                        >
                          <FileText className="h-4 w-4" />
                          {attachment.originalName || `Attachment ${index + 1}`}
                        </a>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No attachments</p>
                  )}
                </div>

                <div>
                  <h5 className="text-sm font-semibold text-gray-800 mb-2">Conversation</h5>
                  <div className="space-y-3">
                    {(selectedTicket.comments || []).length === 0 ? (
                      <p className="text-sm text-gray-500">No comments yet.</p>
                    ) : (
                      selectedTicket.comments.map((comment) => {
                        const isMine = String(comment?.by?._id || comment?.by || "") === String(user?._id || "");
                        return (
                          <div
                            key={comment._id}
                            className={`rounded-lg border px-3 py-2 ${isMine ? "bg-blue-50 border-blue-100" : "bg-gray-50 border-gray-200"}`}
                          >
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <p className="text-xs font-semibold text-gray-700">
                                {comment?.by?.name || "User"} ({comment.byRole || "user"})
                              </p>
                              <p className="text-[11px] text-gray-500">{formatDate(comment.createdAt)}</p>
                            </div>
                            {comment.message ? (
                              <p className="text-sm text-gray-800 whitespace-pre-wrap">{comment.message}</p>
                            ) : null}
                            {comment.attachments?.length ? (
                              <div className="mt-2 space-y-1">
                                {comment.attachments.map((attachment, index) => (
                                  <a
                                    key={`${attachment.url}-${index}`}
                                    href={resolveAttachmentUrl(attachment.url)}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex items-center gap-2 text-xs text-primary hover:underline"
                                  >
                                    <FileText className="h-3.5 w-3.5" />
                                    {attachment.originalName || `Attachment ${index + 1}`}
                                  </a>
                                ))}
                              </div>
                            ) : null}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                <form onSubmit={handleAddComment} className="bg-white border border-gray-200 rounded-lg p-3 space-y-3">
                  <label className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" /> Add Comment
                  </label>
                  <textarea
                    value={commentForm.message}
                    onChange={(event) =>
                      setCommentForm((prev) => ({ ...prev, message: event.target.value }))
                    }
                    rows={3}
                    maxLength={2000}
                    placeholder="Write your message..."
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                  <input
                    type="file"
                    multiple
                    onChange={(event) =>
                      setCommentForm((prev) => ({
                        ...prev,
                        files: Array.from(event.target.files || []),
                      }))
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={submittingComment}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white disabled:opacity-50"
                    >
                      <Send className="h-4 w-4" />
                      {submittingComment ? "Posting..." : "Post Comment"}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}

      {showClosedWithoutResolutionModal && (
        <div className="fixed inset-0 bg-black/40 z-[60] flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-xl shadow-xl">
            <div className="px-5 py-4 border-b flex items-center justify-between">
              <h4 className="text-lg font-semibold text-gray-900">
                Closed Without Resolution
              </h4>
              <button
                type="button"
                className="p-1 rounded hover:bg-gray-100"
                onClick={() => setShowClosedWithoutResolutionModal(false)}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form
              onSubmit={handleMarkClosedWithoutResolution}
              className="px-5 py-4 space-y-4"
            >
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Reason Category
                </label>
                <select
                  value={closedWithoutResolutionForm.reasonCategory}
                  onChange={(event) =>
                    setClosedWithoutResolutionForm((prev) => ({
                      ...prev,
                      reasonCategory: event.target.value,
                      reasonSubCategory: "",
                    }))
                  }
                  className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2"
                  required
                >
                  <option value="">Select category</option>
                  {categoryOptions.map((entry) => (
                    <option key={entry.name} value={entry.name}>
                      {entry.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Reason Sub-category
                </label>
                <select
                  value={closedWithoutResolutionForm.reasonSubCategory}
                  onChange={(event) =>
                    setClosedWithoutResolutionForm((prev) => ({
                      ...prev,
                      reasonSubCategory: event.target.value,
                    }))
                  }
                  className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2"
                  required
                  disabled={!closedWithoutResolutionForm.reasonCategory}
                >
                  <option value="">Select sub-category</option>
                  {closedReasonSubCategoryOptions.map((entry) => (
                    <option key={entry} value={entry}>
                      {entry}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowClosedWithoutResolutionModal(false)}
                  className="px-4 py-2 rounded-lg border border-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingClosedWithoutResolution}
                  className="px-4 py-2 rounded-lg bg-red-600 text-white disabled:opacity-50"
                >
                  {submittingClosedWithoutResolution ? "Submitting..." : "Escalate to L3"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default HelpdeskSection;
