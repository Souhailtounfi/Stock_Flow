import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import AdminLayout from '../layouts/AdminLayout';
import Spinner from '../components/Spinner';
import { getProductById, adjustStock } from '../api/api';
import { useToast } from '../context/ToastContext';
import { ArrowLeft, Save, SlidersHorizontal, Package } from 'lucide-react';

const StockAdjustmentPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState('');
  const [reason, setReason] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getProductById(id);
        setProduct(res.data);
      } catch {
        showToast('Échec du chargement du produit.', 'error');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id, showToast]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const qty = Number(quantity);

    if (Number.isNaN(qty)) {
      showToast('Indiquez une quantité valide.', 'warning');
      return;
    }

    setSaving(true);

    try {
      await adjustStock(id, qty, reason);
      showToast('Stock ajusté avec succès.', 'success');
      navigate('/products');
    } catch (err) {
      showToast(err.response?.data?.Message || 'Échec de l’ajustement.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout title="Ajuster le stock">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-emerald-500 uppercase tracking-[0.2em]">Produits</p>
            <h2 className="text-2xl font-bold text-slate-200 mt-2">Ajuster le stock</h2>
            <p className="text-slate-500 text-sm mt-1">Cette action est désormais ouverte sur une page dédiée.</p>
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
                <p className="text-sm font-semibold text-slate-700">{product?.name}</p>
                <p className="text-xs text-slate-500">Stock actuel : <span className="font-semibold text-slate-700">{product?.quantityInStock ?? 0}</span></p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Quantité d’ajustement *</label>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="ex : 50 ou -10"
                  className="w-full bg-white border border-emerald-100 focus:border-emerald-400 rounded-xl py-2.5 px-4 text-base text-slate-700 outline-none transition-all"
                />
                <p className="text-xs text-slate-500 mt-2">Utilisez un nombre négatif pour réduire le stock.</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Raison</label>
                <input
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="ex : Réapprovisionnement, inventaire, casse"
                  className="w-full bg-white border border-emerald-100 focus:border-emerald-400 rounded-xl py-2.5 px-4 text-base text-slate-700 outline-none transition-all"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Link to="/products" className="w-full sm:w-auto sm:flex-1 py-2.5 rounded-xl border border-emerald-200 text-emerald-600 text-base font-medium hover:bg-emerald-100 transition-all text-center">Annuler</Link>
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full sm:w-auto sm:flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-base font-semibold transition-all disabled:opacity-50 inline-flex items-center justify-center gap-2"
                >
                  <SlidersHorizontal className="h-4 w-4" />
                  {saving ? 'Ajustement...' : 'Appliquer'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default StockAdjustmentPage;
