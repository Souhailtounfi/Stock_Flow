import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Package,
  Tags,
  Truck,
  Users,
  FileText,
  Settings,
  Boxes,
} from 'lucide-react';

const Sidebar = () => {
  const { isAdmin } = useAuth();

  const links = [
    { to: '/dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
    { to: '/products', label: 'Produits', icon: Package },
    { to: '/categories', label: 'Catégories', icon: Tags },
    { to: '/suppliers', label: 'Fournisseurs', icon: Truck },
    { to: '/customers', label: 'Clients', icon: Users },
    { to: '/invoices', label: 'Factures', icon: FileText },
    { to: '/settings', label: 'Paramètres', icon: Settings },
  ];

  if (isAdmin) {
    links.splice(6, 0, { to: '/users', label: 'Utilisateurs', icon: Users });
  }

  return (
    <header className="glass border-bottom border-slate-800/60">
      <div className="container-fluid py-3">
        <div className="d-flex flex-column flex-lg-row align-items-lg-center justify-content-lg-between gap-3">
          <div className="d-flex align-items-center gap-3">
            <div className="d-flex align-items-center justify-content-center rounded-3" style={{ width: 42, height: 42, background: 'rgba(20, 184, 166, 0.12)', border: '1px solid rgba(20, 184, 166, 0.2)' }}>
              <Boxes className="text-emerald-500" size={20} />
            </div>
            <div>
              <p className="h5 fw-bold text-slate-200 mb-1">StockFlow Maroc</p>
              <p className="small text-slate-500 mb-0">Gestion commerciale et inventaire</p>
            </div>
          </div>

          <nav className="d-flex flex-wrap gap-2 align-items-center">
            {links.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    `d-flex align-items-center gap-2 px-3 py-2 rounded-pill text-sm fw-semibold transition-all ${
                      isActive
                        ? 'bg-emerald-500 text-white'
                        : 'text-slate-300 hover:bg-slate-800/70'
                    }`
                  }
                >
                  <Icon size={16} />
                  <span>{link.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Sidebar;
