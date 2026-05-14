import { create } from 'zustand';
import { projectAPI, taskAPI } from '../services/api';

const useProjectStore = create((set, get) => ({
  projects: [],
  currentProject: null,
  tasks: [],
  stats: null,
  activities: [],
  isLoading: false,
  total: 0,
  page: 1,
  totalPages: 1,

  fetchProjects: async (params = {}) => {
    set({ isLoading: true });
    try {
      const { data } = await projectAPI.getAll(params);
      set({
        projects: data.data,
        total: data.total,
        page: data.page,
        totalPages: data.totalPages,
        isLoading: false,
      });
    } catch (err) {
      set({ isLoading: false });
      throw err;
    }
  },

  fetchProject: async (id) => {
    set({ isLoading: true });
    try {
      const { data } = await projectAPI.getOne(id);
      set({ currentProject: data.data, tasks: data.data.taches || [], isLoading: false });
      return data.data;
    } catch (err) {
      set({ isLoading: false });
      throw err;
    }
  },

  createProject: async (projectData) => {
    const { data } = await projectAPI.create(projectData);
    set((s) => ({ projects: [data.data, ...s.projects] }));
    return data.data;
  },

  updateProject: async (id, projectData) => {
    const { data } = await projectAPI.update(id, projectData);
    set((s) => ({
      projects: s.projects.map((p) => (p.id === id ? { ...p, ...data.data } : p)),
      currentProject: s.currentProject?.id === id ? { ...s.currentProject, ...data.data } : s.currentProject,
    }));
    return data.data;
  },

  deleteProject: async (id) => {
    await projectAPI.delete(id);
    set((s) => ({ projects: s.projects.filter((p) => p.id !== id) }));
  },

  fetchStats: async () => {
    try {
      const { data } = await projectAPI.getStats();
      set({ stats: data.data });
    } catch (_) {}
  },

  fetchActivities: async () => {
    try {
      const { data } = await projectAPI.getActivities();
      set({ activities: data.data });
    } catch (_) {}
  },

  // Tasks
  fetchTasks: async (projectId, params = {}) => {
    const { data } = await taskAPI.getAll(projectId, params);
    set({ tasks: data.data });
    return data.data;
  },

  createTask: async (projectId, taskData) => {
    const { data } = await taskAPI.create(projectId, taskData);
    set((s) => ({ tasks: [...s.tasks, data.data] }));
    return data.data;
  },

  updateTask: async (projectId, taskId, taskData) => {
    const { data } = await taskAPI.update(projectId, taskId, taskData);
    set((s) => ({ tasks: s.tasks.map((t) => (t.id === taskId ? data.data : t)) }));
    return data.data;
  },

  updateTaskStatus: async (projectId, taskId, statut) => {
    await taskAPI.updateStatus(projectId, taskId, statut);
    set((s) => ({ tasks: s.tasks.map((t) => (t.id === taskId ? { ...t, statut } : t)) }));
  },

  deleteTask: async (projectId, taskId) => {
    await taskAPI.delete(projectId, taskId);
    set((s) => ({ tasks: s.tasks.filter((t) => t.id !== taskId) }));
  },

  setTasksLocal: (tasks) => set({ tasks }),
}));

export default useProjectStore;
