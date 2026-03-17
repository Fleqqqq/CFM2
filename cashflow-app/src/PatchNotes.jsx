export default function PatchNotes({ t, theme, onBack }) {
  const updates = [
    {
      version: '1.2.0',
      date: 'March 7, 2026',
      title: 'Daily Check-ins & History Polish',
      changes: [
        'Added a Daily Check-in system to encourage engagement.',
        'Revamped the History & Trends page with a cleaner chart design.',
        'Added summary metrics grid to the History page (Previous Month Rev, Growth %, etc.).',
        'Fixed Finnish language support bug that caused crashes on the History page.',
        'Added legal and update pages (this one!).'
      ]
    },
    {
      version: '1.1.0',
      date: 'March 1, 2026',
      title: 'Financial Diagnosis & Premium Features',
      changes: [
        'Introduced the Financial Diagnosis tool to highlight business risks.',
        'Launched Premium subscription with unlimited projects and CSV export.',
        'Added support for Dark Mode.',
        'Implemented Loan and Customer management modules.'
      ]
    },
    {
      version: '1.0.0',
      date: 'February 15, 2026',
      title: 'The Beginnings',
      changes: [
        'Initial launch of Rahanto Cash Flow Calculator.',
        'Basic forecasting engine and project management.',
        'English and Finnish language support.'
      ]
    }
  ];

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
          <h1 className="display-5 fw-bold mb-2">Patch Notes</h1>
          <p className="text-muted mb-5">Keep up with the latest updates and improvements.</p>
          
          <div className="d-flex flex-column gap-5">
            {updates.map((update, idx) => (
              <section key={idx} className="border-bottom pb-4 mb-2 last:border-0">
                <div className="d-flex align-items-center gap-3 mb-3">
                  <span className="badge bg-primary-subtle text-primary-emphasis rounded-pill px-3 py-2">{update.version}</span>
                  <span className="text-muted small fw-bold text-uppercase">{update.date}</span>
                </div>
                <h2 className="h4 fw-bold mb-3">{update.title}</h2>
                <ul className="text-secondary">
                  {update.changes.map((change, cIdx) => (
                    <li key={cIdx} className="mb-2">{change}</li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
