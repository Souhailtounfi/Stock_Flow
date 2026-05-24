import React, { useState } from 'react';
import AdminLayout from '../layouts/AdminLayout';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../api/api';
import { User, Lock, Save, Eye, EyeOff, Shield, LogOut } from 'lucide-react';

const Section = ({ title, icon: Icon, children }) => (
  <div className="glass-card rounded-2xl p-4 p-md-5">
    <div className="d-flex align-items-center gap-2 mb-4 pb-3 border-bottom border-white-10">
      <div className="d-inline-flex align-items-center justify-content-center rounded-2" style={{ width: 36, height: 36, background: 'rgba(20, 184, 166, 0.12)' }}>
        <Icon className="h-4 w-4 text-emerald-500" />
      </div>
      <h3 className="h6 fw-semibold text-slate-200 mb-0">{title}</h3>
    </div>
    {children}
  </div>
);

const Settings = () => {
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const [showPass, setShowPass] = useState(false);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({ username: user?.username || '', email: user?.email || '' });
  const [passwords, setPasswords] = useState({ current: '', newPass: '', confirm: '' });

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put(`/users/${user?.id}`, { username: profile.username, email: profile.email });
      showToast('Profile updated successfully.', 'success');
    } catch (err) {
      showToast(err.response?.data?.Message || 'Failed to update profile.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSave = async (e) => {
    e.preventDefault();
    if (!passwords.current || !passwords.newPass) return showToast('Fill in all password fields.', 'warning');
    if (passwords.newPass !== passwords.confirm) return showToast('Passwords do not match.', 'error');
    if (passwords.newPass.length < 6) return showToast('Password must be at least 6 characters.', 'warning');

    setSaving(true);
    try {
      await api.post('/auth/change-password', { currentPassword: passwords.current, newPassword: passwords.newPass });
      showToast('Password changed successfully.', 'success');
      setPasswords({ current: '', newPass: '', confirm: '' });
    } catch (err) {
      showToast(err.response?.data?.Message || 'Failed to change password.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout title="Settings">
      <div className="container-fluid px-0" style={{ maxWidth: 960 }}>
        <div className="d-flex flex-column gap-4">
          <div className="d-flex flex-column gap-2">
            <h2 className="h3 fw-bold text-slate-200 mb-0">Settings</h2>
            <p className="text-slate-500 mb-0">Manage your account details and update your password.</p>
          </div>

          <div className="glass-card rounded-2xl p-4 p-md-5">
            <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-4">
              <div className="d-flex align-items-center gap-3">
                <div className="d-inline-flex align-items-center justify-content-center rounded-2 text-white fw-bold" style={{ width: 56, height: 56, background: 'linear-gradient(135deg, #14b8a6 0%, #0f766e 100%)' }}>
                  {user?.username?.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="h5 fw-bold text-slate-200 mb-1">{user?.username}</p>
                  <p className="text-slate-500 mb-2">{user?.email || 'No email set'}</p>
                  <div className="d-flex align-items-center gap-2">
                    <Shield className="h-4 w-4 text-violet-400" />
                    <span className="small fw-semibold text-violet-400">{user?.roleName}</span>
                  </div>
                </div>
              </div>
              <button type="button" onClick={logout} className="btn btn-secondary px-4 py-2">
                <LogOut className="me-2" size={16} />
                Sign out
              </button>
            </div>
          </div>

          <Section title="Profile Information" icon={User}>
            <form onSubmit={handleProfileSave} className="d-flex flex-column gap-3">
              <div className="row g-3">
                <div className="col-12 col-md-6">
                  <label className="form-label text-slate-300 small fw-semibold">Username</label>
                  <input
                    type="text"
                    value={profile.username}
                    onChange={(e) => setProfile((p) => ({ ...p, username: e.target.value }))}
                    className="form-control"
                    placeholder="Your username"
                  />
                </div>
                <div className="col-12 col-md-6">
                  <label className="form-label text-slate-300 small fw-semibold">Email</label>
                  <input
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))}
                    className="form-control"
                    placeholder="you@example.com"
                  />
                </div>
              </div>
              <div className="d-flex justify-content-end">
                <button type="submit" disabled={saving} className="btn btn-primary px-4 py-2">
                  <Save className="me-2" size={16} />
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </Section>

          <Section title="Change Password" icon={Lock}>
            <form onSubmit={handlePasswordSave} className="d-flex flex-column gap-3">
              {[
                { key: 'current', label: 'Current Password' },
                { key: 'newPass', label: 'New Password' },
                { key: 'confirm', label: 'Confirm New Password' },
              ].map(({ key, label }) => (
                <div key={key}>
                  <label className="form-label text-slate-300 small fw-semibold">{label}</label>
                  <div className="input-group">
                    <input
                      type={showPass ? 'text' : 'password'}
                      value={passwords[key]}
                      onChange={(e) => setPasswords((p) => ({ ...p, [key]: e.target.value }))}
                      placeholder="••••••••"
                      className="form-control"
                    />
                    <button type="button" onClick={() => setShowPass((s) => !s)} className="input-group-text" aria-label="Toggle password visibility">
                      {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              ))}
              <div className="d-flex justify-content-end">
                <button type="submit" disabled={saving} className="btn btn-primary px-4 py-2">
                  <Lock className="me-2" size={16} />
                  {saving ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          </Section>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Settings;
