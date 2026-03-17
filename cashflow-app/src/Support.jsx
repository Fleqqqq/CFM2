import { useState } from 'react';

export default function Support({ user, onClose, t }) {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSending(true);
    setError('');
    
    try {
      const response = await fetch("https://formsubmit.co/ajax/support@rahanto.fi", {
        method: "POST",
        headers: { 
            "Content-Type": "application/json",
            "Accept": "application/json"
        },
        body: JSON.stringify({
            email: user?.email,
            subject: subject,
            message: message,
            _replyto: user?.email,
            _captcha: "false"
        })
      });

      if (response.ok) {
        setSent(true);
      } else {
        setError(t.errorSending || 'Failed to send message. Please try again.');
      }
    } catch (err) {
      console.error(err);
      setError(t.errorSending || 'An error occurred. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  if (sent) {
    return (
      <div className="container mt-5" style={{maxWidth: '600px'}}>
        <div className="card border-0 shadow-sm" style={{ borderRadius: '16px', overflow: 'hidden' }}>
          <div className="card-body text-center p-5">
            <div className="mb-4 text-success">
              <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" fill="currentColor" viewBox="0 0 16 16">
                <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/>
              </svg>
            </div>
            <h3 className="mb-3">{t.requestSent}</h3>
            <p className="text-muted mb-4">{t.supportMessageSent}</p>
            <button className="btn btn-primary" onClick={onClose}>{t.return}</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-5" style={{maxWidth: '600px'}}>
      <div className="d-flex align-items-center mb-4">
        <button className="btn btn-outline-secondary me-3" onClick={onClose}>&larr; {t.back}</button>
        <h2 className="mb-0">{t.support}</h2>
      </div>
      
      <div className="card border-0 shadow-sm" style={{ borderRadius: '16px', overflow: 'hidden' }}>
        <div className="card-body p-4">
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label small fw-bold text-secondary">{t.email}</label>
              <input type="email" className="form-control" value={user?.email || ''} disabled />
            </div>
            <div className="mb-3">
              <label className="form-label small fw-bold text-secondary">{t.subject}</label>
              <input type="text" className="form-control" required value={subject} onChange={e => setSubject(e.target.value)} />
            </div>
            <div className="mb-3">
              <label className="form-label small fw-bold text-secondary">{t.message}</label>
              <textarea className="form-control" rows="5" required value={message} onChange={e => setMessage(e.target.value)}></textarea>
            </div>
            {error && <div className="alert alert-danger py-2 px-3 small">{error}</div>}
            <div className="d-flex justify-content-end">
                <button type="submit" className="btn btn-primary px-4" disabled={isSending}>
                  {isSending ? <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span> : null}
                  {t.sendRequest}
                </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}