import { useState, useMemo, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { formatForInput, parseFromInput } from './utils.js';

export default function History({ project, onUpdateProject, t, theme, language }) {
  const history = project.history || [];
  const [newEntry, setNewEntry] = useState({
    date: new Date().toISOString().slice(0, 7), // YYYY-MM
    revenue: 0,
    fixedCosts: 0,
    variableCosts: 0,
    cashBalance: 0,
    customers: 0
  });
  const [sortBy, setSortBy] = useState('dateDesc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [entryToDelete, setEntryToDelete] = useState(null);

  const [showRevenue, setShowRevenue] = useState(true);
  const [showTrend, setShowTrend] = useState(true);
  const [showTotalCosts, setShowTotalCosts] = useState(true);
  const [showCashBalance, setShowCashBalance] = useState(true);
  const [editingId, setEditingId] = useState(null);

  const handleAdd = () => {
    if (!newEntry.date) return;
    
    let updatedHistory;
    if (editingId) {
        updatedHistory = history.map(h => h.id === editingId ? { ...newEntry, id: editingId } : h);
    } else {
        updatedHistory = [...history, { ...newEntry, id: Date.now() }];
    }

    // Sort by date ascending
    updatedHistory.sort((a, b) => a.date.localeCompare(b.date));
    onUpdateProject({ ...project, history: updatedHistory });
    
    if (editingId) {
        setEditingId(null);
        setNewEntry({
            date: new Date().toISOString().slice(0, 7),
            revenue: 0,
            fixedCosts: 0,
            variableCosts: 0,
            cashBalance: 0,
            customers: 0
        });
    } else {
        // Reset numbers but keep date (or maybe increment month? keeping simple for now)
        setNewEntry({
            ...newEntry,
            revenue: 0,
            fixedCosts: 0,
            variableCosts: 0,
            cashBalance: 0,
            customers: 0
        });
    }
  };

  const handleEdit = (entry) => {
    setNewEntry({
        date: entry.date,
        revenue: entry.revenue,
        fixedCosts: entry.fixedCosts,
        variableCosts: entry.variableCosts,
        cashBalance: entry.cashBalance,
        customers: entry.customers || 0
    });
    setEditingId(entry.id);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setNewEntry({
        date: new Date().toISOString().slice(0, 7),
        revenue: 0,
        fixedCosts: 0,
        variableCosts: 0,
        cashBalance: 0,
        customers: 0
    });
  };

  const handleDelete = (id) => {
    setEntryToDelete(id);
  };

  const confirmDelete = () => {
    if (!entryToDelete) return;
    const updatedHistory = history.filter(h => h.id !== entryToDelete);
    onUpdateProject({ ...project, history: updatedHistory });
    setEntryToDelete(null);
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat(language === 'fi' ? 'fi-FI' : 'en-US', { style: 'currency', currency: 'EUR' }).format(value);
  };

  const sortedHistory = useMemo(() => {
    return [...history].sort((a, b) => {
        if (sortBy === 'dateDesc') return b.date.localeCompare(a.date);
        if (sortBy === 'dateAsc') return a.date.localeCompare(b.date);
        if (sortBy === 'revenueDesc') return (b.revenue || 0) - (a.revenue || 0);
        if (sortBy === 'revenueAsc') return (a.revenue || 0) - (b.revenue || 0);
        return 0;
    });
  }, [history, sortBy]);

  // Reset to first page when search or sort changes
  useEffect(() => {
    setCurrentPage(1);
  }, [sortBy, history.length]);

  const totalPages = Math.ceil(sortedHistory.length / itemsPerPage);
  const paginatedHistory = useMemo(() => {
    return sortedHistory.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    );
  }, [sortedHistory, currentPage]);


  const labels = history.map(h => h.date);
  const revenueData = history.map(h => h.revenue);

  // Calculate Trend Line (Linear Regression)
  let trendData = [];
  if (revenueData.length > 1) {
    const n = revenueData.length;
    let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
    for (let i = 0; i < n; i++) {
      sumX += i;
      sumY += revenueData[i];
      sumXY += i * revenueData[i];
      sumXX += i * i;
    }
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    trendData = revenueData.map((_, i) => slope * i + intercept);
  }
  
  // Calculate Summary Variables
  const sortedByDate = [...history].sort((a, b) => a.date.localeCompare(b.date));
  let prevMonthRevenue = null;
  let avgGrowth = null;
  let avgMargin = null;
  let bestMonth = null;
  
  if (sortedByDate.length > 0) {
      // Prev Month Revenue
      if (sortedByDate.length >= 2) {
          prevMonthRevenue = sortedByDate[sortedByDate.length - 2].revenue;
      }

      // Average Growth %
      if (sortedByDate.length > 1) {
          let totalGrowth = 0;
          let growthMonths = 0;
          for (let i = 1; i < sortedByDate.length; i++) {
              const prev = sortedByDate[i-1].revenue || 0;
              const curr = sortedByDate[i].revenue || 0;
              if (prev > 0) {
                  totalGrowth += ((curr - prev) / prev) * 100;
                  growthMonths++;
              }
          }
          if (growthMonths > 0) {
              avgGrowth = totalGrowth / growthMonths;
          }
      }

      // Average Profit Margin
      let totalRev = 0;
      let totalProfit = 0;
      let highestRev = -1;

      sortedByDate.forEach(h => {
          const rev = h.revenue || 0;
          const costs = (h.fixedCosts || 0) + (h.variableCosts || 0);
          totalRev += rev;
          totalProfit += (rev - costs);
          
          if (rev > highestRev) {
              highestRev = rev;
              bestMonth = h.date;
          }
      });

      if (totalRev > 0) {
          avgMargin = (totalProfit / totalRev) * 100;
      }
  }

  const chartData = {
    labels,
    datasets: [
      {
        label: t.history.revenue,
        data: revenueData,
        borderColor: '#10B981', // Emerald green
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4, 
        fill: false,
        pointBackgroundColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        hidden: !showRevenue
      },
      {
        label: t.history.trend,
        data: trendData,
        borderColor: '#F59E0B', // Amber
        borderDash: [6, 6],
        pointRadius: 0, 
        borderWidth: 2,
        tension: 0, 
        fill: false,
        hidden: !showTrend
      },
      {
        label: t.history.totalCosts,
        data: history.map(h => (h.fixedCosts || 0) + (h.variableCosts || 0)),
        borderColor: '#EF4444', // Red
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        tension: 0.4, 
        fill: false,
        pointBackgroundColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        hidden: !showTotalCosts
      },
      {
        label: t.history.cashBalance,
        data: history.map(h => h.cashBalance),
        borderColor: '#3B82F6', // Blue
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4, 
        fill: false,
        pointBackgroundColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        hidden: !showCashBalance
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false, 
    plugins: {
      legend: {
        display: false
      },
      tooltip: { 
        mode: 'index', 
        intersect: false,
        backgroundColor: theme === 'dark' ? '#262626' : '#ffffff',
        titleColor: theme === 'dark' ? '#f5f5f5' : '#0f172a',
        bodyColor: theme === 'dark' ? '#a3a3a3' : '#475569',
        borderColor: theme === 'dark' ? '#404040' : '#e2e8f0',
        borderWidth: 1,
        padding: 12,
        titleFont: { family: "'Inter', sans-serif", size: 13, weight: '600' },
        bodyFont: { family: "'Inter', sans-serif", size: 12 },
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += new Intl.NumberFormat(language === 'fi' ? 'fi-FI' : 'en-US', { style: 'currency', currency: 'EUR' }).format(context.parsed.y);
            }
            return label;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: theme === 'dark' ? '#333333' : '#f1f5f9', drawBorder: false },
        ticks: { 
            color: theme === 'dark' ? '#a3a3a3' : '#94a3b8', 
            padding: 10, 
            font: { family: "'Inter', sans-serif", size: 11 },
            callback: function(value) {
                return new Intl.NumberFormat(language === 'fi' ? 'fi-FI' : 'en-US', { notation: "compact", compactDisplay: "short" }).format(value) + ' €';
            }
        },
        border: { display: false }
      },
      x: {
        grid: { display: false, drawBorder: false },
        ticks: { color: theme === 'dark' ? '#a3a3a3' : '#94a3b8', padding: 10, font: { family: "'Inter', sans-serif", size: 11 } },
        border: { display: false }
      }
    },
    interaction: { mode: 'index', axis: 'x', intersect: false }
  };

  return (
    <div className="card border-0 shadow-sm h-100 fade-scale" style={{ borderRadius: '16px', overflow: 'hidden' }}>
      <div className="card-body p-4">
        <h2 className="fw-bold mb-4">{t.history.title}</h2>
        
        {history.length > 0 && (
            <div className="row g-3 mb-4">
                <div className="col-12 col-sm-6 col-lg-3">
                    <div className="card border h-100 bg-transparent shadow-sm rounded-4">
                        <div className="card-body p-3">
                            <div className="text-muted small fw-bold text-uppercase mb-2" style={{letterSpacing: '0.5px', fontSize: '0.75rem'}}>{t.history.summary?.prevMonthRevenue}</div>
                            <div className="fs-4 fw-bold text-primary">
                                {prevMonthRevenue !== null ? formatCurrency(prevMonthRevenue) : '-'}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-12 col-sm-6 col-lg-3">
                    <div className="card border h-100 bg-transparent shadow-sm rounded-4">
                        <div className="card-body p-3">
                            <div className="text-muted small fw-bold text-uppercase mb-2" style={{letterSpacing: '0.5px', fontSize: '0.75rem'}}>{t.history.summary?.avgGrowth}</div>
                            <div className={`fs-4 fw-bold ${avgGrowth > 0 ? 'text-success' : avgGrowth < 0 ? 'text-danger' : 'text-secondary'}`}>
                                {avgGrowth !== null ? `${avgGrowth > 0 ? '+' : ''}${avgGrowth.toFixed(1)}%` : '-'}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-12 col-sm-6 col-lg-3">
                    <div className="card border h-100 bg-transparent shadow-sm rounded-4">
                        <div className="card-body p-3">
                            <div className="text-muted small fw-bold text-uppercase mb-2" style={{letterSpacing: '0.5px', fontSize: '0.75rem'}}>{t.history.summary?.avgMargin}</div>
                            <div className={`fs-4 fw-bold ${avgMargin > 0 ? 'text-success' : avgMargin < 0 ? 'text-danger' : 'text-secondary'}`}>
                                {avgMargin !== null ? `${avgMargin.toFixed(1)}%` : '-'}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-12 col-sm-6 col-lg-3">
                    <div className="card border h-100 bg-transparent shadow-sm rounded-4">
                        <div className="card-body p-3">
                            <div className="text-muted small fw-bold text-uppercase mb-2" style={{letterSpacing: '0.5px', fontSize: '0.75rem'}}>{t.history.summary?.bestMonth}</div>
                            <div className="fs-4 fw-bold text-dark dark-text-light">
                                {bestMonth !== null ? bestMonth : '-'}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {history.length > 0 ? (
            <>
                <div className="mb-4" style={{ height: '400px' }}>
                    <Line data={chartData} options={options} />
                </div>
                <div className="d-flex justify-content-center flex-wrap gap-2 mb-5">
                    <button 
                        className={`btn btn-sm rounded-pill d-flex align-items-center gap-2 border ${showRevenue ? 'bg-success-subtle text-success-emphasis border-success-subtle fw-bold' : 'bg-transparent text-secondary'}`}
                        onClick={() => setShowRevenue(!showRevenue)}
                    >
                        <span className="rounded-circle" style={{width: 10, height: 10, backgroundColor: '#10B981', opacity: showRevenue ? 1 : 0.5}}></span>
                        {t.history.revenue}
                    </button>
                    <button 
                        className={`btn btn-sm rounded-pill d-flex align-items-center gap-2 border ${showTrend ? 'bg-warning-subtle text-warning-emphasis border-warning-subtle fw-bold' : 'bg-transparent text-secondary'}`}
                        onClick={() => setShowTrend(!showTrend)}
                    >
                        <span className="rounded-circle" style={{width: 10, height: 10, backgroundColor: '#F59E0B', opacity: showTrend ? 1 : 0.5}}></span>
                        {t.history.trend}
                    </button>
                    <button 
                        className={`btn btn-sm rounded-pill d-flex align-items-center gap-2 border ${showTotalCosts ? 'bg-danger-subtle text-danger-emphasis border-danger-subtle fw-bold' : 'bg-transparent text-secondary'}`}
                        onClick={() => setShowTotalCosts(!showTotalCosts)}
                    >
                        <span className="rounded-circle" style={{width: 10, height: 10, backgroundColor: '#EF4444', opacity: showTotalCosts ? 1 : 0.5}}></span>
                        {t.history.totalCosts}
                    </button>
                    <button 
                        className={`btn btn-sm rounded-pill d-flex align-items-center gap-2 border ${showCashBalance ? 'bg-primary-subtle text-primary-emphasis border-primary-subtle fw-bold' : 'bg-transparent text-secondary'}`}
                        onClick={() => setShowCashBalance(!showCashBalance)}
                    >
                        <span className="rounded-circle" style={{width: 10, height: 10, backgroundColor: '#3B82F6', opacity: showCashBalance ? 1 : 0.5}}></span>
                        {t.history.cashBalance}
                    </button>
                </div>
            </>
        ) : (
            <div className="alert alert-light border mb-5 text-center py-5">
                <p className="mb-0 text-muted">{t.history.noData}</p>
            </div>
        )}

        <div className="card border mb-4" style={{backgroundColor: 'var(--surface-bg)'}}>
            <div className="card-header bg-transparent border-bottom py-3">
                <h5 className="card-title mb-0 fw-bold">{editingId ? t.edit : t.history.addEntry}</h5>
            </div>
            <div className="card-body">
                <div className="row g-3">
                    <div className="col-md-2"><label className="form-label small fw-bold text-muted">{t.history.date}</label><input type="month" className="form-control" value={newEntry.date} onChange={e => setNewEntry({...newEntry, date: e.target.value})} /></div>
                    <div className="col-md-2"><label className="form-label small fw-bold text-muted">{t.history.revenue}</label><div className="input-group"><input type="text" className="form-control" placeholder="0" value={formatForInput(newEntry.revenue)} onChange={e => setNewEntry({...newEntry, revenue: parseFromInput(e.target.value)})} /><span className="input-group-text">€</span></div></div>
                    <div className="col-md-2"><label className="form-label small fw-bold text-muted">{t.history.fixedCosts}</label><div className="input-group"><input type="text" className="form-control" placeholder="0" value={formatForInput(newEntry.fixedCosts)} onChange={e => setNewEntry({...newEntry, fixedCosts: parseFromInput(e.target.value)})} /><span className="input-group-text">€</span></div></div>
                    <div className="col-md-2"><label className="form-label small fw-bold text-muted">{t.history.variableCosts}</label><div className="input-group"><input type="text" className="form-control" placeholder="0" value={formatForInput(newEntry.variableCosts)} onChange={e => setNewEntry({...newEntry, variableCosts: parseFromInput(e.target.value)})} /><span className="input-group-text">€</span></div></div>
                    <div className="col-md-2"><label className="form-label small fw-bold text-muted">{t.history.cashBalance}</label><div className="input-group"><input type="text" className="form-control" placeholder="0" value={formatForInput(newEntry.cashBalance)} onChange={e => setNewEntry({...newEntry, cashBalance: parseFromInput(e.target.value)})} /><span className="input-group-text">€</span></div></div>
                    <div className="col-md-2">
                        <label className="form-label small fw-bold text-muted invisible">Save</label>
                        <div className="d-flex gap-2">
                            <button className="btn btn-primary w-100 fw-bold" onClick={handleAdd}>{t.history.save}</button>
                            {editingId && <button className="btn btn-secondary" onClick={handleCancelEdit}>{t.cancel}</button>}
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {history.length > 0 && (
            <>
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="fw-bold mb-0">{t.history.title}</h5>
                <div className="d-flex align-items-center gap-2">
                    <label htmlFor="history-sort" className="form-label small text-muted fw-bold mb-0">{t.history.sort}:</label>
                    <select id="history-sort" className="form-select form-select-sm" style={{width: 'auto'}} value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                        <option value="dateDesc">{t.history.sortDateNewest}</option>
                        <option value="dateAsc">{t.history.sortDateOldest}</option>
                        <option value="revenueDesc">{t.history.sortRevenueHigh}</option>
                        <option value="revenueAsc">{t.history.sortRevenueLow}</option>
                    </select>
                </div>
            </div>
            <div className="list-group list-group-flush border rounded-3 overflow-hidden">
                {paginatedHistory.map((h, index) => (
                    <div key={h.id} className="list-group-item list-group-item-action px-3 py-3 border-bottom rounded-3 mb-1 fade-scale" style={{animationDelay: `${index * 0.05}s`, animationDuration: '0.3s', animationFillMode: 'both'}}>
                        <div className="d-flex justify-content-between align-items-start mb-2">
                            <h5 className="mb-0">{h.date}</h5>
                            <div className="d-flex align-items-center gap-2">
                                <button className="btn btn-sm btn-outline-secondary" onClick={() => handleEdit(h)}>{t.edit}</button>
                                <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(h.id)}>{t.history.delete}</button>
                            </div>
                        </div>
                        <div className="row small mt-3">
                            <div className="col-6 col-md-3 mb-2 mb-md-0">
                                <div className="text-muted text-uppercase fw-bold mb-1" style={{fontSize: '0.7rem', letterSpacing: '0.5px'}}>{t.history.revenue}</div>
                                <div className="text-success fw-bold fs-6">{formatCurrency(h.revenue)}</div>
                            </div>
                            <div className="col-6 col-md-3 mb-2 mb-md-0">
                                <div className="text-muted text-uppercase fw-bold mb-1" style={{fontSize: '0.7rem', letterSpacing: '0.5px'}}>{t.history.totalCosts}</div>
                                <div className="text-danger fw-bold fs-6">{formatCurrency((h.fixedCosts || 0) + (h.variableCosts || 0))}</div>
                            </div>
                            <div className="col-6 col-md-3">
                                <div className="text-muted text-uppercase fw-bold mb-1" style={{fontSize: '0.7rem', letterSpacing: '0.5px'}}>{t.history.cashBalance}</div>
                                <div className="text-primary fw-bold fs-6">{formatCurrency(h.cashBalance)}</div>
                            </div>
                            <div className="col-6 col-md-3">
                                <div className="text-muted text-uppercase fw-bold mb-1" style={{fontSize: '0.7rem', letterSpacing: '0.5px'}}>{t.history.customers}</div>
                                <div className="fw-medium fs-6 text-secondary">{h.customers || 0}</div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            </>
        )}

        {totalPages > 1 && (
          <div className="d-flex justify-content-center mt-4">
            <nav aria-label="Page navigation">
              <ul className="pagination pagination-sm mb-0">
                <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                  <button className="page-link" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} aria-label="Previous">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                      <path fillRule="evenodd" d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z"/>
                    </svg>
                  </button>
                </li>
                {[...Array(totalPages)].map((_, i) => (
                  <li key={i} className={`page-item ${currentPage === i + 1 ? 'active' : ''}`}>
                    <button className="page-link" onClick={() => setCurrentPage(i + 1)}>{i + 1}</button>
                  </li>
                ))}
                <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                  <button className="page-link" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} aria-label="Next">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                      <path fillRule="evenodd" d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z"/>
                    </svg>
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        )}

        {entryToDelete && (
            <div className="modal fade show d-block" tabIndex="-1" role="dialog" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
                <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                    <div className="modal-header">
                    <h5 className="modal-title">{t.history.delete}</h5>
                    <button type="button" className="btn-close" onClick={() => setEntryToDelete(null)}></button>
                    </div>
                    <div className="modal-body">
                    <p>{t.history.confirmDelete}</p>
                    </div>
                    <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" onClick={() => setEntryToDelete(null)}>{t.cancel}</button>
                    <button type="button" className="btn btn-danger" onClick={confirmDelete}>{t.history.delete}</button>
                    </div>
                </div>
                </div>
            </div>
        )}
      </div>
    </div>
  );
}