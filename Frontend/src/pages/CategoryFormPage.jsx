import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import AdminLayout from '../layouts/AdminLayout';
import Spinner from '../components/Spinner';
import { getCategoryById, createCategory, updateCategory } from '../api/api';
import { useToast } from '../context/ToastContext';
import { ArrowLeft, Save, Tags } from 'lucide-react';

const emptyForm = { name: '', description: '' };

const CategoryFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const isEdit = Boolean(id);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    const load = async () => {
      if (!isEdit) {
        setLoading(false);
        return;
      }

      try {
        const res = await getCategoryById(id);
        const category = res.data;
        setForm({ name: category.name || '', description: category.description || '' });
      } catch {
        showToast('Échec du chargement de la catégorie.', 'error');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id, isEdit, showToast]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      showToast('Le nom est requis.', 'warning');
      return;
    }

    setSaving(true);

    try {
      if (isEdit) {
        await updateCategory(id, form);
        showToast('Catégorie mise à jour.', 'success');
      } else {
        await createCategory(form);
        showToast('Catégorie créée.', 'success');
      }
      navigate('/categories');
    } catch (err) {
      showToast(err.response?.data?.Message || 'Échec de l’enregistrement.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout title={isEdit ? 'Modifier la catégorie' : 'Nouvelle catégorie'}>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-emerald-500 uppercase tracking-[0.2em]">Catégories</p>
            <h2 className="text-2xl font-bold text-slate-200 mt-2">{isEdit ? 'Modifier la catégorie' : 'Créer une catégorie'}</h2>
            <p className="text-slate-500 text-sm mt-1">Cette page dédiée remplace les formulaires contextuels.</p>
          </div>
          <Link to="/categories" className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-600 hover:text-emerald-500">
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
                <Tags className="h-5 w-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-700">Informations catégorie</p>
                <p className="text-xs text-slate-500">Aucune logique cachée dans la liste : tout passe par cette page.</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Nom *</label>
                <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Nom de la catégorie"
                  className="w-full bg-white border border-emerald-100 focus:border-emerald-400 rounded-xl py-2.5 px-4 text-base text-slate-700 outline-none transition-all" />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Description</label>
                <textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} rows={4}
                  className="w-full bg-white border border-emerald-100 focus:border-emerald-400 rounded-xl py-2.5 px-4 text-base text-slate-700 outline-none transition-all resize-none" placeholder="Description optionnelle" />
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Link to="/categories" className="w-full sm:w-auto sm:flex-1 py-2.5 rounded-xl border border-emerald-200 text-emerald-600 text-base font-medium hover:bg-emerald-100 transition-all text-center">Annuler</Link>
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

export default CategoryFormPage;
