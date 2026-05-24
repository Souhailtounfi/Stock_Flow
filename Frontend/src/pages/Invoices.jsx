import React, { useEffect, useState, useCallback } from 'react';
import AdminLayout from '../layouts/AdminLayout';
import Modal from '../components/Modal';
import Spinner from '../components/Spinner';
import Pagination from '../components/Pagination';
import { getInvoices, updateInvoiceStatus, deleteInvoice } from '../api/api';
import { useToast } from '../context/ToastContext';
import { Link } from 'react-router-dom';
import { Plus, FileText, Search, Eye, Trash2, CheckCircle, XCircle, Clock, ReceiptText, CalendarDays, UserRound, BadgePercent, Package, ShoppingCart, CircleDollarSign } from 'lucide-react';

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

const statusLabel = (status) => status === 'Pending' ? 'En attente' : status === 'Paid' ? 'Payée' : 'Annulée';

const formatCurrency = (value) => `${Number(value || 0).toFixed(2)} MAD`;

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
                        <td className="px-5 py-4 font-mono text-slate-700 font-semibold">#{String(inv.id)}</td>
                        <td className="px-5 py-4 text-slate-700">{inv.customerName || '—'}</td>
                        <td className="px-5 py-4 text-slate-500">{new Date(inv.invoiceDate).toLocaleDateString()}</td>
                        <td className="px-5 py-4 font-semibold text-emerald-500">{`${Number(inv.totalAmount).toFixed(2)} MAD`}</td>
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

      <Modal isOpen={viewModal} onClose={() => setViewModal(false)} title={`Facture #${String(selected?.id ?? '')}`}>
        {selected && (
          <div className="space-y-5">
            <div className="rounded-[24px] bg-gradient-to-br from-emerald-500 to-emerald-600 p-[1px]">
              <div className="rounded-[23px] bg-slate-950/95 p-4 sm:p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.3em] text-emerald-200">Aperçu</p>
                    <h4 className="text-xl font-bold text-white mt-2">{selected.customerName || 'Client non renseigné'}</h4>
                    <p className="text-sm text-slate-300 mt-1">Document prêt à être vérifié et suivi.</p>
                  </div>
                  <div className="rounded-2xl bg-white/10 backdrop-blur border border-white/10 px-4 py-3 text-right">
                    <p className="text-[11px] uppercase tracking-[0.2em] text-emerald-100">Statut</p>
                    <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-sm font-semibold text-white">
                      <span className={`inline-flex h-2.5 w-2.5 rounded-full ${selected.status === 'Paid' ? 'bg-emerald-300' : selected.status === 'Cancelled' ? 'bg-rose-300' : 'bg-amber-300'}`} />
                      {statusLabel(selected.status)}
                    </div>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div className="rounded-2xl bg-white/5 border border-white/10 px-3 py-2">
                    <p className="text-[11px] uppercase tracking-[0.2em] text-slate-300">Date</p>
                    <p className="mt-1 font-semibold text-white flex items-center gap-2"><CalendarDays className="h-4 w-4 text-emerald-300" /> {new Date(selected.invoiceDate).toLocaleDateString('fr-FR')}</p>
                  </div>
                  <div className="rounded-2xl bg-white/5 border border-white/10 px-3 py-2">
                    <p className="text-[11px] uppercase tracking-[0.2em] text-slate-300">Total</p>
                    <p className="mt-1 font-semibold text-emerald-300 flex items-center gap-2"><CircleDollarSign className="h-4 w-4" /> {formatCurrency(selected.totalAmount)}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="rounded-2xl bg-emerald-50 px-4 py-3">
                <p className="text-[11px] uppercase tracking-[0.2em] text-emerald-700">Client</p>
                <p className="mt-2 font-semibold text-slate-800 flex items-center gap-2"><UserRound className="h-4 w-4 text-emerald-500" /> {selected.customerName || '—'}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 px-4 py-3">
                <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500">Numéro</p>
                <p className="mt-2 font-semibold text-slate-800 flex items-center gap-2"><ReceiptText className="h-4 w-4 text-emerald-500" /> #{String(selected.id)}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 px-4 py-3">
                <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500">Taxe</p>
                <p className="mt-2 font-semibold text-slate-800 flex items-center gap-2"><BadgePercent className="h-4 w-4 text-emerald-500" /> {`${Number(selected.taxRate * 100).toFixed(2)} %`}</p>
              </div>
            </div>

            {selected.notes && (
              <div className="rounded-2xl border border-slate-100/10 bg-slate-50 px-4 py-3">
                <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500">Notes</p>
                <p className="mt-2 text-sm text-slate-700 leading-6">{selected.notes}</p>
              </div>
            )}

            {selected.items?.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-semibold text-slate-100">Lignes de facture</p>
                  <span className="inline-flex items-center gap-2 text-xs text-slate-500"><ShoppingCart className="h-3.5 w-3.5 text-emerald-400" />{selected.items.length} article(s)</span>
                </div>
                <div className="rounded-[24px] border border-slate-100/10 overflow-hidden bg-white/90">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-slate-50">
                        <tr>
                          <th className="text-left px-4 py-3 text-slate-500 font-semibold">Produit</th>
                          <th className="text-right px-4 py-3 text-slate-500 font-semibold">Qté</th>
                          <th className="text-right px-4 py-3 text-slate-500 font-semibold">Prix</th>
                          <th className="text-right px-4 py-3 text-slate-500 font-semibold">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100/10">
                        {selected.items.map((item, index) => (
                          <tr key={index} className="hover:bg-emerald-50/40 transition-colors">
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <Package className="h-4 w-4 text-emerald-400" />
                                <div>
                                  <p className="font-semibold text-slate-800">{item.productName}</p>
                                  <p className="text-xs text-slate-500">Produit #{item.productId}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-right text-slate-700">{item.quantity}</td>
                            <td className="px-4 py-3 text-right text-slate-700">{formatCurrency(item.unitPrice)}</td>
                            <td className="px-4 py-3 text-right font-semibold text-emerald-600">{formatCurrency(item.totalPrice)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            <div className="rounded-[24px] bg-slate-50 p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Sous-total</span>
                <span className="font-semibold text-slate-800">{formatCurrency(Number(selected.subTotal ?? 0))}</span>
              </div>
              <div className="flex items-center justify-between text-sm mt-2">
                <span className="text-slate-500">Taxe</span>
                <span className="font-semibold text-slate-800">{formatCurrency(Number(selected.taxAmount ?? 0))}</span>
              </div>
              <div className="flex items-center justify-between border-t border-slate-200 pt-3 mt-3 text-base font-bold">
                <span className="text-slate-900">Total payé</span>
                <span className="text-emerald-600">{formatCurrency(Number(selected.totalAmount ?? 0))}</span>
              </div>
            </div>
          </div>
        )}
      </Modal>

      <Modal isOpen={deleteModal} onClose={() => setDeleteModal(false)} title="Supprimer la facture">
        <p className="text-slate-500 mb-6">Supprimer la facture <span className="font-bold text-slate-700">#{String(selected?.id ?? '')}</span> ? Cette action est irréversible.</p>
        <div className="flex flex-col sm:flex-row gap-3">
          <button onClick={() => setDeleteModal(false)} className="w-full sm:w-auto sm:flex-1 py-2.5 rounded-xl border border-emerald-200 text-emerald-600 text-base font-medium hover:bg-emerald-100 transition-all">Annuler</button>
          <button onClick={handleDelete} disabled={saving} className="w-full sm:w-auto sm:flex-1 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-base font-semibold transition-all disabled:opacity-50">{saving ? 'Suppression...' : 'Supprimer'}</button>
        </div>
      </Modal>
    </AdminLayout>
  );
};

export default Invoices;
