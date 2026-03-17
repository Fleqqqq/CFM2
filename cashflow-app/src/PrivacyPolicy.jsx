export default function PrivacyPolicy({ t, theme, onBack }) {
  return (
    <div className="welcome-container py-5">
      <div className="container" style={{ maxWidth: '800px' }}>
        <button className="btn btn-outline-secondary mb-4 rounded-pill px-4" onClick={onBack}>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-arrow-left me-2" viewBox="0 0 16 16">
            <path fillRule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8z"/>
          </svg>
          {t?.back || 'Back'}
        </button>
        
        <div className="card border-0 shadow-lg p-4 p-md-5 rounded-4">
          <h1 className="display-5 fw-bold mb-4">Privacy Policy</h1>
          <p className="text-muted mb-4">Last Updated: March 7, 2026</p>
          
          <section className="mb-5">
            <h2 className="h4 fw-bold mb-3">1. Introduction</h2>
            <p className="text-secondary">At Rahanto, we take your privacy seriously. This policy explains how we collect, use, and protect your personal information.</p>
          </section>

          <section className="mb-5">
            <h2 className="h4 fw-bold mb-3">2. Data We Collect</h2>
            <ul className="text-secondary">
              <li><strong>Email address:</strong> For account management and communication.</li>
              <li><strong>Project Data:</strong> The financial data you input is stored securely to provide you with forecasting services.</li>
              <li><strong>Usage Data:</strong> Anonymous information about how you use our app to help us improve.</li>
            </ul>
          </section>

          <section className="mb-5">
            <h2 className="h4 fw-bold mb-3">3. How We Use Your Data</h2>
            <p className="text-secondary">Your data is used solely to provide and improve the Cash Flow Calculator services. We do not sell your personal data to third parties.</p>
          </section>

          <section className="mb-4">
            <h2 className="h4 fw-bold mb-3">4. Security</h2>
            <p className="text-secondary">We use industry-standard security measures, including encryption and secure hosting via Supabase, to protect your information.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
