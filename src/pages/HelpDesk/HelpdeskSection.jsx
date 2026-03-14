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
  Headphones,
  TicketCheck,
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

const DEFAULT_FORM = {
  title: "",
  description: "",
  queryCategory: "",
  querySubCategory: "",
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
      return "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400";
    case "in-progress":
      return "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400";
    case "resolved":
      return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400";
    case "closed":
      return "bg-gray-200 text-gray-700 dark:bg-gray-600 dark:text-gray-300";
    default:
      return "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400";
  }
};

const priorityClass = (priority) => {
  switch (String(priority || "").toLowerCase()) {
    case "high":
      return "text-red-600 dark:text-red-400";
    case "medium":
      return "text-amber-600 dark:text-amber-400";
    case "low":
      return "text-emerald-600 dark:text-emerald-400";
    default:
      return "text-gray-600 dark:text-gray-400";
  }
};

const helpTypeBadgeClass = (helpType) => {
  if (String(helpType || "").toLowerCase() === "technical") {
    return "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400";
  }
  return "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-400";
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

const SectionHeader = ({ icon: Icon, title, gradient }) => (
  <div className={`relative overflow-hidden px-6 py-4 ${gradient}`}>
    <div className="absolute -top-6 -right-6 w-20 h-20 bg-white/10 rounded-full" />
    <div className="absolute -bottom-4 right-12 w-12 h-12 bg-white/5 rounded-full" />
    <div className="relative z-10 flex items-center gap-3">
      <div className="w-9 h-9 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
        <Icon className="w-5 h-5 text-white" />
      </div>
      <h2 className="text-lg font-bold text-white tracking-tight">{title}</h2>
    </div>
  </div>
);

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
      !createForm.queryCategory.trim() ||
      !createForm.querySubCategory.trim()
    ) {
      toast.error(
        "Title, description, query category and sub-category are required."
      );
      return;
    }

    const formData = new FormData();
    formData.append("title", createForm.title.trim());
    formData.append("description", createForm.description.trim());
    formData.append("queryCategory", createForm.queryCategory.trim());
    formData.append("querySubCategory", createForm.querySubCategory.trim());
    formData.append("category", createForm.queryCategory.trim());
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-6">
      <div className="max-w-7xl mx-auto px-4 space-y-6">
        {/* Back Button */}
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="p-2 rounded-full bg-white dark:bg-gray-800 shadow-sm dark:shadow-lg hover:bg-gray-50 dark:hover:bg-gray-700 border border-transparent dark:border-gray-700"
        >
          <ArrowLeft className="h-5 w-5 text-gray-700 dark:text-gray-300" />
        </button>

        {/* Page Header Gradient Banner */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-500 px-8 py-8 shadow-lg">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full" />
          <div className="absolute -bottom-8 right-20 w-24 h-24 bg-white/5 rounded-full" />
          <div className="relative z-10 flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Headphones className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Helpdesk</h1>
                <p className="text-white/80 text-sm mt-1.5">Raise and track your support tickets</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/20 backdrop-blur-sm text-white font-semibold hover:bg-white/30 transition-colors border border-white/25 shadow-sm"
            >
              <Plus className="h-4 w-4" /> Raise Ticket
            </button>
          </div>
        </div>

        {/* Status Stat Cards with Colored Top Borders */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-tertiary/10 border-t-4 border-t-emerald-500 hover:shadow-md transition-shadow">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Total</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{summary.total}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-tertiary/10 border-t-4 border-t-amber-500 hover:shadow-md transition-shadow">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Pending</p>
            <p className="text-2xl font-bold text-amber-700 dark:text-amber-400 mt-1">{summary.pending}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-tertiary/10 border-t-4 border-t-blue-500 hover:shadow-md transition-shadow">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">In Progress</p>
            <p className="text-2xl font-bold text-blue-700 dark:text-blue-400 mt-1">{summary.inProgress}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-tertiary/10 border-t-4 border-t-green-500 hover:shadow-md transition-shadow">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Resolved</p>
            <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-400 mt-1">{summary.resolved}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-tertiary/10 border-t-4 border-t-gray-400 hover:shadow-md transition-shadow">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Closed</p>
            <p className="text-2xl font-bold text-gray-700 dark:text-gray-300 mt-1">{summary.closed}</p>
          </div>
        </div>

        {/* Ticket List Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-tertiary/10 overflow-hidden">
          <SectionHeader
            icon={TicketCheck}
            title="Support Tickets"
            gradient="bg-gradient-to-r from-violet-500 to-purple-600"
          />

          <div className="p-4">
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
                        : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="relative w-full md:w-72">
                <Search className="h-4 w-4 text-gray-400 dark:text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  value={searchInput}
                  onChange={(event) => setSearchInput(event.target.value)}
                  placeholder="Search by Ticket ID/title/category"
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-primary/40 focus:outline-none"
                />
              </div>
            </div>

            {loading ? (
              <div className="py-16 text-center text-gray-600 dark:text-gray-400">Loading tickets...</div>
            ) : tickets.length === 0 ? (
              <div className="py-16 text-center text-gray-600 dark:text-gray-400">
                <AlertCircle className="h-8 w-8 mx-auto mb-2 text-gray-400 dark:text-gray-500" />
                No tickets found.
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead>
                      <tr className="text-left text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                        <th className="px-3 py-2">Ticket</th>
                        <th className="px-3 py-2">Category / Sub-category</th>
                        <th className="px-3 py-2">Status</th>
                        <th className="px-3 py-2">Escalation</th>
                        <th className="px-3 py-2">Last Update</th>
                        <th className="px-3 py-2">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                      {tickets.map((ticket) => (
                        <tr key={ticket._id || ticket.ticketId} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                          <td className="px-3 py-3">
                            <p className="text-sm font-semibold text-gray-900 dark:text-white">{ticket.ticketId}</p>
                            <p className="text-sm text-gray-700 dark:text-gray-300">{ticket.title}</p>
                          </td>
                          <td className="px-3 py-3 text-sm text-gray-700 dark:text-gray-300">
                            <div>{ticket.queryCategory || ticket.category || "-"}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {ticket.querySubCategory || "-"}
                            </div>
                          </td>
                          <td className="px-3 py-3 text-sm">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusBadgeClass(ticket.status)}`}>
                              {ticket.status}
                            </span>
                          </td>
                          <td className="px-3 py-3 text-xs text-gray-700 dark:text-gray-300">
                            <div className="font-semibold">
                              {ticket.escalationLevel || "-"}
                            </div>
                            {Array.isArray(ticket.frontlineLevels) &&
                            ticket.frontlineLevels.length > 1 ? (
                              <div className="text-[11px] text-gray-500 dark:text-gray-400">
                                Eligible: {ticket.frontlineLevels.join(" / ")}
                              </div>
                            ) : null}
                            <div>{ticket.routedToRole || "-"}</div>
                          </td>
                          <td className="px-3 py-3 text-sm text-gray-700 dark:text-gray-300">{formatDate(ticket.lastUpdateAt || ticket.updatedAt)}</td>
                          <td className="px-3 py-3 text-sm">
                            <button
                              type="button"
                              onClick={() => loadTicketDetail(ticket._id || ticket.ticketId)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
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
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Page {pagination.page} of {pagination.totalPages}
                    {refreshing ? " (refreshing...)" : ""}
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={!pagination.hasPrev}
                      onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                      className="px-3 py-1.5 rounded border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-40"
                    >
                      Prev
                    </button>
                    <button
                      type="button"
                      disabled={!pagination.hasNext}
                      onClick={() => setPage((prev) => prev + 1)}
                      className="px-3 py-1.5 rounded border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-40"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/40 dark:bg-black/60 z-40 flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-white dark:bg-gray-800 rounded-xl shadow-xl dark:shadow-2xl border border-transparent dark:border-gray-700">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Raise New Ticket</h3>
              <button type="button" onClick={() => setShowCreateModal(false)} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTicket} className="p-5 space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Title</label>
                <input
                  value={createForm.title}
                  onChange={(event) => setCreateForm((prev) => ({ ...prev, title: event.target.value }))}
                  maxLength={180}
                  className="mt-1 w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                  placeholder="Short summary of the issue"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Query Category</label>
                  <select
                    value={createForm.queryCategory}
                    onChange={(event) =>
                      setCreateForm((prev) => ({
                        ...prev,
                        queryCategory: event.target.value,
                        querySubCategory: "",
                      }))
                    }
                    className="mt-1 w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
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
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Query Sub-category</label>
                  <select
                    value={createForm.querySubCategory}
                    onChange={(event) =>
                      setCreateForm((prev) => ({
                        ...prev,
                        querySubCategory: event.target.value,
                      }))
                    }
                    className="mt-1 w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
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
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                <textarea
                  value={createForm.description}
                  onChange={(event) => setCreateForm((prev) => ({ ...prev, description: event.target.value }))}
                  rows={5}
                  maxLength={5000}
                  className="mt-1 w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                  placeholder="Explain the issue with relevant details"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Attachments (optional)</label>
                {createForm.files.length > 0 && (
                  <div className="mt-2 space-y-1.5">
                    {createForm.files.map((file, idx) => (
                      <div key={idx} className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                        <FileText className="h-4 w-4 text-gray-400 flex-shrink-0" />
                        <span className="text-sm text-gray-700 dark:text-gray-300 truncate flex-1">{file.name}</span>
                        <span className="text-xs text-gray-400 flex-shrink-0">{(file.size / 1024).toFixed(0)} KB</span>
                        <button
                          type="button"
                          onClick={() => setCreateForm((prev) => ({ ...prev, files: prev.files.filter((_, i) => i !== idx) }))}
                          className="p-0.5 rounded hover:bg-red-100 dark:hover:bg-red-900/30 text-gray-400 hover:text-red-500"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <label className="mt-2 inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed border-gray-300 dark:border-gray-600 text-sm text-gray-600 dark:text-gray-400 hover:border-primary hover:text-primary dark:hover:text-primary cursor-pointer transition-colors">
                  <Plus className="h-4 w-4" />
                  {createForm.files.length > 0 ? "Add More Files" : "Choose Files"}
                  <input
                    type="file"
                    multiple
                    className="hidden"
                    onChange={(event) => {
                      const newFiles = Array.from(event.target.files || []);
                      if (newFiles.length > 0) {
                        setCreateForm((prev) => ({ ...prev, files: [...prev.files, ...newFiles] }));
                      }
                      event.target.value = "";
                    }}
                  />
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button type="button" onClick={() => setShowCreateModal(false)} className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
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
        <div className="fixed inset-0 bg-black/40 dark:bg-black/60 z-50 flex justify-end">
          <div className="w-full max-w-2xl bg-white dark:bg-gray-800 h-full overflow-y-auto">
            <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between sticky top-0 bg-white dark:bg-gray-800 z-10">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Ticket Details</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{selectedTicket?.ticketId || selectedTicketId}</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedTicketId("");
                  setSelectedTicket(null);
                  setCommentForm(DEFAULT_COMMENT_FORM);
                }}
                className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {loadingTicket || !selectedTicket ? (
              <div className="p-8 text-center text-gray-600 dark:text-gray-400">Loading ticket...</div>
            ) : (
              <div className="p-5 space-y-6">
                <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusBadgeClass(selectedTicket.status)}`}>
                      {selectedTicket.status}
                    </span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {selectedTicket.queryCategory || selectedTicket.category}
                    </span>
                  </div>
                  <h4 className="text-base font-semibold text-gray-900 dark:text-white">{selectedTicket.title}</h4>
                  <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{selectedTicket.description}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Sub-category: {selectedTicket.querySubCategory || "-"}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Escalation: {selectedTicket.escalationLevel || "-"} /{" "}
                    {selectedTicket.routedToRole || "-"}
                  </p>
                  {Array.isArray(selectedTicket.frontlineLevels) &&
                  selectedTicket.frontlineLevels.length > 1 ? (
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Eligible frontlines: {selectedTicket.frontlineLevels.join(" / ")}
                    </p>
                  ) : null}
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Follow-up eligible at: {formatDate(selectedTicket.followUpEligibleAt)}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Resolution Status: {selectedTicket.resolutionStatus || "Unresolved"}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500">Last update: {formatDate(selectedTicket.lastUpdateAt || selectedTicket.updatedAt)}</p>
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
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-400 disabled:opacity-50"
                  >
                    <Clock3 className="h-4 w-4" />
                    {submittingFollowUp ? "Requesting..." : "Follow up after 48hrs"}
                  </button>
                  <button
                    type="button"
                    disabled={String(selectedTicket.status || "") !== "Closed"}
                    onClick={() => setShowClosedWithoutResolutionModal(true)}
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-red-300 dark:border-red-700 text-red-700 dark:text-red-400 disabled:opacity-50"
                  >
                    <AlertCircle className="h-4 w-4" />
                    Closed without resolution
                  </button>
                </div>

                <div>
                  <h5 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">Ticket Attachments</h5>
                  {selectedTicket.attachments?.length ? (
                    <div className="space-y-2">
                      {selectedTicket.attachments.map((attachment, index) => (
                        <a
                          key={`${attachment.url}-${index}`}
                          href={resolveAttachmentUrl(attachment.url)}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-2 text-sm text-primary dark:text-primary hover:underline"
                        >
                          <FileText className="h-4 w-4" />
                          {attachment.originalName || `Attachment ${index + 1}`}
                        </a>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400">No attachments</p>
                  )}
                </div>

                <div>
                  <h5 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">Conversation</h5>
                  <div className="space-y-3">
                    {(selectedTicket.comments || []).length === 0 ? (
                      <p className="text-sm text-gray-500 dark:text-gray-400">No comments yet.</p>
                    ) : (
                      selectedTicket.comments.map((comment) => {
                        const isMine = String(comment?.by?._id || comment?.by || "") === String(user?._id || "");
                        return (
                          <div
                            key={comment._id}
                            className={`rounded-lg border px-3 py-2 ${isMine ? "bg-blue-50 dark:bg-blue-900/30 border-blue-100 dark:border-blue-800" : "bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700"}`}
                          >
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                                {comment?.by?.name || "User"} ({comment.byRole || "user"})
                              </p>
                              <p className="text-[11px] text-gray-500 dark:text-gray-500">{formatDate(comment.createdAt)}</p>
                            </div>
                            {comment.message ? (
                              <p className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap">{comment.message}</p>
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

                <form onSubmit={handleAddComment} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 space-y-3">
                  <label className="text-sm font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
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
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
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
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-gray-100 dark:file:bg-gray-600 file:text-gray-700 dark:file:text-gray-300"
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
        <div className="fixed inset-0 bg-black/40 dark:bg-black/60 z-[60] flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white dark:bg-gray-800 rounded-xl shadow-xl dark:shadow-2xl border border-transparent dark:border-gray-700">
            <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                Closed Without Resolution
              </h4>
              <button
                type="button"
                className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
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
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
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
                  className="mt-1 w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
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
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
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
                  className="mt-1 w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
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
                  className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
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
