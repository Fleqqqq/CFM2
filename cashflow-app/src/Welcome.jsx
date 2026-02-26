import { useState } from 'react';

export default function Welcome({ onStartExisting, onStartNew, onShowManager, t, language, onChangeLanguage, existingProjects = [], isCreatingNewProject = false, user, onOpenLogin, onLogout, onOpenProfile, onUpgradeToPremium }) {
  const [mode, setMode] = useState(null); // 'existing' or 'startup'
  const [step, setStep] = useState(0);
  const [data, setData] = useState({});
  const [error, setError] = useState(null);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [discountCode, setDiscountCode] = useState('');
  const [redemptionStatus, setRedemptionStatus] = useState({ message: '', type: '' });

  const handleRedeemCode = async () => {
    if (discountCode.toUpperCase() === 'TEST12') {
      if (user && !user.isPremium) { // Check if user exists and is not already premium
        await onUpgradeToPremium();
        setRedemptionStatus({ message: t.welcome.codeSuccess, type: 'success' });
      }
    } else {
      setRedemptionStatus({ message: t.welcome.codeInvalid, type: 'danger' });
    }
  };

  const existingSteps = [
    { key: 'name', label: t.welcome.existing.name || 'Business name', field: 'name', type: 'text', placeholder: 'My Business' },
    { key: 'cash', label: t?.welcome?.existing?.cash || 'Current cash', field: 'initialCash', type: 'number', placeholder: '10000' },
    { key: 'monthlyRevenue', label: t?.welcome?.existing?.monthlyRevenue || 'Monthly revenue', field: 'monthlyRevenue', type: 'number', placeholder: '5000' },
    { key: 'fixedCosts', label: t?.welcome?.existing?.fixedCosts || 'Monthly fixed costs', field: 'fixedCosts', type: 'number', placeholder: '2000' },
    { key: 'profitPerItem', label: t?.welcome?.existing?.profitPerItem || 'Profit per item', field: 'profitPerItem', type: 'number', placeholder: '10' },
    { key: 'unitsPerMonth', label: t?.welcome?.existing?.unitsPerMonth || 'Estimated units / month', field: 'unitsPerMonth', type: 'number', placeholder: '500' },
  ];

  const startupSteps = [
    { key: 'name', label: t?.welcome?.startup?.name || 'Business name', field: 'name', type: 'text', placeholder: 'My Business' },
    { key: 'logo', label: t?.welcome?.startup?.logo || 'Logo URL', field: 'logo', type: 'text', placeholder: 'https://...' },
  { key: 'monthlyFixedCosts', label: t?.welcome?.startup?.monthlyFixedCosts || 'Monthly fixed costs', field: 'monthlyFixedCosts', type: 'number', placeholder: '2000' },
  { key: 'profitPerItem', label: t?.welcome?.startup?.profitPerItem || 'Profit per item', field: 'profitPerItem', type: 'number', placeholder: '10' },
  ];

  const steps = mode === 'existing' ? existingSteps : startupSteps;

  const current = steps[step];

  const handleChange = (value) => {
    setError(null);
    setData(prev => ({ ...prev, [current.field]: value }));
  };

  const next = () => {
    if (current.field === 'name') {
      const name = (data.name || '').trim();
      if (name === '') {
        setError(t.welcome.error.nameEmpty);
        return;
      }
      if (existingProjects.some(p => p.name.toLowerCase() === name.toLowerCase())) {
        setError(t.welcome.error.nameExists);
        return;
      }
    }

    if (step < steps.length - 1) {
      setStep(s => s + 1);
    } else {
      finish();
    }
  };
  const handleKeydown = (e) => e.key === 'Enter' && next();

  const back = () => {
    if (step > 0) setStep(s => s - 1);
    else {
      setMode(null);
      setError(null);
    }
  };

  const skip = () => {
    // leave the field undefined and move on
    next();
  };


  const finish = () => {
    // finalize and pass to parent
    const name = data.name || (mode === 'existing' ? 'Existing Project' : 'New Project');

    const project = {
      ...data,
      name: name,
      initialCash: parseFloat(data.initialCash) || 0,
    };
    if (mode === 'existing') onStartExisting && onStartExisting(project);
    else onStartNew && onStartNew(project);
  };

  const handleStart = (action) => {
    if (!user) {
      onOpenLogin();
      return;
    }
    action();
  };

  const handleCreateProjectStart = (action) => {
    handleStart(() => {
        if (user && !user.isPremium && existingProjects.length >= 1) {
            alert(t.upgradeToCreateMore || 'Upgrade to Premium to create more projects.');
            return;
        }
        action();
    });
  };

  if (!mode) {
    return (
      // Conditional rendering based on isCreatingNewProject
      isCreatingNewProject ? (
        <div className="welcome-container">
          <nav className="top-nav">
            {/* Clicking logo from here should go back to the project manager */}
            <a href="#" className="nav-logo" onClick={(e) => { e.preventDefault(); onShowManager(); }}>Revion</a>
            <div className="nav-actions">
              <div className="position-relative d-inline-block me-2">
                <button 
                  className="btn btn-outline-secondary d-flex align-items-center gap-2"
                  onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
                >
                  <span>{language.toUpperCase()}</span>
                  <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg" style={{transform: showLanguageDropdown ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s'}}>
                    <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
                {showLanguageDropdown && (
                  <div className="dropdown-menu show position-absolute end-0 mt-2 shadow-lg border-0 fade-scale" style={{minWidth: '150px', zIndex: 1000}}>
                    <button className={`dropdown-item d-flex align-items-center justify-content-between ${language === 'en' ? 'active' : ''}`} onClick={() => { onChangeLanguage('en'); setShowLanguageDropdown(false); }}>
                      <span>English</span>
                      {language === 'en' && <span>✓</span>}
                    </button>
                    <button className={`dropdown-item d-flex align-items-center justify-content-between ${language === 'fi' ? 'active' : ''}`} onClick={() => { onChangeLanguage('fi'); setShowLanguageDropdown(false); }}>
                      <span>Suomi</span>
                      {language === 'fi' && <span>✓</span>}
                    </button>
                  </div>
                )}
              </div>
              {user ? (
                <div className="profile-dropdown-container">
                <button className="btn btn-outline-secondary d-flex align-items-center gap-2" onClick={() => setShowProfileDropdown(prev => !prev)}>
                    <span className="fw-bold">{user.name}</span>
                  {user.isPremium && <span className="badge bg-warning text-dark">Premium</span>}
                  </button>
                  {showProfileDropdown && (
                    <div className="profile-dropdown card border-0 shadow-lg fade-scale">
                      <div className="p-3 border-bottom">
                        <p className="small text-muted mb-0">Signed in as</p>
                        <p className="fw-bold mb-0">{user.email}</p>
                      </div>
                      <button className="dropdown-item" onClick={() => { onOpenProfile(); setShowProfileDropdown(false); }}>{t.profileSettings}</button>
                      {user.isPremium && <a href="mailto:support@revion.app?subject=Premium Support Request" className="dropdown-item">{t.welcome.premiumFeature5}</a>}
                      <div className="dropdown-divider"></div>
                      <button className="dropdown-item text-danger" onClick={onLogout}>Log Out</button>
                    </div>
                  )}
                </div>
              ) : <button className="btn btn-primary" onClick={onOpenLogin}>Log In</button>}
            </div>
          </nav>
          <main className="hero-section" style={{minHeight: 'calc(100vh - 75px)', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            <div className="hero-content fade-scale text-center">
              <h1 className="mb-4">{t.welcome.howToCreate}</h1>
              <div className="hero-actions justify-content-center">
                <button className="btn btn-primary" onClick={() => handleCreateProjectStart(() => {
                  setData({});
                  setMode('existing');
                })}>
                  {t?.welcome?.own || 'From an Existing Business'}
                </button>
                <button className="btn btn-secondary" onClick={() => handleCreateProjectStart(() => {
                  setData({ name: 'My Business' });
                  setMode('startup');
                })}>
                  {t?.welcome?.start || 'From a New Business Idea'}
                </button>
              </div>
            </div>
          </main>
        </div>
      ) : (
      <div className="welcome-container">
        <nav className="top-nav">
          <a href="#" className="nav-logo" onClick={(e) => e.preventDefault()}>Revion</a>
          <div className="nav-actions">
            <div className="position-relative d-inline-block me-2">
              <button 
                className="btn btn-outline-secondary d-flex align-items-center gap-2"
                onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
              >
                <span>{language.toUpperCase()}</span>
                <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg" style={{transform: showLanguageDropdown ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s'}}>
                  <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              {showLanguageDropdown && (
                <div className="dropdown-menu show position-absolute end-0 mt-2 shadow-lg border-0 fade-scale" style={{minWidth: '150px', zIndex: 1000}}>
                  <button className={`dropdown-item d-flex align-items-center justify-content-between ${language === 'en' ? 'active' : ''}`} onClick={() => { onChangeLanguage('en'); setShowLanguageDropdown(false); }}>
                    <span>English</span>
                    {language === 'en' && <span>✓</span>}
                  </button>
                  <button className={`dropdown-item d-flex align-items-center justify-content-between ${language === 'fi' ? 'active' : ''}`} onClick={() => { onChangeLanguage('fi'); setShowLanguageDropdown(false); }}>
                    <span>Suomi</span>
                    {language === 'fi' && <span>✓</span>}
                  </button>
                </div>
              )}
            </div>
            {user ? (
              <div className="profile-dropdown-container">
                <button className="btn btn-outline-secondary d-flex align-items-center gap-2" onClick={() => setShowProfileDropdown(prev => !prev)}>
                  <span className="fw-bold">{user.name}</span>
                  {user.isPremium && <span className="badge bg-warning text-dark">Premium</span>}
                </button>
                {showProfileDropdown && (
                  <div className="profile-dropdown card border-0 shadow-lg fade-scale">
                    <div className="p-3 border-bottom">
                      <p className="small text-muted mb-0">Signed in as</p>
                      <p className="fw-bold mb-0">{user.email}</p>
                    </div>
                    <button className="dropdown-item" onClick={() => { onOpenProfile(); setShowProfileDropdown(false); }}>{t.profileSettings}</button>
                    {user.isPremium && <a href="mailto:support@revion.app?subject=Premium Support Request" className="dropdown-item">{t.welcome.premiumFeature5}</a>}
                    <div className="dropdown-divider"></div>
                    <button className="dropdown-item text-danger" onClick={onLogout}>Log Out</button>
                  </div>
                )}
              </div>
            ) : <button className="btn btn-primary" onClick={onOpenLogin}>Log In</button>}
            <button className="btn btn-primary d-none d-md-inline-block">{t.welcome.requestDemo}</button>
          </div>
        </nav>

        <main className="hero-section">
          <div className="hero-content fade-scale">
            <h1>{t.welcome.heroTitle}</h1>
            <p>{t.welcome.heroSubtitle}</p>
            <div className="hero-actions">
              <button className="btn btn-primary" onClick={() => handleCreateProjectStart(() => {
                setData({});
                setMode('existing');
              })}>
                {t?.welcome?.own || 'From an Existing Business'}
              </button>
              <button className="btn btn-secondary" onClick={() => handleCreateProjectStart(() => {
                setData({ name: 'My Business' });
                setMode('startup');
              })}>
                {t?.welcome?.start || 'From a New Business Idea'}
              </button>
              {existingProjects.length > 0 && (
                <button className="btn btn-outline-secondary" onClick={onShowManager}>
                  {t.welcome.loadProject}
                </button>
              )}
            </div>
          </div>
          <div className="hero-mockup">
            <div className="mockup-header">
              <div className="mockup-dot red"></div>
              <div className="mockup-dot yellow"></div>
              <div className="mockup-dot green"></div>
            </div>
            <div className="mockup-content">
              {/* Simplified SVG of the app's chart */}
              <svg width="100%" height="100%" viewBox="0 0 300 180" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M0 150 H 300" stroke="#e9ecef" strokeWidth="1"/>
                <path d="M0 120 H 300" stroke="#e9ecef" strokeWidth="1"/>
                <path d="M0 90 H 300" stroke="#e9ecef" strokeWidth="1"/>
                <path d="M0 60 H 300" stroke="#e9ecef" strokeWidth="1"/>
                <path d="M0 30 H 300" stroke="#e9ecef" strokeWidth="1"/>
                <path d="M20 120 C 80 140, 100 40, 180 60 S 250 100, 280 80" stroke="#2f9e44" strokeWidth="3" fill="none" strokeLinecap="round"/>
                <rect x="20" y="20" width="80" height="10" rx="2" fill="#f1f3f5"/>
                <rect x="20" y="160" width="40" height="8" rx="2" fill="#e9ecef"/>
                <rect x="70" y="160" width="40" height="8" rx="2" fill="#e9ecef"/>
                <rect x="120" y="160" width="40" height="8" rx="2" fill="#e9ecef"/>
                <rect x="170" y="160" width="40" height="8" rx="2" fill="#e9ecef"/>
                <rect x="220" y="160" width="40" height="8" rx="2" fill="#e9ecef"/>
              </svg>
            </div>
          </div>
        </main>

        <section className="pricing-section">
          <div className="container-lg">
            <h2 className="text-center">{t.welcome.pricingTitle}</h2>
            <p className="text-center text-secondary mb-5">{t.welcome.pricingSubtitle}</p>
            <div className="pricing-grid">
              <div className="pricing-card">
                <h3>{t.welcome.free}</h3>
                <p className="price">€0</p>
                <p className="price-desc">{t.welcome.freeDesc}</p>
                <ul className="features-list">
                  <li>✓ {t.welcome.freeFeature1}</li>
                  <li>✓ {t.welcome.freeFeature2}</li>
                  <li>✓ {t.welcome.freeFeature3}</li>
                  <li>✓ {t.welcome.freeFeature4}</li>
                </ul>
                <button className="btn btn-outline-secondary w-100 mt-auto" onClick={() => handleStart(() => {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                })}>{t.welcome.getStartedFree}</button>
              </div>
              <div className="pricing-card recommended">
                <div className="recommended-badge">{t.welcome.mostPopular}</div>
                <h3>{t.welcome.premium}</h3>
                <div className="price-toggle">
                  <p className="price">€9,90<span className="price-period">{t.welcome.perMonth}</span></p>
                  <p className="price-annual">
                    {t.welcome.annualPrice('€79,90')} <span className="badge bg-success-subtle text-success-emphasis">{t.welcome.save('33')}</span>
                  </p>
                </div>
                <p className="price-desc">{t.welcome.premiumDesc}</p>
                <ul className="features-list">
                  <li>✓ {t.welcome.premiumFeature1}</li>
                  <li>✓ {t.welcome.premiumFeature2}</li>
                  <li>✓ {t.welcome.premiumFeature3}</li>
                  <li>✓ {t.welcome.premiumFeature4}</li>
                  <li>✓ {t.welcome.premiumFeature5}</li>
                  <li>✓ {t.welcome.premiumFeature6}</li>
                  <li>✓ {t.welcome.premiumFeature7}</li>
                  <li>✓ {t.welcome.premiumFeature8}</li>
                  <li>✓ {t.welcome.premiumFeature9}</li>
                  <li>✓ {t.welcome.premiumFeature10}</li>
                  <li>✓ {t.welcome.premiumFeature11}</li>
                  <li>✓ {t.welcome.premiumFeature12}</li>
                  <li>✓ {t.welcome.premiumFeature13}</li>
                  <li>✓ {t.welcome.premiumFeature14}</li>
                </ul>
                {user?.isPremium ? (
                  <button className="btn btn-success w-100 mt-auto" disabled>{t.welcome.premiumActivated}</button>
                ) : (
                  <div className="mt-auto">
                    <div className="input-group">
                      <input 
                        type="text" 
                        className="form-control" 
                        placeholder={t.welcome.discountCode}
                        value={discountCode}
                        onChange={(e) => setDiscountCode(e.target.value)}
                      />
                      <button className="btn btn-primary" onClick={() => handleStart(handleRedeemCode)}>{t.welcome.redeem}</button>
                    </div>
                    {redemptionStatus.message && <div className={`small mt-2 ${redemptionStatus.type === 'success' ? 'text-success' : 'text-danger'}`}>{redemptionStatus.message}</div>}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
        <footer className="logo-cloud">
          <h3>{t.welcome.trustedBy}</h3>
          <div className="logo-grid">
            {/* Placeholder logos */}
            <svg className="client-logo" height="30" viewBox="0 0 120 40" xmlns="http://www.w3.org/2000/svg"><text x="10" y="25" fontFamily="Arial" fontSize="16" fontWeight="bold">Logo One</text></svg>
            <svg className="client-logo" height="30" viewBox="0 0 120 40" xmlns="http://www.w3.org/2000/svg"><text x="10" y="25" fontFamily="Arial" fontSize="16" fontWeight="bold">Company</text></svg>
            <svg className="client-logo" height="30" viewBox="0 0 120 40" xmlns="http://www.w3.org/2000/svg"><text x="10" y="25" fontFamily="Arial" fontSize="16" fontWeight="bold">Startup</text></svg>
            <svg className="client-logo" height="30" viewBox="0 0 120 40" xmlns="http://www.w3.org/2000/svg"><text x="10" y="25" fontFamily="Arial" fontSize="16" fontWeight="bold">Brand Inc</text></svg>
            <svg className="client-logo" height="30" viewBox="0 0 120 40" xmlns="http://www.w3.org/2000/svg"><text x="10" y="25" fontFamily="Arial" fontSize="16" fontWeight="bold">Venture</text></svg>
          </div>
        </footer>
      </div>
      )
    );
  }

  const progress = ((step + 1) / steps.length) * 100;

  return (
    <div className="welcome-container">
      <nav className="top-nav">
        <a href="#" className="nav-logo" onClick={(e) => { e.preventDefault(); setMode(null); }}>Revion</a>
        <div className="nav-actions">
          <div className="position-relative d-inline-block me-2">
            <button 
              className="btn btn-outline-secondary d-flex align-items-center gap-2"
              onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
            >
              <span>{language.toUpperCase()}</span>
              <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg" style={{transform: showLanguageDropdown ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s'}}>
                <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            {showLanguageDropdown && (
              <div className="dropdown-menu show position-absolute end-0 mt-2 shadow-lg border-0 fade-scale" style={{minWidth: '150px', zIndex: 1000}}>
                <button className={`dropdown-item d-flex align-items-center justify-content-between ${language === 'en' ? 'active' : ''}`} onClick={() => { onChangeLanguage('en'); setShowLanguageDropdown(false); }}>
                  <span>English</span>
                  {language === 'en' && <span>✓</span>}
                </button>
                <button className={`dropdown-item d-flex align-items-center justify-content-between ${language === 'fi' ? 'active' : ''}`} onClick={() => { onChangeLanguage('fi'); setShowLanguageDropdown(false); }}>
                  <span>Suomi</span>
                  {language === 'fi' && <span>✓</span>}
                </button>
              </div>
            )}
          </div>
          {user ? (
            <div className="profile-dropdown-container">
              <button className="btn btn-outline-secondary d-flex align-items-center gap-2" onClick={() => setShowProfileDropdown(prev => !prev)}>
                <span className="fw-bold">{user.name}</span>
                {user.isPremium && <span className="badge bg-warning text-dark">Premium</span>}
              </button>
              {showProfileDropdown && (
                <div className="profile-dropdown card border-0 shadow-lg fade-scale">
                  <div className="p-3 border-bottom">
                    <p className="small text-muted mb-0">Signed in as</p>
                    <p className="fw-bold mb-0">{user.email}</p>
                  </div>
                  <button className="dropdown-item" onClick={() => { onOpenProfile(); setShowProfileDropdown(false); }}>{t.profileSettings}</button>
                  {user.isPremium && <a href="mailto:support@revion.app?subject=Premium Support Request" className="dropdown-item">{t.welcome.premiumFeature5}</a>}
                  <div className="dropdown-divider"></div>
                  <button className="dropdown-item text-danger" onClick={onLogout}>Log Out</button>
                </div>
              )}
            </div>
          ) : <button className="btn btn-primary" onClick={onOpenLogin}>Log In</button>}
        </div>
      </nav>

      <div className="question-flow-wrapper">
        <div className="question-flow-content fade-scale">
          {/* Progress Bar */}
          <div className="progress mb-5" style={{ height: '8px' }}>
            <div className="progress-bar" role="progressbar" style={{ width: `${progress}%` }} aria-valuenow={progress} aria-valuemin="0" aria-valuemax="100"></div>
          </div>

          {/* Question Content */}
          <div className="question-content text-center">
            <h2 className="question-title mb-5">{current.label}</h2>
            <input
              autoFocus
              className="form-control form-control-lg text-center mx-auto"
              type={current.type}
              placeholder={current.placeholder}
              value={data[current.field] ?? ''}
              onChange={(e) => handleChange(e.target.value)}
              onKeyDown={handleKeydown}
              onFocus={(e) => e.target.select()}
            />
            {error && <div className="text-danger mt-3 fw-bold">{error}</div>}
          </div>

          {/* Navigation */}
          <div className="d-flex justify-content-between align-items-center mt-5">
            <button className="btn btn-outline-secondary" onClick={back}>{t.back}</button>
            <button className="btn btn-sm btn-link text-decoration-none text-secondary" onClick={skip}>{t.skip}</button>
            <button className="btn btn-primary" onClick={next}>{step < steps.length - 1 ? t.next : t.finish}</button>
          </div>
        </div>
      </div>
    </div>
  );
}
