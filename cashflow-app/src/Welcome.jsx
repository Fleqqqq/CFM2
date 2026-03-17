import { useState, useEffect } from 'react';

const FaqItem = ({ title, desc, isLast }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div 
      className={`faq-accordion-item ${!isLast && !isOpen ? 'border-bottom' : ''}`} 
      onClick={() => setIsOpen(!isOpen)} 
      style={{ 
        cursor: 'pointer', 
        transition: 'all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)', 
        transform: isOpen ? 'scale(1.02)' : 'scale(1)',
        backgroundColor: isOpen ? 'var(--highlight-bg)' : 'transparent',
        borderRadius: isOpen ? '16px' : '0px',
        margin: isOpen ? '1rem -1rem' : '0',
        padding: isOpen ? '1.5rem' : '1.25rem 0',
        boxShadow: isOpen ? '0 15px 35px -5px rgba(0,0,0,0.1)' : 'none',
        position: 'relative',
        zIndex: isOpen ? 10 : 1
      }} 
      onMouseOver={e => !isOpen && (e.currentTarget.style.backgroundColor = 'var(--highlight-bg)')} 
      onMouseOut={e => !isOpen && (e.currentTarget.style.backgroundColor = 'transparent')}
    >
      <div className="d-flex justify-content-between align-items-center">
        <h3 className="h5 mb-0 fw-bold" style={{ color: isOpen ? 'var(--brand)' : 'var(--text-primary)', transition: 'color 0.3s' }}>{title}</h3>
        <span 
          className="text-primary d-flex align-items-center justify-content-center flex-shrink-0 ms-3" 
          style={{
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', 
            transition: 'all 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
            backgroundColor: isOpen ? 'rgba(47, 158, 68, 0.15)' : 'var(--page-bg)',
            width: '36px', height: '36px', borderRadius: '50%'
          }}
        >
          <svg width="14" height="8" viewBox="0 0 14 8" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1 1L7 7L13 1" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </span>
      </div>
      <div 
        style={{
          maxHeight: isOpen ? '500px' : '0px', 
          overflow: 'hidden', 
          transition: 'all 0.45s cubic-bezier(0.25, 0.8, 0.25, 1)',
          opacity: isOpen ? 1 : 0,
          transform: isOpen ? 'translateY(0)' : 'translateY(-15px)'
        }}
      >
        <p className="text-secondary mt-3 mb-0 lh-lg fs-6">{desc}</p>
      </div>
    </div>
  );
};

