import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './layouts/DashboardLayout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CheckIn from './pages/CheckIn';
import Membresias from './pages/Membresias';
import Ventas from './pages/Ventas';
import Usuarios from './pages/Usuarios';
import Gimnasios from './pages/Gimnasios';
import Sucursales from './pages/Sucursales';
import Productos from './pages/Productos';
import TiposMembresia from './pages/TiposMembresia';
import Reportes from './pages/Reportes';
import Inicio from './pages/Inicio';
import LoadingSpinner from './components/LoadingSpinner';
import { BranchProvider } from './context/BranchContext'; // Added
import './App.css';

const HomeRedirect = () => {
  const { user } = useAuth();
  if (user?.roles?.includes('CLIENTE')) {
    return <Inicio />;
  }
  return <Dashboard />;
};

function App() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <BranchProvider>
      <Routes>
        {/* Public Routes */}
        <Route
          path="/login"
          element={
            isAuthenticated ? <Navigate to="/" replace /> : <Login />
          }
        />
        <Route
          path="/register"
          element={
            isAuthenticated ? <Navigate to="/" replace /> : <Register />
          }
        />

        {/* Protected Routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <div className="home-redirect-wrapper">
                  <HomeRedirect />
                </div>
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/inicio"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <Inicio />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/checkin"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <CheckIn />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/membresias"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <Membresias />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/ventas"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <Ventas />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/usuarios"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <Usuarios />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/gimnasios"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <Gimnasios />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/sucursales"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <Sucursales />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/tipos-membresia"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <TiposMembresia />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/reportes"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <Reportes />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/productos"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <Productos />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        {/* Catch all - redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BranchProvider>
  );
}

export default App;
