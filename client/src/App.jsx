import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from './store/authStore';
import AppLayout from './components/layout/AppLayout';

const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const ProjectsPage = lazy(() => import('./pages/ProjectsPage'));
const ProjectDetailPage = lazy(() => import('./pages/ProjectDetailPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

const PageFallback = () => (
  <div
    style={{
      minHeight: '60vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 12,
      color: 'var(--text-muted)',
      fontSize: 14,
    }}
  >
    <span className="spinner" style={{ width: 22, height: 22 }} />
    <span>Chargement de la page...</span>
  </div>
);

const PrivateRoute = ({ children }) => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const PublicRoute = ({ children }) => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : children;
};

export default function App() {
  return (
    <Suspense fallback={<PageFallback />}>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
        <Route
          element={
            <PrivateRoute>
              <AppLayout />
            </PrivateRoute>
          }
        >
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/projects/:id" element={<ProjectDetailPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
}
