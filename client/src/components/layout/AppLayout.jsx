import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import MobileHeader from "./MobileHeader";
import useAuthStore from "../../store/authStore";
import useNotificationStore from "../../store/notificationStore";
import { connectSocket, joinUser, getSocket } from "../../services/socket";
import toast from "react-hot-toast";

export default function AppLayout() {
  const { user } = useAuthStore();
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

  return (
    <div className="app-layout">
      <Sidebar />
      <MobileHeader />
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
