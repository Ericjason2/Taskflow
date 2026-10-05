import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import MobileHeader from "./MobileHeader";
import AppTopBar from "./AppTopBar";
import CommandPalette from "../common/CommandPalette";
import useAuthStore from "../../store/authStore";
import useNotificationStore from "../../store/notificationStore";
import { connectSocket, joinUser, getSocket } from "../../services/socket";
import toast from "react-hot-toast";

export default function AppLayout() {
  const { user } = useAuthStore();
  const [cmdOpen, setCmdOpen] = useState(false);
  const { addIncomingNotification, fetchNotifications } =
    useNotificationStore();

  useEffect(() => {
    if (user?.id) {
      const socket = connectSocket();
      joinUser(user.id);
      fetchNotifications();

      const handleNotif = (notif) => {
        addIncomingNotification(notif);
        toast(notif.message, {
          id: `notif-${notif.id || Date.now()}`,
          duration: 4000,
        });
      };

      socket.on("new_notification", handleNotif);
      socket.on(`notif_user_${user.id}`, handleNotif);

      return () => {
        socket.off("new_notification", handleNotif);
        socket.off(`notif_user_${user.id}`, handleNotif);
      };
    }
  }, [user?.id]);

  // Global Ctrl+K / Cmd+K listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCmdOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="app-main-wrapper">
        <AppTopBar onOpenSearch={() => setCmdOpen(true)} />
        <main className="main-content">
          <Outlet />
        </main>
      </div>
      <MobileHeader />
      <CommandPalette isOpen={cmdOpen} onClose={() => setCmdOpen(false)} />
    </div>
  );
}
