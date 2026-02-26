import { useState } from 'react';

export default function ProjectSetup({ onCreateProject, t }) {
  const [name, setName] = useState('');
  const [initialCash, setInitialCash] = useState(10000);
  const [monthlyFixedCosts, setMonthlyFixedCosts] = useState(2000);
  const [profitPerItem, setProfitPerItem] = useState(10);
  const [unitsPerMonth, setUnitsPerMonth] = useState(500);
  const [variableCosts, setVariableCosts] = useState(1500);
  const [revenueGrowth, setRevenueGrowth] = useState(0);

  const estimatedMonthlyRevenue = (parseFloat(profitPerItem) || 0) * (parseFloat(unitsPerMonth) || 0);
  const estimatedBreakEvenUnits = profitPerItem > 0 ? Math.ceil((parseFloat(monthlyFixedCosts) || 0) / (parseFloat(profitPerItem) || 1)) : Infinity;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    onCreateProject({
      name: name.trim(),
      initialCash: parseFloat(initialCash) || 0,
      monthlyRevenue: estimatedMonthlyRevenue || 0,
      fixedCosts: parseFloat(monthlyFixedCosts) || 0,
      profitPerItem: parseFloat(profitPerItem) || 0,
      unitsPerMonth: parseInt(unitsPerMonth, 10) || 0,
      variableCosts: parseFloat(variableCosts) || 0,
      revenueGrowth: parseFloat(revenueGrowth) || 0,
    });
  };

  return (
  <div className="container-fluid d-flex align-items-center justify-content-center hero-scale" style={{minHeight: '64vh'}}>
      <div className="row w-100 justify-content-center">
        <div className="col-11 col-md-10">
          <div className="hero-panel h-100">
            <div className="hero-body d-flex flex-column justify-content-center">
              <div className="d-flex justify-content-between align-items-start mb-3">
                <h3 className="card-title mb-0">{t.projectSetup.title}</h3>
                <small className="text-muted">{t.language}: {/* language shown in App header; front page uses app default */}</small>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="row g-3">
                  <div className="col-12 col-md-7 inputs-panel stagger">
                    <div className="mb-3 fade-scale">
                      <label className="form-label">{t.projectSetup.projectName}</label>
                      <input className="form-control fade-scale" value={name} onChange={(e) => setName(e.target.value)} required placeholder="e.g. My Store" />
                    </div>

                    <div className="row">
                      <div className="col-6">
                        <label className="form-label">{t.projectSetup.startingCash}</label>
                        <input type="number" step="0.01" className="form-control fade-scale" value={initialCash} onChange={(e) => setInitialCash(e.target.value)} />
                      </div>
                      <div className="col-6">
                        <label className="form-label">{t.projectSetup.monthlyFixedCosts}</label>
                        <input type="number" step="0.01" className="form-control fade-scale" value={monthlyFixedCosts} onChange={(e) => setMonthlyFixedCosts(e.target.value)} />
                      </div>
                    </div>

                    <div className="row mt-3">
                      <div className="col-6">
                        <label className="form-label">{t.projectSetup.profitPerItem}</label>
                        <input type="number" step="0.01" className="form-control fade-scale" value={profitPerItem} onChange={(e) => setProfitPerItem(e.target.value)} />
                      </div>
                      <div className="col-6">
                        <label className="form-label">{t.projectSetup.unitsPerMonth}</label>
                        <input type="number" className="form-control fade-scale" value={unitsPerMonth} onChange={(e) => setUnitsPerMonth(e.target.value)} />
                      </div>
                    </div>

                    <div className="row mt-3">
                      <div className="col-6">
                        <label className="form-label">{t.projectSetup.variableCosts}</label>
                        <input type="number" step="0.01" className="form-control fade-scale" value={variableCosts} onChange={(e) => setVariableCosts(e.target.value)} />
                      </div>
                      <div className="col-6">
                        <label className="form-label">{t.projectSetup.revenueGrowth}</label>
                        <input type="number" step="0.01" className="form-control fade-scale" value={revenueGrowth} onChange={(e) => setRevenueGrowth(e.target.value)} />
                      </div>
                    </div>
                  </div>

                  <div className="col-12 col-md-5">
                    <div className="hero-summary h-100">
                      <div className="d-flex flex-column justify-content-between stagger p-3" style={{height: '100%'}}>
                        <div>
                          <h6 className="card-subtitle mb-2 text-muted fade-scale">Summary</h6>
                          <p className="mb-1 fade-scale">{t.projectSetup.estimatedRevenue}: <strong>{Number(estimatedMonthlyRevenue).toFixed(2)}</strong></p>
                          <p className="mb-1 fade-scale">{t.projectSetup.estimatedBreakEvenUnits}: <strong>{isFinite(estimatedBreakEvenUnits) ? estimatedBreakEvenUnits : '—'}</strong></p>
                          <p className="mb-0 small text-muted fade-scale">{t.projectSetup.variableCosts}: <strong>{Number(variableCosts).toFixed(2)}</strong></p>
                        </div>

                        <div className="d-grid mt-3 fade-scale">
                          <button className="btn btn-primary" type="submit">{t.projectSetup.createButton}</button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
