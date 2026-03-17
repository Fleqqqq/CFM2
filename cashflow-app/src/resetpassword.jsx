import { useState, useEffect } from 'react';
import { supabase } from './supabase.js';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const accessToken = params.get('access_token');
    const type = params.get('type');

    if (type === 'recovery' && accessToken) {
      supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: ''
      }).then(({ error }) => {
        if (error) setError('Link has expired. Please request a new one.');
        else setReady(true);
      });
    } else {
      setError('Invalid reset link.');
    }
  }, []);

  const handleReset = async () => {
    if (password !== confirm) {
      setError('Passwords do not match');
      return;
    }
    const { error } = await supabase.auth.updateUser({ password });
    if (error) setError(error.message);
    else setMessage('Password changed! You can now log in.');
  };

  if (!ready) return (
    <div style={{ maxWidth: 400, margin: '100px auto', padding: 32, textAlign: 'center' }}>
      {error ? <p style={{ color: 'red' }}>{error}</p> : <p>Loading...</p>}
    </div>
  );

  return (
    <div style={{ maxWidth: 400, margin: '100px auto', padding: 32 }}>
      <h2>New Password</h2>
      {message && <p style={{ color: 'green' }}>{message}</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <input className="form-control mb-3" type="password" placeholder="New password" value={password} onChange={e => setPassword(e.target.value)} />
      <input className="form-control mb-3" type="password" placeholder="Confirm password" value={confirm} onChange={e => setConfirm(e.target.value)} />
      <button className="btn btn-primary w-100" onClick={handleReset}>Change Password</button>
    </div>
  );
}