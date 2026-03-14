import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { createPublicTicket, getTicketTaxonomy } from "../../services/ticket.service";

const DEFAULT_FORM = {
  name: "",
  email: "",
  phone: "",
  queryCategory: "",
  querySubCategory: "",
  description: "",
  captchaToken: "",
  files: [],
};

export default function PublicHelpdeskIntake() {
  const [form, setForm] = useState(DEFAULT_FORM);
  const [loadingTaxonomy, setLoadingTaxonomy] = useState(false);
  const [taxonomy, setTaxonomy] = useState({ categories: [] });
  const [submitting, setSubmitting] = useState(false);
  const [submittedTicketId, setSubmittedTicketId] = useState("");

  const categories = Array.isArray(taxonomy?.categories) ? taxonomy.categories : [];
  const selectedCategory = useMemo(
    () =>
      categories.find(
        (entry) =>
          String(entry?.name || "").toLowerCase() ===
          String(form.queryCategory || "").toLowerCase()
      ) || null,
    [categories, form.queryCategory]
  );
  const subCategoryOptions = Array.isArray(selectedCategory?.subCategories)
    ? selectedCategory.subCategories
    : [];

  useEffect(() => {
    const loadTaxonomy = async () => {
      setLoadingTaxonomy(true);
      try {
        const response = await getTicketTaxonomy();
        setTaxonomy(response?.taxonomy || { categories: [] });
      } catch (_error) {
        toast.error("Failed to load helpdesk categories.");
        setTaxonomy({ categories: [] });
      } finally {
        setLoadingTaxonomy(false);
      }
    };
    loadTaxonomy();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (
      !form.name.trim() ||
      !form.email.trim() ||
      !form.phone.trim() ||
      !form.queryCategory.trim() ||
      !form.querySubCategory.trim() ||
      !form.description.trim()
    ) {
      toast.error("Please complete all required fields.");
      return;
    }

    const payload = new FormData();
    payload.append("name", form.name.trim());
    payload.append("email", form.email.trim());
    payload.append("phone", form.phone.trim());
    payload.append("queryCategory", form.queryCategory.trim());
    payload.append("querySubCategory", form.querySubCategory.trim());
    payload.append("description", form.description.trim());
    if (form.captchaToken.trim()) {
      payload.append("captchaToken", form.captchaToken.trim());
    }
    form.files.forEach((file) => {
      payload.append("attachments", file);
    });

    setSubmitting(true);
    try {
      const response = await createPublicTicket(payload);
      setSubmittedTicketId(response?.ticketId || "");
      setForm(DEFAULT_FORM);
      toast.success(response?.message || "Ticket submitted successfully.");
    } catch (error) {
      toast.error(
        error?.response?.data?.error ||
          error?.response?.data?.message ||
          "Failed to submit ticket."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-3xl mx-auto px-4">
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
          <h1 className="text-2xl font-bold text-gray-900">Helpdesk Support</h1>
          <p className="text-sm text-gray-600 mt-1">
            Submit your query. Our support team will review and respond.
          </p>

          {submittedTicketId ? (
            <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-800 text-sm">
              Ticket submitted successfully. Your Ticket ID is{" "}
              <span className="font-semibold">{submittedTicketId}</span>.
            </div>
          ) : null}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Name *</label>
                <input
                  value={form.name}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, name: event.target.value }))
                  }
                  className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Email *</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, email: event.target.value }))
                  }
                  className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Phone *</label>
                <input
                  value={form.phone}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, phone: event.target.value }))
                  }
                  className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Query Category *</label>
                <select
                  value={form.queryCategory}
                  onChange={(event) =>
                    setForm((prev) => ({
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
                    {loadingTaxonomy ? "Loading categories..." : "Select category"}
                  </option>
                  {categories.map((entry) => (
                    <option key={entry.name} value={entry.name}>
                      {entry.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Query Sub-category *
                </label>
                <select
                  value={form.querySubCategory}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, querySubCategory: event.target.value }))
                  }
                  className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2"
                  required
                  disabled={!form.queryCategory}
                >
                  <option value="">Select sub-category</option>
                  {subCategoryOptions.map((subCategory) => (
                    <option key={subCategory} value={subCategory}>
                      {subCategory}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Description *</label>
              <textarea
                value={form.description}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, description: event.target.value }))
                }
                rows={6}
                maxLength={5000}
                className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2"
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">
                Attachments (optional)
              </label>
              <input
                type="file"
                multiple
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    files: Array.from(event.target.files || []),
                  }))
                }
                className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">
                Captcha Token (optional)
              </label>
              <input
                value={form.captchaToken}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, captchaToken: event.target.value }))
                }
                className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2"
                placeholder="Only required when captcha is enabled server-side"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2 rounded-lg bg-primary text-white disabled:opacity-50"
              >
                {submitting ? "Submitting..." : "Submit Ticket"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
