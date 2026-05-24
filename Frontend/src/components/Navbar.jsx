import React from 'react';
import { useAuth } from '../context/AuthContext';

const Navbar = ({ title }) => {
  const { user, logout } = useAuth();

  return (
    <header className="glass border-bottom border-slate-800/60">
      <div className="container-fluid py-3 d-flex flex-column flex-md-row align-items-md-center justify-content-md-between gap-3">
        <div>
          <p className="text-slate-500 mb-1 small">Administration</p>
          <h2 className="h4 fw-bold text-slate-200 mb-0">{title}</h2>
        </div>

        <div className="d-flex align-items-center gap-3">
          <div className="d-none d-md-flex flex-column text-end">
            <span className="fw-semibold text-slate-200">{user?.username}</span>
            <span className="small text-slate-500">{user?.roleName}</span>
          </div>

          <div className="d-flex align-items-center justify-content-center rounded-circle bg-emerald-500/10 border border-emerald-500/20" style={{ width: 40, height: 40 }}>
            <span className="fw-bold text-emerald-600">{user?.username?.charAt(0).toUpperCase()}</span>
          </div>

          <button onClick={logout} className="btn btn-secondary btn-sm">
            Déconnexion
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
