import React, { useEffect, useState, useCallback } from 'react';
import AdminLayout from '../layouts/AdminLayout';
import Modal from '../components/Modal';
import Spinner from '../components/Spinner';
import Pagination from '../components/Pagination';
import { getInvoices, updateInvoiceStatus, deleteInvoice } from '../api/api';
import { useToast } from '../context/ToastContext';
import { Link } from 'react-router-dom';
import { Plus, FileText, Search, Eye, Trash2, CheckCircle, XCircle, Clock } from 'lucide-react';

const STATUS_STYLES = {
  Pending: 'bg-amber-100 text-amber-600 border-amber-200',
  Paid: 'bg-emerald-100 text-emerald-600 border-emerald-200',
  Cancelled: 'bg-rose-100 text-rose-600 border-rose-200',
};

const STATUS_ICONS = {
  Pending: Clock,
  Paid: CheckCircle,
  Cancelled: XCircle,
};

const Invoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [viewModal, setViewModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [selected, setSelected] = useState(null);
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();
  const pageSize = 10;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getInvoices({ page, pageSize, search, status: statusFilter || undefined });
      const items = Array.isArray(res.data) ? res.data : res.data.invoices ?? [];
      setInvoices(items);
      const totalCount = res.data.totalCount ?? items.length;
      setTotalPages(res.data.totalPages ?? (totalCount > 0 ? Math.ceil(totalCount / pageSize) : 1));
    } catch { showToast('Échec du chargement des factures.', 'error'); }
    finally { setLoading(false); }
  }, [page, search, statusFilter]);

  useEffect(() => { load(); }, [load]);

  const handleStatusChange = async (invoice, newStatus) => {
    try {
      await updateInvoiceStatus(invoice.id, newStatus);
      showToast(`Facture marquée comme ${newStatus}.`, 'success');
      load();
    } catch { showToast('Échec de la mise à jour du statut.', 'error'); }
  };

  const handleDelete = async () => {
    setSaving(true);
    try { await deleteInvoice(selected.id); showToast('Facture supprimée.', 'success'); setDeleteModal(false); load(); }
    catch { showToast('Échec de la suppression.', 'error'); }
    finally { setSaving(false); }
  };

  return (
    <AdminLayout title="Factures">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-200">Factures</h2>
            <p className="text-slate-500 text-sm mt-1">Gérez les factures de vente et les paiements</p>
          </div>
          <Link to="/invoices/create"
            className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-2xl text-base font-semibold transition-all shadow-lg shadow-emerald-500/20 active:scale-95">
            <Plus className="h-5 w-5" /> Nouvelle facture
          </Link>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex items-center flex-1 max-w-md">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center h-full">
              <Search className="h-4 w-4 text-emerald-400" />
            </span>
            <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Rechercher des factures..."
              className="w-full search-field pl-10" />
          </div>
          <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="search-select">
            <option value="">Tous les statuts</option>
            <option value="Pending">En attente</option>
            <option value="Paid">Payée</option>
            <option value="Cancelled">Annulée</option>
          </select>
        </div>

        <div className="glass-card rounded-2xl border border-slate-100/10 overflow-hidden">
          {loading ? <div className="flex justify-center py-16"><Spinner /></div> :
           invoices.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-500">
              <FileText className="h-12 w-12 mb-3 opacity-40" /><p className="font-medium">Aucune facture trouvée</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-base">
                <thead className="border-b border-slate-100/10">
                  <tr>
                    {['Facture #', 'Client', 'Date', 'Total', 'Statut', 'Actions'].map((h) => (
                      <th key={h} className={`px-5 py-4 text-slate-500 font-semibold ${h === 'Actions' ? 'text-right' : 'text-left'}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100/10">
                  {invoices.map((inv) => {
                    const StatusIcon = STATUS_ICONS[inv.status] || Clock;
                    return (
                      <tr key={inv.id} className="hover:bg-emerald-50/60 transition-colors">
                        <td className="px-5 py-4 font-mono text-slate-700 font-semibold">#{String(inv.id).padStart(5, '0')}</td>
                        <td className="px-5 py-4 text-slate-700">{inv.customerName || '—'}</td>
                        <td className="px-5 py-4 text-slate-500">{new Date(inv.invoiceDate).toLocaleDateString()}</td>
                        <td className="px-5 py-4 font-semibold text-emerald-500">${Number(inv.totalAmount).toFixed(2)}</td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-full border font-semibold ${STATUS_STYLES[inv.status] || STATUS_STYLES.Pending}`}>
                            <StatusIcon className="h-3 w-3" />{inv.status === 'Pending' ? 'En attente' : inv.status === 'Paid' ? 'Payée' : 'Annulée'}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button onClick={() => { setSelected(inv); setViewModal(true); }} className="p-2 rounded-lg text-slate-400 hover:text-violet-500 hover:bg-violet-100 transition-all"><Eye className="h-4 w-4" /></button>
                            {inv.status === 'Pending' && (
                              <>
                                <button onClick={() => handleStatusChange(inv, 'Paid')} className="p-2 rounded-lg text-slate-400 hover:text-emerald-500 hover:bg-emerald-100 transition-all" title="Marquer comme payée"><CheckCircle className="h-4 w-4" /></button>
                                <button onClick={() => handleStatusChange(inv, 'Cancelled')} className="p-2 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-100 transition-all" title="Annuler"><XCircle className="h-4 w-4" /></button>
                              </>
                            )}
                            <button onClick={() => { setSelected(inv); setDeleteModal(true); }} className="p-2 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-100 transition-all"><Trash2 className="h-4 w-4" /></button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
        <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
      </div>

      <Modal isOpen={viewModal} onClose={() => setViewModal(false)} title={`Facture #${String(selected?.id ?? '').padStart(5, '0')}`}>
        {selected && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><p className="text-slate-500 text-xs uppercase font-semibold">Client</p><p className="text-slate-700 font-medium">{selected.customerName || '—'}</p></div>
              <div><p className="text-slate-500 text-xs uppercase font-semibold">Date</p><p className="text-slate-700 font-medium">{new Date(selected.invoiceDate).toLocaleDateString()}</p></div>
              <div><p className="text-slate-500 text-xs uppercase font-semibold">Statut</p>
                <span className={`inline-flex text-xs px-3 py-1 rounded-full border font-semibold ${STATUS_STYLES[selected.status]}`}>{selected.status === 'Pending' ? 'En attente' : selected.status === 'Paid' ? 'Payée' : 'Annulée'}</span>
              </div>
              <div><p className="text-slate-500 text-xs uppercase font-semibold">Total</p><p className="text-emerald-500 font-bold text-lg">${Number(selected.totalAmount).toFixed(2)}</p></div>
            </div>
            {selected.notes && <div><p className="text-slate-500 text-xs uppercase font-semibold mb-1">Notes</p><p className="text-slate-600 text-sm">{selected.notes}</p></div>}
            {selected.items?.length > 0 && (
              <div>
                <p className="text-slate-500 text-xs uppercase font-semibold mb-2">Lignes de facture</p>
                <div className="rounded-xl overflow-hidden border border-slate-100/10">
                  <table className="w-full text-sm">
                    <thead className="bg-emerald-50"><tr>
                      <th className="text-left px-4 py-2.5 text-slate-500 font-medium">Produit</th>
                      <th className="text-right px-4 py-2.5 text-slate-500 font-medium">Qté</th>
                      <th className="text-right px-4 py-2.5 text-slate-500 font-medium">Prix</th>
                      <th className="text-right px-4 py-2.5 text-slate-500 font-medium">Total</th>
                    </tr></thead>
                    <tbody className="divide-y divide-slate-100/10">
                      {selected.items.map((item, i) => (
                        <tr key={i}>
                          <td className="px-4 py-2.5 text-slate-700">{item.productName}</td>
                          <td className="px-4 py-2.5 text-right text-slate-500">{item.quantity}</td>
                          <td className="px-4 py-2.5 text-right text-slate-500">${Number(item.unitPrice).toFixed(2)}</td>
                          <td className="px-4 py-2.5 text-right text-emerald-500 font-semibold">${Number(item.totalPrice).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      <Modal isOpen={deleteModal} onClose={() => setDeleteModal(false)} title="Supprimer la facture">
        <p className="text-slate-500 mb-6">Supprimer la facture <span className="font-bold text-slate-700">#{String(selected?.id ?? '').padStart(5, '0')}</span> ? Cette action est irréversible.</p>
        <div className="flex flex-col sm:flex-row gap-3">
          <button onClick={() => setDeleteModal(false)} className="w-full sm:w-auto sm:flex-1 py-2.5 rounded-xl border border-emerald-200 text-emerald-600 text-base font-medium hover:bg-emerald-100 transition-all">Annuler</button>
          <button onClick={handleDelete} disabled={saving} className="w-full sm:w-auto sm:flex-1 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-base font-semibold transition-all disabled:opacity-50">{saving ? 'Suppression...' : 'Supprimer'}</button>
        </div>
      </Modal>
    </AdminLayout>
  );
};

export default Invoices;
