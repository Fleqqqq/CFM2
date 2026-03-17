import { useState } from 'react';

export default function ProfileSettings({ user, onUpdateUser, onClose, onDeleteAccount, t }) {
  const [name, setName] = useState(user.name || '');
  const [email, setEmail] = useState(user.email || '');
  const [password, setPassword] = useState(user.password || '');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSave = () => {
    setError('');
    if (!name || !email || !password) {
      setError(t.fillAllFields || 'Please fill in all fields');
      return;
    }

    if (password.length < 8) {
      setError(t.passwordTooShort || 'Password must be at least 8 characters long');
      return;
    }
    
    onUpdateUser({ ...user, name, email, password });
  };

  return (
    <>
      <nav className="top-nav">
        <a href="#" className="nav-logo" onClick={(e) => { e.preventDefault(); onClose(); }}>Rahanto</a>
      </nav>
      <main className="p-4 mx-auto" style={{maxWidth: '600px'}}>
        <div className="card border-0 shadow-sm fade-scale" style={{ borderRadius: '16px', overflow: 'hidden' }}>
          <div className="card-body p-5">
            <h2 className="mb-4">{t.profileSettings}</h2>
            {error && <div className="alert alert-danger">{error}</div>}
            <div className="mb-3">
              <label className="form-label">{t.name}</label>
              <input type="text" className="form-control" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="mb-3">
              <label className="form-label">{t.email}</label>
              <input type="email" className="form-control" value={email} onChange={(e) => setEmail(e.target.value)} />
              <div className="form-text text-muted">{t.migrateEmailWarning}</div>
            </div>
            <div className="mb-3">
              <label className="form-label">{t.password}</label>
              <div className="input-group">
                <input type={showPassword ? "text" : "password"} className="form-control" value={password} onChange={(e) => setPassword(e.target.value)} />
                <button className="btn btn-outline-secondary" type="button" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M13.359 11.238C15.06 9.72 16 8 16 8s-3-5.5-8-5.5a7.028 7.028 0 0 0-2.79.588l.77.771A5.944 5.944 0 0 1 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.134 13.134 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755-.165.165-.337.328-.517.486l.708.709z"/><path d="M11.297 9.377L9.499 7.58A1.12 1.12 0 0 0 8 7.125l-1.279 1.278a1.12 1.12 0 0 0 .329 1.748l1.748.329a1.12 1.12 0 0 0 1.5-.503zM3.694 2.96l1.302 1.299a4.296 4.296 0 0 0-.496.768C3.23 6.38 2 8 2 8s3 5.5 8 5.5c.747 0 1.487-.155 2.197-.436l1.297 1.296a1.5 1.5 0 1 0 2.121-2.12l-12.93-12.93a1.5 1.5 0 0 0-2.121 2.12zm4.915 4.916l1.935 1.935a2.498 2.498 0 0 1-2.544-2.544z"/>
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8zM1.173 8a13.133 13.133 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.133 13.133 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5c-2.12 0-3.879-1.168-5.168-2.457A13.134 13.134 0 0 1 1.172 8z"/><path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0z"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>
            <div className="mt-4 pt-4 border-top text-end">
              <button className="btn btn-outline-danger" onClick={() => onDeleteAccount(user.email)}>{t.deleteAccount}</button>
            </div>
            <div className="d-flex justify-content-end gap-2 mt-4">
              <button className="btn btn-outline-secondary" onClick={onClose}>{t.cancel}</button>
              <button className="btn btn-primary" onClick={handleSave}>{t.saveChanges}</button>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}