export default function Welcome({ onStartExisting, onStartNew, onShowManager, t, language, onChangeLanguage, theme, onToggleTheme, existingProjects = [], isCreatingNewProject = false, user, onOpenLogin, onLogout, onOpenProfile, onOpenSubmissions, onOpenSupport, onUpgradeToPremium, onLimitReached, onRedeemUpgrade, setActivePage, stabilityTestData }) {
  const [mode, setMode] = useState(isCreatingNewProject ? 'existing' : null); // 'existing' or 'startup'
  const [step, setStep] = useState(0);
  const [data, setData] = useState({});
  const [error, setError] = useState(null);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [discountCode, setDiscountCode] = useState('');
  const [redemptionStatus, setRedemptionStatus] = useState({ message: '', type: '' });

  useEffect(() => {
    if (isCreatingNewProject) {
      setMode('existing');
      setStep(0);
      
      // Pre-fill from stability test if data exists
      if (stabilityTestData?.answers) {
        const { answers } = stabilityTestData;
        const initialCash = answers[0]?.label.includes('5000') ? 5000 : (answers[0]?.label.includes('10000') ? 10000 : 0);
        
        setData({
          initialCash: initialCash || '',
          fixedCosts: answers[2]?.label.includes('2000') ? 2000 : (answers[2]?.label.includes('5000') ? 5000 : ''),
          // We can't perfectly map these but we try our best to bridge the gap
        });
      } else {
        setData({});
      }
    }
  }, [isCreatingNewProject, stabilityTestData]);

  const handleRedeemCode = async () => {
    if (discountCode.toUpperCase() === 'TEST12') {
      if (user && !user.isPremium && onRedeemUpgrade) {
        await onRedeemUpgrade();
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

  const steps = (mode === 'existing' || (isCreatingNewProject && !mode)) ? existingSteps : startupSteps;

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
    else if (isCreatingNewProject) {
      window.scrollTo(0, 0);
      onShowManager();
    } else {
      setMode(null);
      setError(null);
    }
  };

  useEffect(() => {
    if (!mode && !isCreatingNewProject) {
      window.scrollTo(0, 0);
    }
  }, [mode, isCreatingNewProject]);

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
            if (onLimitReached) onLimitReached();
            else alert(t.upgradeToCreateMore || 'Upgrade to Premium to create more projects.');
            return;
        }
        action();
    });
  };


  const progress = ((step + 1) / (steps.length || 1)) * 100;

  // Decide what to show in the main area
  let mainContent;
  if (!mode && !isCreatingNewProject) {
    // Landing Page Hero + Content
    mainContent = (
      <>
        <main className="hero-section">
          <div className="hero-content fade-scale text-center">
            <h1 className="display-4 fw-bold mb-3">{t.welcome.heroTitle}</h1>
            <p className="lead text-muted mb-5 mx-auto" style={{maxWidth: '600px'}}>{t.welcome.heroSubtitle}</p>
            <div className="hero-actions d-flex justify-content-center gap-3">
              <button className="btn btn-primary btn-lg px-5 rounded-pill shadow fw-bold d-flex align-items-center gap-2" onClick={() => handleCreateProjectStart(() => {
                setData({});
                setMode('existing');
                setStep(0);
              })}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                  <path fillRule="evenodd" d="M1 8a7 7 0 1 0 14 0A7 7 0 0 0 1 8zm15 0A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM8.5 4.5a.5.5 0 0 0-1 0v3h-3a.5.5 0 0 0 0 1h3v3a.5.5 0 0 0 1 0v-3h3a.5.5 0 0 0 0-1h-3v-3z"/>
                </svg>
                {t?.welcome?.own || 'From an Existing Business'}
              </button>
              <button className="btn btn-outline-secondary btn-lg rounded-pill px-4 fw-bold" onClick={() => {
                  if (!user) { onOpenLogin(); return; }
                  onShowManager();
                }}>
                  {t.welcome.loadProject}
                </button>
                <button className="btn btn-light border-0 shadow-sm btn-lg rounded-pill px-4 fw-bold" onClick={() => setActivePage('financial-stability-test')}>
                  {t.stabilityTest}
                </button>
            </div>
          </div>
          <div className="hero-mockup">
            <div className="mockup-header">
              <div className="mockup-dot red"></div>
              <div className="mockup-dot yellow"></div>
              <div className="mockup-dot green"></div>
            </div>
            <div className="mockup-content">
              <svg width="100%" viewBox="0 0 300 180" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M0 150 H 300" stroke="var(--border-color)" strokeWidth="1"/>
                <path d="M0 120 H 300" stroke="var(--border-color)" strokeWidth="1"/>
                <path d="M0 90 H 300" stroke="var(--border-color)" strokeWidth="1"/>
                <path d="M0 60 H 300" stroke="var(--border-color)" strokeWidth="1"/>
                <path d="M0 30 H 300" stroke="var(--border-color)" strokeWidth="1"/>
                <path d="M20 120 C 80 140, 100 40, 180 60 S 250 100, 280 80" stroke="var(--primary-color)" strokeWidth="3" fill="none" strokeLinecap="round"/>
                <rect x="20" y="20" width="80" height="10" rx="2" fill="var(--highlight-bg)"/>
                <rect x="20" y="160" width="40" height="8" rx="2" fill="var(--border-color)"/>
                <rect x="70" y="160" width="40" height="8" rx="2" fill="var(--border-color)"/>
                <rect x="120" y="160" width="40" height="8" rx="2" fill="var(--border-color)"/>
                <rect x="170" y="160" width="40" height="8" rx="2" fill="var(--border-color)"/>
                <rect x="220" y="160" width="40" height="8" rx="2" fill="var(--border-color)"/>
              </svg>
            </div>
          </div>
        </main>

        <section className="guide-section py-5 my-5">
          <div className="container-lg" style={{ maxWidth: '800px' }}>
            <div className="text-center mb-5">
              <span className="badge bg-primary-subtle text-primary px-3 py-2 rounded-pill mb-3 fw-bold tracking-wide">SUPPORT / FAQ</span>
              <h1 className="display-4 fw-bold">{t.welcome.guide.title}</h1>
              <p className="text-secondary lead mt-3">Find answers to common questions about managing your operations.</p>
            </div>
            <div className="faq-accordion-container shadow-sm p-3 px-md-4 rounded-4" style={{ backgroundColor: 'var(--surface-bg)', border: '1px solid var(--border-color)' }}>
              <FaqItem title={t.welcome.guide.whatIs.title} desc={t.welcome.guide.whatIs.desc} />
              <FaqItem title={t.welcome.guide.whyMatters.title} desc={t.welcome.guide.whyMatters.desc} />
              <FaqItem title={t.welcome.guide.forecasting.title} desc={t.welcome.guide.forecasting.desc} />
              <FaqItem title={t.welcome.guide.tools.title} desc={t.welcome.guide.tools.desc} />
              <FaqItem title={t.welcome.guide.mistakes.title} desc={t.welcome.guide.mistakes.desc} isLast={true} />
            </div>
          </div>
        </section>

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
                </ul>
                {user?.isPremium ? (
                  <button className="btn btn-success w-100 mt-auto" disabled>{t.welcome.premiumActivated}</button>
                ) : (
                  <div className="mt-auto">
                    <button className="btn btn-primary w-100 mb-3 fw-bold" onClick={() => handleStart(onUpgradeToPremium)}>
                      {t.welcome.upgradeToPremium}
                    </button>
                    <div className="input-group">
                      <input 
                        type="text" 
                        className="form-control" 
                        placeholder={t.welcome.discountCode}
                        value={discountCode}
                        onChange={(e) => setDiscountCode(e.target.value)}
                      />
                      <button className="btn btn-outline-secondary" onClick={() => handleStart(handleRedeemCode)}>{t.welcome.redeem}</button>
                    </div>
                    {redemptionStatus.message && <div className={`small mt-2 ${redemptionStatus.type === 'success' ? 'text-success' : 'text-danger'}`}>{redemptionStatus.message}</div>}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </>
    );
  } else if (isCreatingNewProject && !mode) {
    // Selection screen if multiple creation paths are added later
    mainContent = (
      <main className="hero-section" style={{minHeight: 'calc(100vh - 75px)', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <div className="hero-content fade-scale text-center">
          <h1 className="mb-4 display-5 fw-bold">{t.welcome.howToCreate}</h1>
          <div className="hero-actions d-flex justify-content-center">
            <button className="btn btn-primary btn-lg px-5 rounded-pill shadow fw-bold d-flex align-items-center gap-2" onClick={() => {
              setData({});
              setMode('existing');
              setStep(0);
            }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                <path fillRule="evenodd" d="M1 8a7 7 0 1 0 14 0A7 7 0 0 0 1 8zm15 0A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM8.5 4.5a.5.5 0 0 0-1 0v3h-3a.5.5 0 0 0 0 1h3v3a.5.5 0 0 0 1 0v-3h3a.5.5 0 0 0 0-1h-3v-3z"/>
              </svg>
              {t?.welcome?.own || 'From an Existing Business'}
            </button>
          </div>
        </div>
      </main>
    );
  } else {
    // Question Flow
    mainContent = (
      <div className="question-flow-wrapper flex-grow-1 d-flex align-items-center justify-content-center">
        <div className={`question-flow-content w-100 ${isCreatingNewProject ? '' : 'fade-scale'}`} style={{ maxWidth: '600px' }}>
          {/* Progress Bar */}
          <div className="progress mb-5" style={{ height: '8px' }}>
            <div className="progress-bar" role="progressbar" style={{ width: `${progress}%` }} aria-valuenow={progress} aria-valuemin="0" aria-valuemax="100"></div>
          </div>

          {/* Question Content */}
          <div className="question-content text-center">
            <h2 className="question-title mb-5">{current?.label}</h2>
            <input
              autoFocus
              className="form-control form-control-lg text-center mx-auto"
              type={current?.type}
              placeholder={current?.placeholder}
              value={data[current?.field] ?? ''}
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
            <button className="btn btn-primary px-4" onClick={next}>{step < (steps.length - 1) ? t.next : t.finish}</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="welcome-container d-flex flex-column min-vh-100">
      <nav className="top-nav">
        <a href="#" className="nav-logo" onClick={(e) => { 
          e.preventDefault(); 
          if (isCreatingNewProject) onShowManager();
          else { setMode(null); setStep(0); }
        }}>Rahanto</a>

        <div className="nav-actions">
          <div className="d-flex align-items-center me-3">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" className={`me-2 ${theme === 'light' ? 'text-warning' : 'text-secondary opacity-50'}`}>
              <path d="M8 11a3 3 0 1 1 0-6 3 3 0 0 1 0 6zm0 1a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM8 0a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 0zm0 13a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 13zm8-5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2a.5.5 0 0 1 .5.5zM3 8a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2A.5.5 0 0 1 3 8zm10.657-5.657a.5.5 0 0 1 0 .707l-1.414 1.415a.5.5 0 1 1-.707-.708l1.414-1.414a.5.5 0 0 1 .707 0zm-9.193 9.193a.5.5 0 0 1 0 .707L3.05 13.657a.5.5 0 0 1-.707-.707l1.414-1.414a.5.5 0 0 1 .707 0zm9.193 2.121a.5.5 0 0 1-.707 0l-1.414-1.414a.5.5 0 0 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .707zM4.464 4.465a.5.5 0 0 1-.707 0L2.343 3.05a.5.5 0 1 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .708z"/>
            </svg>
            <div className="form-check form-switch mb-0 min-h-0">
              <input className="form-check-input" type="checkbox" role="switch" checked={theme === 'dark'} onChange={onToggleTheme} style={{cursor: 'pointer'}} />
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" className={`ms-2 ${theme === 'dark' ? 'text-white' : 'text-secondary opacity-50'}`}>
              <path d="M6 .278a.768.768 0 0 1 .08.858 7.208 7.208 0 0 0-.878 3.46c0 4.021 3.278 7.277 7.318 7.277.527 0 1.04-.055 1.533-.16a.787.787 0 0 1 .81.316.733.733 0 0 1-.031.893A8.349 8.349 0 0 1 8.344 16C3.734 16 0 12.286 0 7.71 0 4.266 2.114 1.312 5.124.06A.752.752 0 0 1 6 .278z"/>
            </svg>
          </div>

          <div className="position-relative d-inline-block me-2">
            <button className="btn btn-white border shadow-sm d-flex align-items-center gap-2" onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}>
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
              <button className="btn btn-white border shadow-sm d-flex align-items-center gap-2" onClick={() => setShowProfileDropdown(prev => !prev)}>
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
                  <button className="dropdown-item" onClick={() => { onOpenSubmissions(); setShowProfileDropdown(false); }}>Stability Results</button>
                  <button className="dropdown-item" onClick={() => { onOpenSupport(); setShowProfileDropdown(false); }}>{t.support}</button>
                  <div className="dropdown-divider"></div>
                  <button className="dropdown-item text-danger" onClick={onLogout}>Log Out</button>
                </div>
              )}
            </div>
          ) : <button className="btn btn-primary" onClick={onOpenLogin}>Log In</button>}
        </div>
      </nav>

      {mainContent}
    </div>
  );
}
