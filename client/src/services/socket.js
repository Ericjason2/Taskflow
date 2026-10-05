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

let currentUserId = null;

export const getSocket = () => {
  if (!socket) {
    socket = io(getSocketURL(), { autoConnect: false });

    socket.on('connect', () => {
      if (currentUserId) {
        socket.emit('join_user', currentUserId);
      }
    });
  }
  return socket;
};

export const connectSocket = (userId = null) => {
  if (userId) currentUserId = userId;
  const s = getSocket();
  if (!s.connected) s.connect();
  if (userId && s.connected) {
    s.emit('join_user', userId);
  }
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
  currentUserId = userId;
  const s = getSocket();
  if (s.connected) {
    s.emit('join_user', userId);
  }
};
