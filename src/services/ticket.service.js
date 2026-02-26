import api from "./api";

const normalizeBaseUrl = (value) =>
  typeof value === "string" ? value.replace(/\/+$/, "") : "";

const resolveBackendBaseUrl = () => {
  const runtimeBase = normalizeBaseUrl(
    typeof window !== "undefined" ? window.RUNTIME_CONFIG?.BACKEND_URL : ""
  );
  if (runtimeBase) return runtimeBase;
  const apiBase = normalizeBaseUrl(api.defaults?.baseURL || "");
  return apiBase.replace(/\/api$/i, "");
};

export const resolveAttachmentUrl = (url) => {
  const raw = String(url || "").trim();
  if (!raw) return "";
  if (/^https?:\/\//i.test(raw)) return raw;
  const base = resolveBackendBaseUrl();
  if (!base) return raw;
  return raw.startsWith("/") ? `${base}${raw}` : `${base}/${raw}`;
};

export const createTicket = async (payload) => {
  const isMultipart = payload instanceof FormData;
  const response = await api.post("/tickets", payload, {
    headers: isMultipart ? { "Content-Type": "multipart/form-data" } : undefined,
  });
  return response.data;
};

export const createPublicTicket = async (payload) => {
  const isMultipart = payload instanceof FormData;
  const response = await api.post("/public/tickets", payload, {
    headers: isMultipart ? { "Content-Type": "multipart/form-data" } : undefined,
  });
  return response.data;
};

export const getMyTickets = async (params = {}) => {
  const response = await api.get("/tickets/my", { params });
  return response.data;
};

export const getTicketTaxonomy = async () => {
  const response = await api.get("/tickets/meta/taxonomy");
  return response.data;
};

export const getTicketById = async (id) => {
  const response = await api.get(`/tickets/${id}`);
  return response.data;
};

export const addTicketComment = async (id, payload) => {
  const isMultipart = payload instanceof FormData;
  const response = await api.post(`/tickets/${id}/comment`, payload, {
    headers: isMultipart ? { "Content-Type": "multipart/form-data" } : undefined,
  });
  return response.data;
};

export const requestTicketFollowUp = async (id) => {
  const response = await api.post(`/tickets/${id}/follow-up`);
  return response.data;
};

export const markTicketClosedWithoutResolution = async (id, payload) => {
  const response = await api.post(`/tickets/${id}/closed-without-resolution`, payload);
  return response.data;
};
