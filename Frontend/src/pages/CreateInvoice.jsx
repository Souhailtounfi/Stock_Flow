import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../layouts/AdminLayout';
import Spinner from '../components/Spinner';
import { getCustomers, getProducts, createInvoice } from '../api/api';
import { useToast } from '../context/ToastContext';
import { Plus, Trash2, FileText, Search, ChevronDown } from 'lucide-react';

const CreateInvoice = () => {
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ customerId: '', invoiceDate: new Date().toISOString().split('T')[0], notes: '', status: 'Pending' });
  const [items, setItems] = useState([{ productId: '', quantity: 1, unitPrice: 0 }]);
  const [productSearch, setProductSearch] = useState('');
  const { showToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      getCustomers({ pageSize: 200 }),
      getProducts({ pageSize: 200 }),
    ]).then(([cr, pr]) => {
      setCustomers(Array.isArray(cr.data) ? cr.data : cr.data.items ?? []);
      setProducts(Array.isArray(pr.data) ? pr.data : pr.data.products ?? []);
    }).catch(() => showToast('Échec du chargement des données.', 'error'))
      .finally(() => setLoading(false));
  }, []);

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(productSearch.toLowerCase())
  );

  const addItem = () => setItems((prev) => [...prev, { productId: '', quantity: 1, unitPrice: 0 }]);

  const removeItem = (i) => setItems((prev) => prev.filter((_, idx) => idx !== i));

  const updateItem = (i, field, value) => {
    setItems((prev) => prev.map((item, idx) => {
      if (idx !== i) return item;
      const updated = { ...item, [field]: value };
      if (field === 'productId') {
        const prod = products.find((p) => String(p.id) === String(value));
        updated.unitPrice = prod ? prod.price : 0;
      }
      return updated;
    }));
  };

  const subtotal = items.reduce((sum, item) => sum + (Number(item.unitPrice) * Number(item.quantity || 0)), 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.customerId) return showToast('Veuillez sélectionner un client.', 'warning');
    const validItems = items.filter((it) => it.productId && it.quantity > 0);
    if (validItems.length === 0) return showToast('Ajoutez au moins un produit.', 'warning');

    setSaving(true);
    try {
      await createInvoice({
        customerId: form.customerId,
        invoiceDate: form.invoiceDate,
        notes: form.notes,
        status: form.status,
        items: validItems.map((it) => ({
          productId: it.productId,
          quantity: Number(it.quantity),
          unitPrice: Number(it.unitPrice),
        })),
      });
      showToast('Facture créée avec succès !', 'success');
      navigate('/invoices');
    } catch (err) {
      showToast(err.response?.data?.Message || 'Échec de la création de la facture.', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <AdminLayout title="Créer une facture">
      <div className="flex justify-center py-20"><Spinner size="lg" message="Chargement..." /></div>
    </AdminLayout>
  );

  return (
    <AdminLayout title="Créer une facture">
      <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-200">Nouvelle facture</h2>
            <p className="text-slate-500 text-sm mt-1">Créez une nouvelle facture de vente</p>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center">
            <FileText className="h-6 w-6 text-emerald-500" />
          </div>
        </div>

        <div className="glass-card rounded-2xl border border-slate-100/10 p-6 space-y-4">
          <h3 className="text-sm font-semibold text-slate-600 uppercase tracking-wider">Détails de la facture</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Client *</label>
              <div className="relative">
                <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-400 pointer-events-none" />
                <select value={form.customerId} onChange={(e) => setForm((f) => ({ ...f, customerId: e.target.value }))}
                  className="w-full bg-white border border-emerald-100 focus:border-emerald-400 rounded-xl py-2.5 px-4 text-base text-slate-700 outline-none transition-all appearance-none">
                  <option value="">Sélectionner un client...</option>
                  {customers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Date de facture</label>
              <input type="date" value={form.invoiceDate} onChange={(e) => setForm((f) => ({ ...f, invoiceDate: e.target.value }))}
                className="w-full bg-white border border-emerald-100 focus:border-emerald-400 rounded-xl py-2.5 px-4 text-base text-slate-700 outline-none transition-all" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Statut</label>
              <div className="relative">
                <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-400 pointer-events-none" />
                <select value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
                  className="w-full bg-white border border-emerald-100 focus:border-emerald-400 rounded-xl py-2.5 px-4 text-base text-slate-700 outline-none transition-all appearance-none">
                  <option value="Pending">En attente</option>
                  <option value="Paid">Payée</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Notes</label>
              <input value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} placeholder="Notes optionnelles..."
                className="w-full bg-white border border-emerald-100 focus:border-emerald-400 rounded-xl py-2.5 px-4 text-base text-slate-700 outline-none transition-all" />
            </div>
          </div>
        </div>

        <div className="glass-card rounded-2xl border border-slate-100/10 p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <h3 className="text-sm font-semibold text-slate-600 uppercase tracking-wider">Lignes de facture</h3>
            <div className="relative flex items-center max-w-sm w-full">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center h-full">
                <Search className="h-4 w-4 text-emerald-400" />
              </span>
              <input value={productSearch} onChange={(e) => setProductSearch(e.target.value)} placeholder="Filtrer les produits..."
                className="w-full search-field pl-10" />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-base">
              <thead className="border-b border-slate-100/10">
                <tr>
                  <th className="text-left pb-3 pr-3 text-slate-500 font-medium">Produit</th>
                  <th className="text-right pb-3 px-3 text-slate-500 font-medium w-24">Qté</th>
                  <th className="text-right pb-3 px-3 text-slate-500 font-medium w-32">Prix unitaire</th>
                  <th className="text-right pb-3 pl-3 text-slate-500 font-medium w-32">Total</th>
                  <th className="w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/10">
                {items.map((item, i) => (
                  <tr key={i}>
                    <td className="py-2.5 pr-3">
                      <div className="relative">
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-400 pointer-events-none" />
                        <select value={item.productId} onChange={(e) => updateItem(i, 'productId', e.target.value)}
                          className="w-full bg-white border border-emerald-100 focus:border-emerald-400 rounded-xl py-2 px-3 text-base text-slate-700 outline-none transition-all appearance-none">
                          <option value="">Sélectionner un produit...</option>
                          {filteredProducts.map((p) => <option key={p.id} value={p.id}>{p.name} (Stock: {p.quantityInStock})</option>)}
                        </select>
                      </div>
                    </td>
                    <td className="py-2.5 px-3">
                      <input type="number" min="1" value={item.quantity} onChange={(e) => updateItem(i, 'quantity', e.target.value)}
                        className="w-full bg-white border border-emerald-100 focus:border-emerald-400 rounded-xl py-2 px-3 text-base text-slate-700 outline-none transition-all text-right" />
                    </td>
                    <td className="py-2.5 px-3">
                      <input type="number" min="0" step="0.01" value={item.unitPrice} onChange={(e) => updateItem(i, 'unitPrice', e.target.value)}
                        className="w-full bg-white border border-emerald-100 focus:border-emerald-400 rounded-xl py-2 px-3 text-base text-slate-700 outline-none transition-all text-right" />
                    </td>
                    <td className="py-2.5 pl-3 text-right font-semibold text-emerald-500">
                      ${(Number(item.unitPrice) * Number(item.quantity || 0)).toFixed(2)}
                    </td>
                    <td className="py-2.5 pl-2">
                      {items.length > 1 && (
                        <button type="button" onClick={() => removeItem(i)} className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-100 transition-all">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button type="button" onClick={addItem}
            className="flex items-center gap-2 text-sm text-emerald-500 hover:text-emerald-600 transition-colors font-medium">
            <Plus className="h-4 w-4" /> Ajouter une ligne
          </button>

          <div className="border-t border-slate-100/10 pt-4 mt-2">
            <div className="flex justify-end">
              <div className="space-y-2 text-sm min-w-[200px]">
                <div className="flex justify-between text-slate-500">
                  <span>Sous-total</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-slate-800 text-lg border-t border-slate-100/10 pt-2">
                  <span>Total</span>
                  <span className="text-emerald-500">${subtotal.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button type="button" onClick={() => navigate('/invoices')}
            className="px-6 py-2.5 rounded-xl border border-emerald-200 text-emerald-600 text-base font-medium hover:bg-emerald-100 transition-all">
            Annuler
          </button>
          <button type="submit" disabled={saving}
            className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-base font-semibold transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50 active:scale-[0.98]">
            {saving ? 'Création en cours...' : 'Créer la facture'}
          </button>
        </div>
      </form>
    </AdminLayout>
  );
};

export default CreateInvoice;
