import { io } from 'socket.io-client';

let socket = null;

const getSocketURL = () => {
  let url =
    import.meta.env.VITE_API_URL ||
    (import.meta.env.PROD
      ? "https://taskflow-production-fd38.up.railway.app"
      : "http://localhost:5000");

  url = url.trim();

  if (
    !url.startsWith("http://") &&
    !url.startsWith("https://") &&
    !url.startsWith("/")
  ) {
    url = `https://${url}`;
  }

  return url.replace(/\/api\/?$/, "");
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

export const joinUser = (userId) => {
  getSocket().emit('join_user', userId);
};
