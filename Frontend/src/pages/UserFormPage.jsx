import React, { useEffect, useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import AdminLayout from '../layouts/AdminLayout';
import Spinner from '../components/Spinner';
import { getUserById, createUser, updateUser } from '../api/api';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Save, Users as UsersIcon } from 'lucide-react';

const emptyCreateForm = { username: '', email: '', password: '', roleId: '2' };

const UserFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { isAdmin } = useAuth();
  const isEdit = Boolean(id);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [createForm, setCreateForm] = useState(emptyCreateForm);
  const [currentUser, setCurrentUser] = useState(null);
  const [roleId, setRoleId] = useState('2');

  if (!isAdmin) return <Navigate to="/dashboard" replace />;

  useEffect(() => {
    const load = async () => {
      if (!isEdit) {
        setLoading(false);
        return;
      }

      try {
        const res = await getUserById(id);
        const user = res.data;
        setCurrentUser(user);
        setRoleId(String(user.roleId || 2));
      } catch {
        showToast('Échec du chargement de l’utilisateur.', 'error');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id, isEdit, showToast]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setSaving(true);

    try {
      if (isEdit) {
        await updateUser(id, { roleId: Number(roleId) });
        showToast('Rôle mis à jour.', 'success');
      } else {
        if (!createForm.username || !createForm.password) {
          showToast('Le nom d’utilisateur et le mot de passe sont requis.', 'warning');
          setSaving(false);
          return;
        }
        await createUser(createForm);
        showToast('Employé créé.', 'success');
      }

      navigate('/users');
    } catch (err) {
      showToast(err.response?.data?.Message || 'Échec de l’enregistrement.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout title={isEdit ? 'Modifier l’utilisateur' : 'Créer un employé'}>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-emerald-500 uppercase tracking-[0.2em]">Utilisateurs</p>
            <h2 className="text-2xl font-bold text-slate-200 mt-2">{isEdit ? 'Modifier l’utilisateur' : 'Créer un employé'}</h2>
            <p className="text-slate-500 text-sm mt-1">Tous les comptes employés sont maintenant gérés sur des pages dédiées.</p>
          </div>
          <Link to="/users" className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-600 hover:text-emerald-500">
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
                <UsersIcon className="h-5 w-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-700">Accès employé</p>
                <p className="text-xs text-slate-500">La création d’employé est réservée aux administrateurs.</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {isEdit ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Nom d’utilisateur</label>
                    <div className="w-full bg-slate-50 border border-slate-100 rounded-xl py-2.5 px-4 text-base text-slate-600">
                      {currentUser?.username || '—'}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Email</label>
                    <div className="w-full bg-slate-50 border border-slate-100 rounded-xl py-2.5 px-4 text-base text-slate-600">
                      {currentUser?.email || '—'}
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Rôle *</label>
                    <select value={roleId} onChange={(e) => setRoleId(e.target.value)}
                      className="w-full bg-white border border-emerald-100 focus:border-emerald-400 rounded-xl py-2.5 px-4 text-base text-slate-700 outline-none transition-all">
                      <option value="1">Admin</option>
                      <option value="2">Employé</option>
                    </select>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Nom d’utilisateur *</label>
                    <input value={createForm.username} onChange={(e) => setCreateForm((f) => ({ ...f, username: e.target.value }))}
                      className="w-full bg-white border border-emerald-100 focus:border-emerald-400 rounded-xl py-2.5 px-4 text-base text-slate-700 outline-none transition-all" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Email</label>
                    <input type="email" value={createForm.email} onChange={(e) => setCreateForm((f) => ({ ...f, email: e.target.value }))}
                      className="w-full bg-white border border-emerald-100 focus:border-emerald-400 rounded-xl py-2.5 px-4 text-base text-slate-700 outline-none transition-all" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Mot de passe *</label>
                    <input type="password" value={createForm.password} onChange={(e) => setCreateForm((f) => ({ ...f, password: e.target.value }))}
                      className="w-full bg-white border border-emerald-100 focus:border-emerald-400 rounded-xl py-2.5 px-4 text-base text-slate-700 outline-none transition-all" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Rôle *</label>
                    <select value={createForm.roleId} onChange={(e) => setCreateForm((f) => ({ ...f, roleId: e.target.value }))}
                      className="w-full bg-white border border-emerald-100 focus:border-emerald-400 rounded-xl py-2.5 px-4 text-base text-slate-700 outline-none transition-all">
                      <option value="1">Admin</option>
                      <option value="2">Employé</option>
                    </select>
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Link to="/users" className="w-full sm:w-auto sm:flex-1 py-2.5 rounded-xl border border-emerald-200 text-emerald-600 text-base font-medium hover:bg-emerald-100 transition-all text-center">Annuler</Link>
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

export default UserFormPage;
