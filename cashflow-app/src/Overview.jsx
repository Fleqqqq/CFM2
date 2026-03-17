import { useState } from 'react';

export default function Overview({ project, onUpdateProject, onContinue, onHome, t }) {
  const [editing, setEditing] = useState(null);
  const [value, setValue] = useState('');
  const sections = [
    { key: 'name', label: t.overview.sections.name || 'Project name', type: 'text' },
    { key: 'initialCash', label: t.overview.sections.initialCash || 'Starting cash', type: 'number' },
    { key: 'monthlyRevenue', label: t.overview.sections.monthlyRevenue || 'Monthly revenue', type: 'number' },
    { key: 'fixedCosts', label: t.overview.sections.fixedCosts || 'Monthly fixed costs', type: 'number' },
    { key: 'profitPerItem', label: t.overview.sections.profitPerItem || 'Profit per item', type: 'number' },
    { key: 'unitsPerMonth', label: t.overview.sections.unitsPerMonth || 'Estimated units / month', type: 'number' },
  ];

  const startEdit = (key) => {
    setEditing(key);
    setValue(project[key] ?? '');
  };

  const save = () => {
    if (editing === null) return;
    const updated = { ...project, [editing]: (value === '' ? undefined : (sections.find(s => s.key === editing)?.type === 'number' ? Number(value) : value)) };
    onUpdateProject(updated);
    setEditing(null);
  };

  const cancel = () => {
    setEditing(null);
  };

  return (
    <div className="overview-container">
      <nav className="top-nav">
        <a href="#" className="nav-logo" onClick={(e) => { e.preventDefault(); onHome && onHome(); }} title="Go to Front Page">Rahanto</a>
      </nav>
      <main className="overview-content fade-scale">
        <h1 className="mb-3">{t.overview.title || 'Overview'}</h1>
        <p className="text-secondary mb-4" style={{maxWidth: '500px', margin: '0 auto 1.5rem auto', textAlign: 'center'}}>
          {t.overview.confirmDetails}
        </p>
        <div className="card overview-card" style={{ borderRadius: '16px', overflow: 'hidden', border: 'none', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}>
          <div className="card-body p-4">
            <div className="row g-3">
            {sections.map(s => (
              <div key={s.key} className="col-12 col-md-6">
                <div className="overview-item">
                  {editing === s.key ? (
                    <div className="edit-view w-100">
                      <label className="form-label small text-muted text-uppercase fw-bold">{s.label}</label>
                      <input
                        autoFocus
                        className="form-control form-control-sm mb-2"
                        type={s.type || 'text'}
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && save()}
                      />
                      <div className="d-flex justify-content-end gap-2">
                        <button className="btn btn-sm btn-outline-secondary" onClick={cancel}>{t.cancel || 'Cancel'}</button>
                        <button className="btn btn-sm btn-primary" onClick={save}>{t.save || 'Save'}</button>
                      </div>
                    </div>
                  ) : (
                    <div className="read-view w-100 align-items-start">
                      <div>
                        <div className="text-secondary small fw-bold text-uppercase">{s.label}</div>
                        <div className="h5 mb-0 mt-1 fw-bold">{String(project[s.key] ?? '—')}</div>
                      </div>
                      <button className="btn btn-sm btn-link text-decoration-none" onClick={() => startEdit(s.key)}>{t.edit || 'Edit'}</button>
                    </div>
                  )}
                </div>
              </div>
            ))}
            </div>
          </div>
        </div>
        <div className="text-center mt-4">
          <button className="btn btn-primary" style={{padding: '0.6rem 2rem'}} onClick={onContinue}>{t.overview.continue || 'Continue to app'}</button>
        </div>
      </main>
    </div>
  );
}
