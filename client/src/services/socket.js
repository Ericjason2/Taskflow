import { io } from 'socket.io-client';

let socket = null;

const getSocketURL = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL.replace(/\/api\/?$/, "");
  }
  return "http://localhost:5000";
};

export const getSocket = () => {
  if (!socket) {
    socket = io(getSocketURL(), { autoConnect: false });
  }
  return socket;
};

export const connectSocket = () => {
  const s = getSocket();
  if (!s.connected) s.connect();
  return s;
};

export const disconnectSocket = () => {
  if (socket?.connected) socket.disconnect();
};

export const joinProject = (projectId) => {
  getSocket().emit('join_project', projectId);
};

export const leaveProject = (projectId) => {
  getSocket().emit('leave_project', projectId);
};
