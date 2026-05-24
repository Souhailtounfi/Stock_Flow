import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { User, Lock, ArrowRight, Boxes } from 'lucide-react';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      showToast('Please fill in all fields.', 'warning');
      return;
    }

    setLoading(true);
    try {
      await login(username, password);
      showToast('Logged in successfully!', 'success');
      navigate('/dashboard');
    } catch (err) {
      showToast(err.response?.data?.Message || 'Invalid username or password.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center px-3 py-5">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 col-sm-10 col-md-8 col-lg-5">
            <div className="card border-0 shadow-lg surface-panel">
              <div className="card-body p-4 p-md-5">
                <div className="text-center mb-4">
                  <div className="d-inline-flex align-items-center justify-content-center rounded-4 border border-success-subtle p-3 mb-3" style={{ background: 'rgba(20, 184, 166, 0.12)' }}>
                    <Boxes className="text-emerald-500" style={{ width: 28, height: 28 }} />
                  </div>
                  <h1 className="h3 fw-bold mb-2 page-title text-slate-200">Welcome back</h1>
                  <p className="mb-0 subtle-muted">Sign in to manage inventory, invoices, and teams.</p>
                </div>

                <form onSubmit={handleSubmit} className="vstack gap-3">
                  <div>
                    <label className="form-label text-slate-500 small fw-semibold">Username</label>
                    <div className="input-group">
                      <span className="input-group-text">
                        <User size={16} />
                      </span>
                      <input
                        type="text"
                        name="username"
                        value={username}
                        autoComplete="username"
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="admin"
                        className="form-control"
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="form-label text-slate-500 small fw-semibold">Password</label>
                    <div className="input-group">
                      <span className="input-group-text">
                        <Lock size={16} />
                      </span>
                      <input
                        type="password"
                        name="password"
                        value={password}
                        autoComplete="current-password"
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="form-control"
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <button type="submit" disabled={loading} className="btn btn-success btn-lg w-100 mt-2">
                    {loading ? 'Logging in...' : 'Sign In'}
                    <ArrowRight className="ms-2" size={16} />
                  </button>
                </form>

                <p className="text-center mt-4 mb-0 text-slate-500">
                  Employee accounts are managed by your administrator.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
