import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../layouts/AdminLayout';
import Modal from '../components/Modal';
import Spinner from '../components/Spinner';
import Pagination from '../components/Pagination';
import { getProducts, deleteProduct, getCategories } from '../api/api';
import { useToast } from '../context/ToastContext';
import { Plus, Pencil, Trash2, Package, Search, SlidersHorizontal, AlertTriangle } from 'lucide-react';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [deleteModal, setDeleteModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();
  const pageSize = 10;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getProducts({ page, pageSize, searchTerm: search, categoryId: categoryFilter || undefined });
      const items = Array.isArray(res.data) ? res.data : res.data.products ?? [];
      setProducts(items);
      const totalCount = res.data.totalCount ?? items.length;
      setTotalPages(res.data.totalPages ?? (totalCount > 0 ? Math.ceil(totalCount / pageSize) : 1));
    } catch { showToast('Failed to load products.', 'error'); }
    finally { setLoading(false); }
  }, [page, search, categoryFilter]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    getCategories({ pageSize: 100 }).then((r) => setCategories(Array.isArray(r.data) ? r.data : r.data.items ?? [])).catch(() => {});
  }, []);

  const openDelete = (p) => {
    setEditing(p);
    setDeleteModal(true);
  };

  const handleDelete = async () => {
    setSaving(true);
    try { await deleteProduct(editing.id); showToast('Product deleted.', 'success'); setDeleteModal(false); setEditing(null); load(); }
    catch { showToast('Delete failed.', 'error'); }
    finally { setSaving(false); }
  };

  const stockBadge = (qty, min) => {
    const minimum = Number(min ?? 5);
    if (qty === 0) return 'bg-rose-500/15 text-rose-400 border-rose-500/20';
    if (qty <= minimum) return 'bg-amber-500/15 text-amber-400 border-amber-500/20';
    return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20';
  };

  return (
    <AdminLayout title="Produits">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-200">Produits</h2>
            <p className="text-slate-500 text-sm mt-1">Gérez l'inventaire et les niveaux de stock</p>
          </div>
          <Link to="/products/new" className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-2xl text-base font-semibold shadow-lg shadow-emerald-500/20 active:scale-95 transition-all">
            <Plus className="h-5 w-5" /> Ajouter un produit
          </Link>
        </div>

        {/* Filtres */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-sm flex items-center">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center h-full">
              <Search className="h-4 w-4 text-emerald-400" />
            </span>
            <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Rechercher des produits..."
              className="w-full search-field pl-10" />
          </div>
          <div className="relative flex items-center">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center h-full">
              <SlidersHorizontal className="h-4 w-4 text-emerald-400" />
            </span>
            <select value={categoryFilter} onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
              className="search-select min-w-[12rem] pl-10">
              <option value="">Toutes les catégories</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
        </div>

        {/* Tableau */}
        <div className="glass-card rounded-2xl border border-slate-100/10 overflow-hidden">
          {loading ? <div className="flex justify-center py-16"><Spinner /></div> :
           products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-500">
              <Package className="h-12 w-12 mb-3 opacity-40" /><p className="font-medium">Aucun produit trouvé</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-base">
                <thead className="border-b border-slate-100/10">
                  <tr>
                    {['Produit', 'Catégorie', 'Prix', 'Stock', 'Code-barres', 'Actions'].map((h) => (
                      <th key={h} className={`px-5 py-4 text-slate-500 font-semibold ${h === 'Actions' ? 'text-right' : 'text-left'}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100/10">
                  {products.map((p) => (
                    <React.Fragment key={p.id}>
                      <tr className="hover:bg-emerald-50/60 transition-colors">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0 overflow-hidden">
                              {p.imageUrl
                                ? <img src={`http://localhost:5172${p.imageUrl}`} alt={p.name} className="h-full w-full object-cover" />
                                : <Package className="h-5 w-5 text-emerald-400" />}
                            </div>
                            <div>
                              <p className="font-semibold text-slate-700">{p.name}</p>
                              {p.description && <p className="text-xs text-slate-400 truncate max-w-[180px]">{p.description}</p>}
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-xs px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 font-semibold">{p.categoryName || '—'}</span>
                        </td>
                        <td className="px-5 py-4 font-semibold text-emerald-500">${Number(p.price).toFixed(2)}</td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <span className={`text-xs px-3 py-1 rounded-full border font-semibold ${stockBadge(p.quantityInStock, p.minStockLevel)}`}>{p.quantityInStock}</span>
                            {p.quantityInStock <= p.minStockLevel && <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />}
                          </div>
                        </td>
                        <td className="px-5 py-4 text-slate-400 font-mono text-xs">{p.barcode || '—'}</td>
                        <td className="px-5 py-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Link to={`/products/${p.id}/edit`} className="p-2 rounded-lg text-slate-400 hover:text-sky-500 hover:bg-sky-100 transition-all"><Pencil className="h-5 w-5" /></Link>
                            <Link to={`/products/${p.id}/stock`} className="p-2 rounded-lg text-slate-400 hover:text-amber-500 hover:bg-amber-100 transition-all" title="Ajuster le stock"><SlidersHorizontal className="h-5 w-5" /></Link>
                            <button onClick={() => openDelete(p)} className="p-2 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-100 transition-all"><Trash2 className="h-5 w-5" /></button>
                          </div>
                        </td>
                      </tr>
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
      </div>

      <Modal isOpen={deleteModal} onClose={() => setDeleteModal(false)} title="Supprimer le produit">
        <p className="text-slate-500 mb-6">Supprimer <span className="font-bold text-slate-700">"{editing?.name}"</span> ? Cette action est irréversible.</p>
        <div className="flex flex-col sm:flex-row gap-3">
          <button onClick={() => setDeleteModal(false)} className="w-full sm:w-auto sm:flex-1 py-2.5 rounded-xl border border-emerald-200 text-emerald-600 text-base font-medium hover:bg-emerald-100 transition-all">Annuler</button>
          <button onClick={handleDelete} disabled={saving} className="w-full sm:w-auto sm:flex-1 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-base font-semibold transition-all disabled:opacity-50">{saving ? 'Suppression...' : 'Supprimer'}</button>
        </div>
      </Modal>
    </AdminLayout>
  );
};

export default Products;
