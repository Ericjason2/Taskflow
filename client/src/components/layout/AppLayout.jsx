import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import MobileHeader from './MobileHeader';

export default function AppLayout() {
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
