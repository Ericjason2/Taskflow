import { useEffect, useState, Suspense } from "react";
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
      const socket = connectSocket(user.id);
      joinUser(user.id);
      fetchNotifications();

      // Silent background poll every 25 seconds for maximum reliability across devices
      const pollTimer = setInterval(() => {
        fetchNotifications();
      }, 25000);

      const seenNotifs = new Set();
      const handleNotif = (notif) => {
        if (!notif) return;
        const nid = notif.id || notif.createdAt;
        if (seenNotifs.has(nid)) return;
        seenNotifs.add(nid);
        addIncomingNotification(notif);
        toast(notif.message, {
          id: `notif-${nid}`,
          duration: 4000,
        });
      };

      socket.on("new_notification", handleNotif);
      socket.on(`notif_user_${user.id}`, handleNotif);

      return () => {
        clearInterval(pollTimer);
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
          <Suspense
            fallback={
              <div style={{ padding: "28px 36px", display: "flex", flexDirection: "column", gap: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ width: 220, height: 28, background: "var(--bg-subtle)", borderRadius: 6 }} />
                  <div style={{ width: 120, height: 36, background: "var(--bg-subtle)", borderRadius: 8 }} />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} style={{ width: "100%", height: 90, background: "var(--bg-subtle)", borderRadius: 10 }} />
                  ))}
                </div>
                <div style={{ width: "100%", height: 320, background: "var(--bg-subtle)", borderRadius: 12 }} />
              </div>
            }
          >
            <Outlet />
          </Suspense>
        </main>
      </div>
      <MobileHeader />
      <CommandPalette isOpen={cmdOpen} onClose={() => setCmdOpen(false)} />
    </div>
  );
}
