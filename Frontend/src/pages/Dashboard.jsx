import React, { useEffect, useState } from 'react';
import AdminLayout from '../layouts/AdminLayout';
import { getDashboardStats } from '../api/api';
import {
  Package, FileText, DollarSign, AlertTriangle,
  TrendingUp, ArrowUpRight, Layers, Users
} from 'lucide-react';
import Spinner from '../components/Spinner';

const StatCard = ({ label, value, icon: Icon, color, sub, trend }) => (
  <div className="card border-0 shadow-sm surface-panel-soft h-100">
    <div className="card-body p-4 p-xl-5">
      <div className="d-flex justify-content-between align-items-start mb-4">
        <div className="d-flex align-items-center justify-content-center rounded-4" style={{ width: 44, height: 44, background: 'rgba(226, 232, 240, 0.85)' }}>
          <Icon className={color} size={20} />
        </div>
        {trend !== undefined && (
          <span className="badge rounded-pill bg-success-subtle text-success d-flex align-items-center gap-1">
            <ArrowUpRight size={14} /> {trend}%
          </span>
        )}
      </div>
      <p className="h2 fw-bold mb-2 text-slate-200">{value ?? '—'}</p>
      <p className="text-slate-500 mb-1">{label}</p>
      {sub && <p className="small text-slate-500 mb-0">{sub}</p>}
    </div>
  </div>
);

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardStats()
      .then((r) => setStats(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <AdminLayout title="Tableau de bord">
      <div className="d-flex flex-column gap-4">
        <div>
          <p className="text-slate-500 mb-1">Vue d’ensemble de l’activité</p>
          <h2 className="h3 fw-bold mb-0 page-title text-slate-200">StockFlow Maroc</h2>
        </div>

        {loading ? (
          <div className="d-flex justify-content-center py-5">
            <Spinner size="lg" message="Chargement des statistiques..." />
          </div>
        ) : (
          <>
            <div className="row g-3">
              <div className="col-12 col-sm-6 col-xl-3">
                <StatCard label="Produits" value={stats?.totalProducts} icon={Package} color="text-emerald-500" sub="SKU actifs en stock" trend={12} />
              </div>
              <div className="col-12 col-sm-6 col-xl-3">
                <StatCard label="Factures" value={stats?.totalInvoices} icon={FileText} color="text-sky-400" sub="Historique des ventes" trend={8} />
              </div>
              <div className="col-12 col-sm-6 col-xl-3">
                <StatCard label="Chiffre d’affaires" value={stats?.totalRevenue != null ? `${Number(stats.totalRevenue).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} MAD` : '—'} icon={DollarSign} color="text-violet-400" sub="Cumul des ventes" trend={21} />
              </div>
              <div className="col-12 col-sm-6 col-xl-3">
                <StatCard label="Alertes de stock faible" value={stats?.lowStockCount} icon={AlertTriangle} color="text-amber-400" sub="Produits à réapprovisionner" />
              </div>
            </div>

            <div className="row g-3">
              <div className="col-12 col-md-4">
                <StatCard label="Catégories" value={stats?.totalCategories} icon={Layers} color="text-teal-400" />
              </div>
              <div className="col-12 col-md-4">
                <StatCard label="Clients" value={stats?.totalCustomers} icon={Users} color="text-pink-400" />
              </div>
              <div className="col-12 col-md-4">
                <StatCard label="Revenus du mois" value={stats?.monthlyRevenue != null ? `${Number(stats.monthlyRevenue).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} MAD` : '—'} icon={TrendingUp} color="text-orange-400" />
              </div>
            </div>

            {stats?.lowStockProducts?.length > 0 && (
              <div className="card border-0 shadow-sm surface-panel-soft">
                <div className="card-body p-4 p-xl-5">
                  <div className="d-flex align-items-center gap-2 mb-4">
                    <AlertTriangle className="text-amber-400" size={20} />
                    <h3 className="h5 fw-bold mb-0 text-slate-200">Produits à stock faible</h3>
                  </div>
                  <div className="table-responsive">
                    <table className="table table-borderless align-middle mb-0">
                      <thead>
                        <tr className="text-slate-500">
                          <th>Produit</th>
                          <th>Catégorie</th>
                          <th className="text-end">Stock</th>
                          <th className="text-end">Prix</th>
                        </tr>
                      </thead>
                      <tbody>
                        {stats.lowStockProducts.map((p) => (
                          <tr key={p.id}>
                            <td className="fw-semibold text-slate-200">{p.name}</td>
                            <td className="text-slate-500">{p.categoryName}</td>
                            <td className="text-end">
                              <span className="badge rounded-pill bg-warning-subtle text-warning">{p.quantityInStock}</span>
                            </td>
                            <td className="text-end text-slate-200">{Number(p.price).toFixed(2)} MAD</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </AdminLayout>
  );
};

export default Dashboard;
