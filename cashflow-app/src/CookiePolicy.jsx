export default function CookiePolicy({ t, theme, onBack }) {
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
          <h1 className="display-5 fw-bold mb-4">Cookie Policy</h1>
          <p className="text-muted mb-4">Last Updated: March 7, 2026</p>
          
          <section className="mb-5">
            <h2 className="h4 fw-bold mb-3">1. What Are Cookies?</h2>
            <p className="text-secondary">Cookies are small text files that are stored on your device when you visit a website. They help the website remember your preferences and improve your experience.</p>
          </section>

          <section className="mb-5">
            <h2 className="h4 fw-bold mb-3">2. How We Use Cookies</h2>
            <p className="text-secondary">We use cookies for the following purposes:</p>
            <ul className="text-secondary">
              <li><strong>Essential Cookies:</strong> These are necessary for the website to function, such as remembering your login session.</li>
              <li><strong>Performance Cookies:</strong> We use these to understand how visitors interact with our app (e.g., via Google Analytics).</li>
              <li><strong>Preference Cookies:</strong> These remember your settings, like your language and theme choice.</li>
            </ul>
          </section>

          <section className="mb-4">
            <h2 className="h4 fw-bold mb-3">3. Managing Cookies</h2>
            <p className="text-secondary">Most web browsers allow you to control cookies through their settings. You can delete or block cookies, but doing so may affect the functionality of our application.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
