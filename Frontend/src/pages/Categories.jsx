import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../layouts/AdminLayout';
import Modal from '../components/Modal';
import Spinner from '../components/Spinner';
import Pagination from '../components/Pagination';
import { getCategories, deleteCategory } from '../api/api';
import { useToast } from '../context/ToastContext';
import { Plus, Pencil, Trash2, Tags, Search } from 'lucide-react';

const Categories = () => {
  const [categories, setCategories] = useState([]);
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
      const res = await getCategories({ page, pageSize, search });
      setCategories(res.data.items ?? res.data);
      setTotalPages(res.data.totalPages ?? 1);
    } catch {
      showToast('Échec du chargement des catégories.', 'error');
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => { load(); }, [load]);

  const openDelete = (cat) => { setEditing(cat); setDeleteModal(true); };

  const handleDelete = async () => {
    setSaving(true);
    try {
      await deleteCategory(editing.id);
      showToast('Catégorie supprimée.', 'success');
      setDeleteModal(false);
      load();
    } catch {
      showToast('Échec de la suppression.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout title="Catégories">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-200">Catégories</h2>
            <p className="text-slate-500 text-sm mt-1">Organisez vos catégories de produits</p>
          </div>
          <Link
            to="/categories/new"
            className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-2xl text-base font-semibold transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
          >
            <Plus className="h-5 w-5" /> Ajouter une catégorie
          </Link>
        </div>

        <div className="relative flex items-center max-w-md">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center h-full">
            <Search className="h-4 w-4 text-emerald-400" />
          </span>
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Rechercher des catégories..."
            className="w-full search-field pl-10"
          />
        </div>

        <div className="glass-card rounded-2xl border border-slate-100/10 overflow-hidden">
          {loading ? (
            <div className="flex justify-center py-16"><Spinner /></div>
          ) : categories.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-500">
              <Tags className="h-12 w-12 mb-3 opacity-40" />
              <p className="font-medium">Aucune catégorie trouvée</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-base">
                <thead className="border-b border-slate-100/10">
                  <tr>
                    <th className="text-left px-6 py-4 text-slate-500 font-semibold">Nom</th>
                    <th className="text-left px-6 py-4 text-slate-500 font-semibold">Description</th>
                    <th className="text-right px-6 py-4 text-slate-500 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100/10">
                  {categories.map((cat) => (
                    <tr key={cat.id} className="hover:bg-emerald-50/60 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                            <Tags className="h-4 w-4 text-emerald-500" />
                          </div>
                          <span className="font-semibold text-slate-700">{cat.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-500">{cat.description || '—'}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link to={`/categories/${cat.id}/edit`} className="p-2 rounded-lg text-slate-400 hover:text-sky-500 hover:bg-sky-100 transition-all">
                            <Pencil className="h-4 w-4" />
                          </Link>
                          <button onClick={() => openDelete(cat)} className="p-2 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-100 transition-all">
                            <Trash2 className="h-4 w-4" />
                          </button>
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

      <Modal isOpen={deleteModal} onClose={() => setDeleteModal(false)} title="Supprimer la catégorie">
        <p className="text-slate-500 mb-6">Supprimer <span className="font-bold text-slate-700">"{editing?.name}"</span> ? Cette action est irréversible.</p>
        <div className="flex flex-col sm:flex-row gap-3">
          <button onClick={() => setDeleteModal(false)} className="w-full sm:w-auto sm:flex-1 py-2.5 rounded-xl border border-emerald-200 text-emerald-600 text-base font-medium hover:bg-emerald-100 transition-all">Annuler</button>
          <button onClick={handleDelete} disabled={saving} className="w-full sm:w-auto sm:flex-1 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-base font-semibold transition-all disabled:opacity-50">
            {saving ? 'Suppression...' : 'Supprimer'}
          </button>
        </div>
      </Modal>
    </AdminLayout>
  );
};

export default Categories;
