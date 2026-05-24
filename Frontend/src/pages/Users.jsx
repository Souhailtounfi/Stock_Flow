import React, { useEffect, useState, useCallback } from 'react';
import { Link, Navigate } from 'react-router-dom';
import AdminLayout from '../layouts/AdminLayout';
import Modal from '../components/Modal';
import Spinner from '../components/Spinner';
import Pagination from '../components/Pagination';
import { getUsers, deleteUser } from '../api/api';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { Users as UsersIcon, Search, Pencil, Trash2, Shield, User, Plus } from 'lucide-react';

const Users = () => {
  const { isAdmin } = useAuth();
  if (!isAdmin) return <Navigate to="/dashboard" replace />;

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [deleteModal, setDeleteModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();
  const pageSize = 10;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getUsers({ page, pageSize, search });
      const items = Array.isArray(res.data) ? res.data : res.data.items ?? [];
      setUsers(items);
      setTotalPages(res.data.totalPages ?? 1);
    } catch { showToast('Échec du chargement des utilisateurs.', 'error'); }
    finally { setLoading(false); }
  }, [page, search]);

  useEffect(() => { load(); }, [load]);

  const openDelete = (u) => { setEditing(u); setDeleteModal(true); };

  const handleDelete = async () => {
    setSaving(true);
    try { await deleteUser(editing.id); showToast('Utilisateur supprimé.', 'success'); setDeleteModal(false); load(); }
    catch { showToast('Échec de la suppression.', 'error'); }
    finally { setSaving(false); }
  };

  const avatarColor = (name = '') => {
    const colors = ['from-violet-500 to-purple-600', 'from-sky-500 to-blue-600', 'from-emerald-500 to-teal-600', 'from-pink-500 to-rose-600', 'from-amber-500 to-orange-600'];
    return colors[name.charCodeAt(0) % colors.length];
  };

  return (
    <AdminLayout title="Utilisateurs">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-200">Gestion des employés</h2>
            <p className="text-slate-500 text-sm mt-1">Créer des comptes employés et gérer les rôles depuis ce panneau administrateur.</p>
          </div>
          <Link to="/users/new" className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-2xl text-base font-semibold transition-all shadow-lg shadow-emerald-500/20 active:scale-95">
            <Plus className="h-5 w-5" /> Créer un employé
          </Link>
        </div>

        <div className="relative flex items-center max-w-md">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center h-full">
            <Search className="h-4 w-4 text-emerald-400" />
          </span>
          <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Rechercher des utilisateurs..."
            className="w-full search-field pl-10" />
        </div>

        <div className="glass-card rounded-2xl border border-slate-100/10 overflow-hidden">
          {loading ? <div className="flex justify-center py-16"><Spinner /></div> :
           users.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-500">
              <UsersIcon className="h-12 w-12 mb-3 opacity-40" /><p className="font-medium">Aucun utilisateur trouvé</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-base">
                <thead className="border-b border-slate-100/10">
                  <tr>
                    {['Utilisateur', 'Email', 'Rôle', 'Créé le', 'Actions'].map((h) => (
                      <th key={h} className={`px-6 py-4 text-slate-500 font-semibold ${h === 'Actions' ? 'text-right' : 'text-left'}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100/10">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-emerald-50/60 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`h-9 w-9 rounded-full bg-gradient-to-br ${avatarColor(u.username)} flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>
                            {u.username?.substring(0, 2).toUpperCase()}
                          </div>
                          <span className="font-semibold text-slate-700">{u.username}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-500">{u.email || '—'}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-full border font-semibold ${
                          u.roleName === 'Admin'
                            ? 'bg-violet-100 text-violet-600 border-violet-200'
                            : 'bg-slate-100 text-slate-600 border-slate-200'
                        }`}>
                          {u.roleName === 'Admin' ? <Shield className="h-3 w-3" /> : <User className="h-3 w-3" />}
                          {u.roleName}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-500 text-sm">
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link to={`/users/${u.id}/edit`} className="p-2 rounded-lg text-slate-400 hover:text-sky-500 hover:bg-sky-100 transition-all"><Pencil className="h-4 w-4" /></Link>
                          <button onClick={() => openDelete(u)} className="p-2 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-100 transition-all"><Trash2 className="h-4 w-4" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
      </div>

      <Modal isOpen={deleteModal} onClose={() => setDeleteModal(false)} title="Supprimer l’utilisateur">
        <p className="text-slate-500 mb-6">Supprimer <span className="font-bold text-slate-700">"{editing?.username}"</span> ? Cette action est irréversible.</p>
        <div className="flex flex-col sm:flex-row gap-3">
          <button onClick={() => setDeleteModal(false)} className="w-full sm:w-auto sm:flex-1 py-2.5 rounded-xl border border-emerald-200 text-emerald-600 text-base font-medium hover:bg-emerald-100 transition-all">Annuler</button>
          <button onClick={handleDelete} disabled={saving} className="w-full sm:w-auto sm:flex-1 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-base font-semibold transition-all disabled:opacity-50">{saving ? 'Suppression...' : 'Supprimer'}</button>
        </div>
      </Modal>
    </AdminLayout>
  );
};

export default Users;
