import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Boxes, ShieldCheck, Users } from 'lucide-react';

const Register = () => {
  const navigate = useNavigate();

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center px-3 py-5">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 col-sm-10 col-md-8 col-lg-6">
            <div className="card border-0 shadow-lg surface-panel">
              <div className="card-body p-4 p-md-5">
                <div className="text-center mb-4">
                  <div className="d-inline-flex align-items-center justify-content-center rounded-4 border border-success-subtle p-3 mb-3" style={{ background: 'rgba(20, 184, 166, 0.12)' }}>
                    <Boxes className="text-emerald-500" style={{ width: 28, height: 28 }} />
                  </div>
                  <h1 className="h3 fw-bold mb-2 page-title text-slate-200">Employee access is admin-managed</h1>
                  <p className="mb-4 subtle-muted">
                    Only administrators can create employee accounts. Use the Users panel to add new team members and control their roles.
                  </p>
                </div>

                <div className="rounded-3 p-4 surface-panel-soft mb-4">
                  <div className="d-flex align-items-start gap-3 mb-3">
                    <ShieldCheck className="text-emerald-500 mt-1" size={18} />
                    <div>
                      <p className="fw-semibold mb-1 text-slate-200">Admin-owned onboarding</p>
                      <p className="small mb-0 text-slate-500">This keeps employee access controlled and avoids public sign-ups.</p>
                    </div>
                  </div>
                  <div className="d-flex align-items-start gap-3">
                    <Users className="text-sky-400 mt-1" size={18} />
                    <div>
                      <p className="fw-semibold mb-1 text-slate-200">Create employees from the admin panel</p>
                      <p className="small mb-0 text-slate-500">Open Users, create a new employee account, and assign the right role instantly.</p>
                    </div>
                  </div>
                </div>

                <div className="d-grid gap-2">
                  <button type="button" onClick={() => navigate('/login')} className="btn btn-primary btn-lg">
                    <ArrowLeft className="me-2" size={16} />
                    Back to sign in
                  </button>
                  <button type="button" onClick={() => navigate('/users')} className="btn btn-secondary btn-lg">
                    Open Users panel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
