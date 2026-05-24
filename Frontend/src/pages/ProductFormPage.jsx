import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import AdminLayout from '../layouts/AdminLayout';
import Spinner from '../components/Spinner';
import { getProductById, getCategories, createProduct, updateProduct } from '../api/api';
import { useToast } from '../context/ToastContext';
import { ArrowLeft, Save, Package } from 'lucide-react';

const emptyForm = {
  name: '',
  description: '',
  barcode: '',
  price: '',
  quantityInStock: '',
  categoryId: '',
};

const ProductFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const isEdit = Boolean(id);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    const load = async () => {
      try {
        const [categoryRes, productRes] = await Promise.all([
          getCategories({ pageSize: 100 }),
          isEdit ? getProductById(id) : Promise.resolve(null),
        ]);

        setCategories(Array.isArray(categoryRes.data) ? categoryRes.data : categoryRes.data.items ?? []);

        if (productRes) {
          const product = productRes.data;
          setForm({
            name: product.name || '',
            description: product.description || '',
            barcode: product.barcode || '',
            price: product.price ?? '',
            quantityInStock: product.quantityInStock ?? '',
            categoryId: product.categoryId ? String(product.categoryId) : '',
          });
        }
      } catch {
        showToast('Échec du chargement du produit.', 'error');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id, isEdit, showToast]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const price = Number(form.price);
    const quantityInStock = Number(form.quantityInStock || 0);

    if (!form.name.trim() || Number.isNaN(price)) {
      showToast('Le nom et un prix valide sont requis.', 'warning');
      return;
    }

    if (!form.categoryId) {
      showToast('Veuillez sélectionner une catégorie.', 'warning');
      return;
    }

    setSaving(true);

    try {
      const payload = {
        name: form.name.trim(),
        description: form.description || '',
        barcode: form.barcode || '',
        price,
        quantityInStock,
        imageUrl: '',
        categoryId: Number(form.categoryId),
      };

      if (isEdit) {
        await updateProduct(id, payload);
        showToast('Produit mis à jour.', 'success');
      } else {
        await createProduct(payload);
        showToast('Produit créé.', 'success');
      }

      navigate('/products');
    } catch (err) {
      showToast(err.response?.data?.Message || 'Échec de l’enregistrement.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout title={isEdit ? 'Modifier le produit' : 'Nouveau produit'}>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-emerald-500 uppercase tracking-[0.2em]">Produits</p>
            <h2 className="text-2xl font-bold text-slate-200 mt-2">{isEdit ? 'Modifier le produit' : 'Créer un produit'}</h2>
            <p className="text-slate-500 text-sm mt-1">Complétez le formulaire sur cette page dédiée.</p>
          </div>
          <Link to="/products" className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-600 hover:text-emerald-500">
            <ArrowLeft className="h-4 w-4" /> Retour à la liste
          </Link>
        </div>

        {loading ? (
          <div className="glass-card rounded-2xl border border-slate-100/10 py-12 flex justify-center">
            <Spinner />
          </div>
        ) : (
          <div className="glass-card rounded-2xl border border-slate-100/10 p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 rounded-2xl bg-emerald-50 flex items-center justify-center">
                <Package className="h-5 w-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-700">Informations produit</p>
                <p className="text-xs text-slate-500">Le formulaire s’ouvre sur une page dédiée pour un flux plus clair.</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Nom *</label>
                  <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Nom du produit"
                    className="w-full bg-white border border-emerald-100 focus:border-emerald-400 rounded-xl py-2.5 px-4 text-base text-slate-700 outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Prix *</label>
                  <input type="number" step="0.01" min="0" value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))} placeholder="0.00"
                    className="w-full bg-white border border-emerald-100 focus:border-emerald-400 rounded-xl py-2.5 px-4 text-base text-slate-700 outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Quantité en stock</label>
                  <input type="number" min="0" value={form.quantityInStock} onChange={(e) => setForm((f) => ({ ...f, quantityInStock: e.target.value }))} placeholder="0"
                    className="w-full bg-white border border-emerald-100 focus:border-emerald-400 rounded-xl py-2.5 px-4 text-base text-slate-700 outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Code-barres</label>
                  <input value={form.barcode} onChange={(e) => setForm((f) => ({ ...f, barcode: e.target.value }))} placeholder="SKU-001"
                    className="w-full bg-white border border-emerald-100 focus:border-emerald-400 rounded-xl py-2.5 px-4 text-base text-slate-700 outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Catégorie *</label>
                  <select value={form.categoryId} onChange={(e) => setForm((f) => ({ ...f, categoryId: e.target.value }))}
                    className="w-full bg-white border border-emerald-100 focus:border-emerald-400 rounded-xl py-2.5 px-4 text-base text-slate-700 outline-none transition-all">
                    <option value="">Sélectionner une catégorie</option>
                    {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Description</label>
                <textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} rows={4}
                  className="w-full bg-white border border-emerald-100 focus:border-emerald-400 rounded-xl py-2.5 px-4 text-base text-slate-700 outline-none transition-all resize-none" placeholder="Description du produit" />
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Link to="/products" className="w-full sm:w-auto sm:flex-1 py-2.5 rounded-xl border border-emerald-200 text-emerald-600 text-base font-medium hover:bg-emerald-100 transition-all text-center">Annuler</Link>
                <button type="submit" disabled={saving} className="w-full sm:w-auto sm:flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-base font-semibold transition-all disabled:opacity-50 inline-flex items-center justify-center gap-2">
                  <Save className="h-4 w-4" />
                  {saving ? 'Enregistrement...' : isEdit ? 'Mettre à jour' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default ProductFormPage;
