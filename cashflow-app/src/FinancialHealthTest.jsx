import { useState } from 'react';

export default function FinancialHealthTest({ t, onStartFreeManual, theme }) {
  const [step, setStep] = useState(-1); // -1 is landing, 0-9 are questions, 10 is results
  const [answers, setAnswers] = useState({});
  const ft = t.financialTest;

  const questions = [
    {
      id: 'reserves',
      text: t.language === 'fi' ? 'Kuinka paljon yritykselläsi on tällä hetkellä käteisvaroja?' : 'How much cash does your business currently have available?',
      options: [
        { label: t.language === 'fi' ? 'Alle 1 kuukauden kulut' : 'Less than 1 month of expenses', score: 10, risk: 'buffer' },
        { label: t.language === 'fi' ? '1–2 kuukauden kulut' : '1–2 months of expenses', score: 40, risk: 'buffer' },
        { label: t.language === 'fi' ? '3–6 kuukauden kulut' : '3–6 months of expenses', score: 75, risk: null },
        { label: t.language === 'fi' ? 'Yli 6 kuukauden kulut' : 'More than 6 months', score: 100, risk: null },
      ]
    },
    {
      id: 'revenue_stability',
      text: t.language === 'fi' ? 'Kuinka ennustettavaa yrityksesi liikevaihto on?' : 'How predictable is your business revenue?',
      options: [
        { label: t.language === 'fi' ? 'Vakaa ja säännöllinen' : 'Stable and regular', score: 100, risk: null },
        { label: t.language === 'fi' ? 'Kausivaihteluita, mutta ennustettava' : 'Seasonal but predictable', score: 70, risk: null },
        { label: t.language === 'fi' ? 'Vaihtelee merkittävästi' : 'Fluctuates significantly', score: 40, risk: 'stable' },
        { label: t.language === 'fi' ? 'Erittäin epävarma' : 'Highly uncertain', score: 15, risk: 'stable' },
      ]
    },
    {
      id: 'fixed_costs',
      text: t.language === 'fi' ? 'Kuinka suuri osa kuluistasi on kiinteitä (vakaat kulut riippumatta myynnistä)?' : 'How much of your expenses are fixed (costs that don’t change with sales)?',
      options: [
        { label: t.language === 'fi' ? 'Alle 20%' : 'Less than 20%', score: 100, risk: null },
        { label: t.language === 'fi' ? '20–40%' : '20–40%', score: 75, risk: null },
        { label: t.language === 'fi' ? '40–60%' : '40–60%', score: 40, risk: 'fixed' },
        { label: t.language === 'fi' ? 'Yli 60%' : 'More than 60%', score: 15, risk: 'fixed' },
      ]
    },
    {
      id: 'payment_speed',
      text: t.language === 'fi' ? 'Kuinka nopeasti asiakkaasi yleensä maksavat laskunsa?' : 'How quickly do your customers typically pay their invoices?',
      options: [
        { label: t.language === 'fi' ? 'Heti tai alle 7 päivää' : 'Immediately or under 7 days', score: 100, risk: null },
        { label: t.language === 'fi' ? '8–14 päivää' : '8–14 days', score: 75, risk: null },
        { label: t.language === 'fi' ? '15–30 päivää' : '15–30 days', score: 45, risk: 'payment' },
        { label: t.language === 'fi' ? 'Yli 30 päivää tai jatkuvia viiveitä' : 'Over 30 days or constant delays', score: 15, risk: 'payment' },
      ]
    },
    {
      id: 'debt_load',
      text: t.language === 'fi' ? 'Kuinka paljon yritykselläsi on lainaa tai velkaa suhteessa tuloihin?' : 'How much debt or loans does your business have compared to revenue?',
      options: [
        { label: t.language === 'fi' ? 'Ei lainaa' : 'No debt', score: 100, risk: null },
        { label: t.language === 'fi' ? 'Vähän (lyhennykset < 10% tuloista)' : 'Little (repayments < 10% of revenue)', score: 80, risk: null },
        { label: t.language === 'fi' ? 'Kohtalaisesti (10–25% tuloista)' : 'Moderate (10–25% of revenue)', score: 50, risk: 'debt' },
        { label: t.language === 'fi' ? 'Paljon (> 25% tuloista)' : 'High (> 25% of revenue)', score: 20, risk: 'debt' },
      ]
    },
    {
      id: 'outstanding_invoices',
      text: t.language === 'fi' ? 'Onko sinulla tällä hetkellä paljon erääntyneitä saatavia asiakkailta?' : 'Do you currently have a lot of overdue payments from customers?',
      options: [
        { label: t.language === 'fi' ? 'Ei lainkaan' : 'None at all', score: 100, risk: null },
        { label: t.language === 'fi' ? 'Muutamia pieniä saatavia' : 'A few small ones', score: 80, risk: null },
        { label: t.language === 'fi' ? 'Jonkin verran merkittäviä saatavia' : 'Some significant ones', score: 50, risk: 'payment' },
        { label: t.language === 'fi' ? 'Paljon ja ne vaarantavat kassavirran' : 'Many, risking cash flow', score: 20, risk: 'payment' },
      ]
    },
    {
      id: 'margin_health',
      text: t.language === 'fi' ? 'Onko yrityksesi myyntikate riittävä kattamaan kaikki kulut?' : 'Is your profit margin sufficient to cover all expenses?',
      options: [
        { label: t.language === 'fi' ? 'Kyllä, helposti' : 'Yes, easily', score: 100, risk: null },
        { label: t.language === 'fi' ? 'Kyllä, mutta tiukasti' : 'Yes, but it’s tight', score: 70, risk: null },
        { label: t.language === 'fi' ? 'Välillä on vaikeuksia kattaa kuluja' : 'Sometimes struggling', score: 40, risk: 'stable' },
        { label: t.language === 'fi' ? 'Ei, yritys on tällä hetkellä tappiollinen' : 'No, currently losing money', score: 15, risk: 'stable' },
      ]
    },
    {
      id: 'tax_prep',
      text: t.language === 'fi' ? 'Varaatko säännöllisesti rahaa sivuun veroja ja muita tulevia maksuja varten?' : 'Do you regularly set money aside for taxes and other upcoming payments?',
      options: [
        { label: t.language === 'fi' ? 'Kyllä, aina' : 'Yes, always', score: 100, risk: null },
        { label: t.language === 'fi' ? 'Yleensä kyllä' : 'Usually yes', score: 75, risk: null },
        { label: t.language === 'fi' ? 'Joskus, jos rahaa jää yli' : 'Sometimes, if there is surplus', score: 35, risk: 'buffer' },
        { label: t.language === 'fi' ? 'En, maksan ne kun ne tulevat' : 'No, I pay as they come', score: 10, risk: 'buffer' },
      ]
    },
    {
      id: 'flexibility',
      text: t.language === 'fi' ? 'Kuinka nopeasti pystyisit leikkaamaan kuluja, jos myynti laskisi yllättäen?' : 'How quickly could you cut costs if sales suddenly dropped?',
      options: [
        { label: t.language === 'fi' ? 'Välittömästi (suuri joustavuus)' : 'Immediately (high flexibility)', score: 100, risk: null },
        { label: t.language === 'fi' ? 'Muutamassa viikossa' : 'Within a few weeks', score: 75, risk: null },
        { label: t.language === 'fi' ? '1–3 kuukauden kuluessa' : 'Within 1–3 months', score: 40, risk: 'fixed' },
        { label: t.language === 'fi' ? 'Erittäin hitaasti (pysyvät sopimukset)' : 'Very slowly (fixed contracts)', score: 15, risk: 'fixed' },
      ]
    },
    {
      id: 'runway_perception',
      text: t.language === 'fi' ? 'Kuinka kauan yrityksesi selviäisi ilman uutta myyntiä nykyisellä kassalla?' : 'How long could your business survive without new sales with your current cash?',
      options: [
        { label: t.language === 'fi' ? 'Yli 12 kuukautta' : 'Over 12 months', score: 100, risk: null },
        { label: t.language === 'fi' ? '6–12 kuukautta' : '6–12 months', score: 80, risk: null },
        { label: t.language === 'fi' ? '1–3 kuukautta' : '1-3 months', score: 40, risk: 'buffer' },
        { label: t.language === 'fi' ? 'Alle 1 kuukausi' : 'Less than 1 month', score: 10, risk: 'buffer' },
      ]
    }
  ];

  const handleStart = () => setStep(0);
  const handleAnswer = (option) => {
    setAnswers({ ...answers, [step]: option });
    if (step < questions.length - 1) {
      setStep(step + 1);
    } else {
      setStep(10);
    }
  };

  const calculateResults = () => {
    let totalScore = 0;
    const riskCounts = {};
    
    Object.values(answers).forEach(ans => {
      totalScore += ans.score;
      if (ans.risk) {
        riskCounts[ans.risk] = (riskCounts[ans.risk] || 0) + 1;
      }
    });

    const averageScore = Math.round(totalScore / questions.length);
    let topRiskKey = 'stable';
    let maxCount = 0;

    Object.entries(riskCounts).forEach(([key, count]) => {
      if (count > maxCount) {
        maxCount = count;
        topRiskKey = key;
      }
    });

    return { score: averageScore, risk: topRiskKey };
  };

  const getScoreColor = (score) => {
    if (score >= 70) return '#2f9e44'; // Good
    if (score >= 40) return '#fcc419'; // Moderate
    return '#fa5252'; // Danger
  };

  const getScoreLabel = (score) => {
    if (score >= 81) return t.language === 'fi' ? 'Vahva tilanne' : 'Strong financial position';
    if (score >= 61) return t.language === 'fi' ? 'Kohtalainen riski' : 'Moderate risk';
    if (score >= 31) return t.language === 'fi' ? 'Korkea taloudellinen stressi' : 'High financial stress';
    return t.language === 'fi' ? 'Kriittinen taloudellinen riski' : 'Critical financial risk';
  };

  if (step === -1) {
    return (
      <div className="container-lg py-5 my-5 fade-scale">
        <div className="text-center mx-auto" style={{ maxWidth: '800px' }}>
          <div className="badge bg-primary-subtle text-primary px-3 py-2 rounded-pill mb-3 fw-bold">FREE TOOL</div>
          <h1 className="display-4 fw-bold mb-4">{ft.title}</h1>
          <p className="lead text-secondary mb-4">{ft.subtitle}</p>
          <p className="text-secondary mb-5">{ft.description}</p>
          <button className="btn btn-primary btn-lg px-5 rounded-pill shadow-lg fw-bold" onClick={handleStart}>
            {ft.start}
          </button>
        </div>
      </div>
    );
  }

  if (step >= 0 && step < questions.length) {
    const q = questions[step];
    const progress = ((step + 1) / questions.length) * 100;
    
    return (
      <div className="container-lg py-5 my-5">
        <div className="mx-auto" style={{ maxWidth: '650px' }}>
          <div className="d-flex justify-content-between align-items-end mb-3">
            <span className="small fw-bold text-primary">{ft.questionOf(step + 1, questions.length)}</span>
            <span className="small text-muted">{Math.round(progress)}%</span>
          </div>
          <div className="progress mb-5" style={{ height: '8px', borderRadius: '4px' }}>
            <div className="progress-bar progress-bar-animated" style={{ width: `${progress}%`, transition: 'width 0.5s ease' }}></div>
          </div>
          
          <div className="fade-scale" key={step}>
            <h2 className="h3 fw-bold mb-5 lh-base text-center">{q.text}</h2>
            <div className="d-grid gap-3">
              {q.options.map((opt, i) => (
                <button 
                  key={i}
                  className="btn btn-outline-secondary p-4 text-start border-2 rounded-4 hover-lift d-flex align-items-center justify-content-between"
                  onClick={() => handleAnswer(opt)}
                  style={{ transition: 'all 0.2s', borderColor: 'var(--border-color)' }}
                >
                  <span className="fw-bold">{opt.label}</span>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                </button>
              ))}
            </div>
          </div>
          
          {step > 0 && (
            <button className="btn btn-link link-secondary mt-5 d-flex align-items-center gap-2 mx-auto text-decoration-none" onClick={() => setStep(step - 1)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
              {ft.back}
            </button>
          )}
        </div>
      </div>
    );
  }

  if (step === 10) {
    const { score, risk } = calculateResults();
    const riskInfo = ft.risks[risk];
    
    return (
      <div className="container-lg py-5 my-5 fade-scale">
        <div className="mx-auto" style={{ maxWidth: '900px' }}>
          <div className="text-center mb-5">
            <h1 className="display-5 fw-bold mb-2">{ft.results.title}</h1>
            <p className="text-secondary">{t.language === 'fi' ? 'Vakaustesti analysoitu onnistuneesti.' : 'Stability assessment completed successfully.'}</p>
          </div>

          <div className="row g-4 mb-5">
            <div className="col-md-6">
              <div className="card border-0 shadow-lg p-4 h-100 rounded-4 overflow-hidden position-relative">
                <h3 className="h6 text-uppercase tracking-wider fw-bold text-secondary mb-4">{ft.results.scoreLabel}</h3>
                <div className="d-flex align-items-baseline gap-2 mb-2">
                  <span className="display-2 fw-bold" style={{ color: '#333' }}>{score}</span>
                  <span className="h4 text-muted fw-bold">/ 100</span>
                </div>
                <div className="fw-bold mb-4" style={{ color: '#666' }}>{getScoreLabel(score)}</div>
                <div className="mt-auto">
                  <div className="progress" style={{ height: '12px', background: 'var(--page-bg)', borderRadius: '6px' }}>
                    <div className="progress-bar" style={{ width: `${score}%`, backgroundColor: '#333' }}></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-md-6">
              <div className="card border-0 shadow-lg p-4 h-100 rounded-4 border-start border-5" style={{ borderLeftColor: '#333' }}>
                <h3 className="h6 text-uppercase tracking-wider fw-bold text-secondary mb-4">{ft.results.riskLabel}</h3>
                <h4 className="h3 fw-bold mb-3">{riskInfo.title}</h4>
                <p className="text-secondary lh-lg mb-0">{riskInfo.desc}</p>
                <div className="mt-4 pt-4 border-top">
                  <span className="badge bg-secondary-subtle text-secondary px-3 py-2 rounded-pill fw-bold">{ft.results.impactLabel}: {score < 40 ? 'High' : 'Moderate'}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="card border-0 shadow-lg p-5 rounded-5 bg-dark text-white text-center overflow-hidden position-relative">
            <h2 className="display-6 fw-bold mb-3">{ft.results.ctaTitle}</h2>
            <p className="lead mb-5 mx-auto opacity-75" style={{ maxWidth: '600px' }}>{ft.results.ctaText}</p>
            <button className="btn btn-light btn-lg px-5 rounded-pill fw-bold shadow-lg" onClick={() => onStartFreeManual(answers, score)}>
              {ft.results.ctaButton}
            </button>
          </div>
          
          <button className="btn btn-link link-secondary mt-5 d-flex align-items-center gap-2 mx-auto text-decoration-none" onClick={() => setStep(-1)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"></polyline><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path></svg>
            {t.language === 'fi' ? 'Tee testi uudelleen' : 'Retake Test'}
          </button>
        </div>
      </div>
    );
  }

  return null;
}
