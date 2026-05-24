import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import Spinner from '../components/Spinner';

const AdminLayout = ({ children, title }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center">
        <Spinner size="lg" message="Authentification de la session..." />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-vh-100">
      <Sidebar />

      <div className="d-flex flex-column">
        <Navbar title={title} />

        <main className="app-shell">
          <div className="container-fluid px-3 px-lg-4">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
