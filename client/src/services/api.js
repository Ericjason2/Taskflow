import axios from "axios";

// Get API URL from environment or use relative path for local dev
const getBaseURL = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  // In production without env var, use the current origin
  // In dev, Vite proxy will handle /api routes
  return "/api";
};

const api = axios.create({
  baseURL: getBaseURL(),
  headers: { "Content-Type": "application/json" },
});

// Attach token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("tf_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      // Don't redirect if it's a login/register error
      const isAuthEndpoint =
        err.config?.url?.includes("/auth/login") ||
        err.config?.url?.includes("/auth/register");
      if (!isAuthEndpoint) {
        localStorage.removeItem("tf_token");
        localStorage.removeItem("tf_user");
        window.location.href = "/login";
      }
    }
    return Promise.reject(err);
  },
);

// Auth
export const authAPI = {
  register: (data) => api.post("/auth/register", data),
  login: (data) => api.post("/auth/login", data),
  getMe: () => api.get("/auth/me"),
  updateProfile: (data) => api.put("/auth/profile", data),
  changePassword: (data) => api.put("/auth/password", data),
  getUsers: () => api.get("/auth/users"),
  deleteUser: (userId) => api.delete(`/auth/users/${userId}`),
};

// Projects
export const projectAPI = {
  getAll: (params) => api.get("/projects", { params }),
  getOne: (id) => api.get(`/projects/${id}`),
  create: (data) => api.post("/projects", data),
  update: (id, data) => api.put(`/projects/${id}`, data),
  delete: (id) => api.delete(`/projects/${id}`),
  addMember: (id, data) => api.post(`/projects/${id}/members`, data),
  removeMember: (id, userId) => api.delete(`/projects/${id}/members/${userId}`),
  getStats: () => api.get("/projects/stats"),
  getActivities: () => api.get("/projects/activities"),
};

// Tasks
export const taskAPI = {
  getAll: (projectId, params) =>
    api.get(`/projects/${projectId}/tasks`, { params }),
  getOne: (projectId, taskId) =>
    api.get(`/projects/${projectId}/tasks/${taskId}`),
  create: (projectId, data) => api.post(`/projects/${projectId}/tasks`, data),
  update: (projectId, taskId, data) =>
    api.put(`/projects/${projectId}/tasks/${taskId}`, data),
  delete: (projectId, taskId) =>
    api.delete(`/projects/${projectId}/tasks/${taskId}`),
  updateStatus: (projectId, taskId, statut) =>
    api.patch(`/projects/${projectId}/tasks/${taskId}/status`, { statut }),
  addComment: (projectId, taskId, data) =>
    api.post(`/projects/${projectId}/tasks/${taskId}/comments`, data),
  deleteComment: (projectId, taskId, commentId) =>
    api.delete(`/projects/${projectId}/tasks/${taskId}/comments/${commentId}`),
};

export default api;
