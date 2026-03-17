import { useState, useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import { formatForInput, parseFromInput } from './utils.js';

export default function Loans({ t, project, onUpdateProject, theme, language }) {
  const loans = project.loans || [];
  const [showAddModal, setShowAddModal] = useState(false);
  const [newLoan, setNewLoan] = useState({ name: '', balance: '', interestRate: '', monthlyPayment: '' });
  const [editingId, setEditingId] = useState(null);
  const [loanToDelete, setLoanToDelete] = useState(null);
  const [selectedLoanId, setSelectedLoanId] = useState('all');
  const [sortBy, setSortBy] = useState('balanceDesc');

  const setLoans = (newLoans) => {
    onUpdateProject({ ...project, loans: newLoans });
  };

  const handleSave = () => {
    if (!newLoan.name || !newLoan.balance) return;

    const loanData = {
        ...newLoan,
        balance: parseFloat(newLoan.balance) || 0,
        interestRate: parseFloat(newLoan.interestRate) || 0,
        monthlyPayment: parseFloat(newLoan.monthlyPayment) || 0
    };

    if (editingId) {
      const updatedLoans = loans.map(l =>
        l.id === editingId ? { ...l, ...loanData } : l
      );
      setLoans(updatedLoans);
    } else {
      const updatedLoans = [...loans, {
        id: Date.now(),
        ...loanData,
        createdAt: Date.now()
      }];
      setLoans(updatedLoans);
    }
    handleCloseModal();
  };

  const handleEdit = (loan) => {
    setNewLoan({
        name: loan.name,
        balance: loan.balance,
        interestRate: loan.interestRate,
        monthlyPayment: loan.monthlyPayment
    });
    setEditingId(loan.id);
    setShowAddModal(true);
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setNewLoan({ name: '', balance: '', interestRate: '', monthlyPayment: '' });
    setEditingId(null);
  };

  const handleDelete = (id) => {
    setLoanToDelete(id);
  };

  const confirmDelete = () => {
    if (loanToDelete) {
      const updatedLoans = loans.filter(l => l.id !== loanToDelete);
      setLoans(updatedLoans);
      if (selectedLoanId === loanToDelete) {
        setSelectedLoanId('all');
      }
      setLoanToDelete(null);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('fi-FI', { style: 'currency', currency: 'EUR' }).format(value);
  };

  const simulationResults = useMemo(() => {
    if (!loans || loans.length === 0) {
        return { labels: [], data: [], totalInterestPaid: 0, payoffDate: null };
    }

    const monthlyData = [];
    const maxMonths = 30 * 12; // Max 30 years
    let totalInterestPaid = 0;
    
    let loansToSimulate = selectedLoanId === 'all' ? loans : loans.filter(l => l.id === selectedLoanId);
    if (loansToSimulate.length === 0) return { labels: [], data: [], totalInterestPaid: 0, payoffDate: null };

    let currentLoans = loansToSimulate.map(l => ({ ...l, balance: Number(l.balance) || 0, interestRate: Number(l.interestRate) || 0, monthlyPayment: Number(l.monthlyPayment) || 0 }));
    let totalBalance = currentLoans.reduce((sum, l) => sum + l.balance, 0);
    
    if (totalBalance <= 0) {
        return { labels: [], data: [], totalInterestPaid: 0, payoffDate: null };
    }

    for (let month = 0; month < maxMonths; month++) {
        let nextTotalBalance = 0;
        currentLoans.forEach(loan => {
            if (loan.balance > 0 && loan.monthlyPayment > 0) {
                const monthlyInterestRate = (loan.interestRate / 100) / 12;
                const interestPayment = loan.balance * monthlyInterestRate;
                totalInterestPaid += interestPayment;
                
                if (loan.monthlyPayment > interestPayment) {
                    const principalPayment = loan.monthlyPayment - interestPayment;
                    loan.balance -= principalPayment;
                } else {
                    loan.balance += interestPayment - loan.monthlyPayment;
                }

                if (loan.balance < 0) {
                    loan.balance = 0;
                }
            }
            nextTotalBalance += loan.balance;
        });

        monthlyData.push(nextTotalBalance);
        totalBalance = nextTotalBalance;

        if (totalBalance <= 0) {
            break; // Stop if all loans are paid off
        }
    }

    const labels = monthlyData.map((_, i) => {
        const date = new Date();
        date.setMonth(date.getMonth() + i);
        return date.toLocaleDateString(language === 'fi' ? 'fi-FI' : 'en-US', { month: 'short', year: 'numeric' });
    });

    let payoffDate = null;
    if (monthlyData.length > 0) {
        const d = new Date();
        d.setMonth(d.getMonth() + monthlyData.length);
        payoffDate = d.toLocaleDateString(language === 'fi' ? 'fi-FI' : 'en-US', { month: 'long', year: 'numeric' });
    }

    return { labels, data: monthlyData, totalInterestPaid, payoffDate };

  }, [loans, language, selectedLoanId]);

  const chartData = useMemo(() => {
    let label = t.loans.totalBalance;
    if (selectedLoanId !== 'all') {
        const selected = loans.find(l => l.id === selectedLoanId);
        if (selected) label = selected.name;
    }

    return {
        labels: simulationResults.labels,
        datasets: [
            {
                label: label,
                data: simulationResults.data,
                borderColor: '#2563eb', // Blue
                backgroundColor: 'rgba(37, 99, 235, 0.1)',
                tension: 0.3,
                fill: true,
            },
        ],
    };
  }, [simulationResults, t.loans.totalBalance, selectedLoanId, loans]);

  const chartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: { 
        legend: { display: false }, 
        tooltip: { 
            mode: 'index', 
            intersect: false, 
            callbacks: { label: (context) => `${context.dataset.label || ''}: ${formatCurrency(context.parsed.y)}` },
            backgroundColor: theme === 'dark' ? '#262626' : '#ffffff',
            titleColor: theme === 'dark' ? '#f5f5f5' : '#0f172a',
            bodyColor: theme === 'dark' ? '#a3a3a3' : '#475569',
            borderColor: theme === 'dark' ? '#404040' : '#e2e8f0',
            borderWidth: 1,
            padding: 12,
            titleFont: { family: "'Inter', sans-serif", size: 13, weight: '600' },
            bodyFont: { family: "'Inter', sans-serif", size: 12 },
        } 
    },
    scales: {
        y: { beginAtZero: true, grid: { color: theme === 'dark' ? '#333333' : '#f1f5f9', drawBorder: false }, ticks: { color: theme === 'dark' ? '#a3a3a3' : '#94a3b8', padding: 10, font: { family: "'Inter', sans-serif", size: 11 }, callback: (value) => `${new Intl.NumberFormat(language === 'fi' ? 'fi-FI' : 'en-US', { notation: "compact", compactDisplay: "short" }).format(value)} €` }, border: { display: false } },
        x: { grid: { display: false, drawBorder: false }, ticks: { color: theme === 'dark' ? '#a3a3a3' : '#94a3b8', padding: 10, font: { family: "'Inter', sans-serif", size: 11 } }, border: { display: false } }
    },
    interaction: { mode: 'index', intersect: false }
  }), [language, theme]);

  const summary = useMemo(() => {
    let targetLoans = selectedLoanId === 'all' ? loans : loans.filter(l => l.id === selectedLoanId);
    
    const totalBalance = targetLoans.reduce((sum, l) => sum + (Number(l.balance) || 0), 0);
    const totalPayment = targetLoans.reduce((sum, l) => sum + (Number(l.monthlyPayment) || 0), 0);
    
    const weightedInterest = totalBalance > 0 
      ? targetLoans.reduce((sum, l) => sum + ((Number(l.balance) || 0) * (Number(l.interestRate) || 0)), 0) / totalBalance
      : 0;

    return {
        totalBalance,
        totalPayment,
        weightedInterest,
        payoffDate: simulationResults.payoffDate || '-',
        totalInterest: simulationResults.totalInterestPaid
    };
  }, [loans, selectedLoanId, simulationResults]);

  const sortedLoans = useMemo(() => {
      return [...loans].sort((a, b) => {
          const balA = Number(a.balance) || 0;
          const balB = Number(b.balance) || 0;
          const intA = Number(a.interestRate) || 0;
          const intB = Number(b.interestRate) || 0;

          if (sortBy === 'balanceDesc') return balB - balA;
          if (sortBy === 'balanceAsc') return balA - balB;
          if (sortBy === 'interestDesc') return intB - intA;
          if (sortBy === 'interestAsc') return intA - intB;
          if (sortBy === 'name') return a.name.localeCompare(b.name);
          return 0;
      });
  }, [loans, sortBy]);

  return (
    <div className="card border-0 shadow-sm h-100 fade-scale" style={{ minHeight: '80vh', borderRadius: '16px', overflow: 'hidden' }}>
      <div className="card-body p-4 d-flex flex-column">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="fw-bold mb-0">{t.loans.title}</h2>
          <button className="btn btn-primary btn-sm d-flex align-items-center justify-content-center" style={{width: '32px', height: '32px'}} onClick={() => setShowAddModal(true)}>
            <span className="fs-5" style={{lineHeight: 1}}>+</span>
          </button>
        </div>

        {loans.length > 0 && (
            <div className="row g-3 mb-4">
                <div className="col-12 col-md-4">
                    <div className="p-3 border rounded h-100" style={{backgroundColor: 'var(--surface-bg)'}}>
                        <div className="text-secondary small fw-bold text-uppercase mb-1">{t.loans.summaryTotalBalance}</div>
                        <div className="h5 mb-0 fw-bold">{formatCurrency(summary.totalBalance)}</div>
                        <div className="small text-muted mt-1">{t.loans.summaryTotalInterest}: {new Intl.NumberFormat(language === 'fi' ? 'fi-FI' : 'en-US', { notation: "compact", compactDisplay: "short" }).format(summary.totalInterest)} €</div>
                    </div>
                </div>
                <div className="col-12 col-md-4">
                    <div className="p-3 border rounded h-100" style={{backgroundColor: 'var(--surface-bg)'}}>
                        <div className="text-secondary small fw-bold text-uppercase mb-1">{t.loans.summaryMonthlyPayment}</div>
                        <div className="h5 mb-0 fw-bold">{formatCurrency(summary.totalPayment)}</div>
                    </div>
                </div>
                <div className="col-12 col-md-4">
                    <div className="p-3 border rounded h-100" style={{backgroundColor: 'var(--surface-bg)'}}>
                        <div className="text-secondary small fw-bold text-uppercase mb-1">{t.loans.summaryPayoffDate}</div>
                        <div className="h5 mb-0 fw-bold text-success">{summary.payoffDate}</div>
                    </div>
                </div>
            </div>
        )}

        {simulationResults.data.length > 0 && (
            <div className="mb-5">
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="fw-bold mb-0">{t.loans.payoffTimeline}</h5>
                    <select 
                        className="form-select form-select-sm" 
                        style={{width: 'auto', minWidth: '150px'}} 
                        value={selectedLoanId} 
                        onChange={(e) => setSelectedLoanId(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                    >
                        <option value="all">{t.loans.totalBalance}</option>
                        {loans.map(l => (
                            <option key={l.id} value={l.id}>{l.name}</option>
                        ))}
                    </select>
                </div>
                <div style={{ height: '300px' }}>
                    <Line data={chartData} options={chartOptions} />
                </div>
            </div>
        )}

        <div className="loan-list flex-grow-1">
            {loans.length === 0 ? (
                <p className="text-muted text-center py-5">{t.loans.noLoans}</p>
            ) : (
                <>
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="fw-bold mb-0">{t.loans.title}</h5>
                    <div className="d-flex align-items-center gap-2">
                        <label htmlFor="loan-sort" className="form-label small text-muted fw-bold mb-0">{t.loans.sort}:</label>
                        <select id="loan-sort" className="form-select form-select-sm" style={{width: 'auto'}} value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                            <option value="balanceDesc">{t.loans.sortBalanceDesc}</option>
                            <option value="balanceAsc">{t.loans.sortBalanceAsc}</option>
                            <option value="interestDesc">{t.loans.sortInterestDesc}</option>
                            <option value="interestAsc">{t.loans.sortInterestAsc}</option>
                            <option value="name">{t.loans.sortName}</option>
                        </select>
                    </div>
                </div>
                <div className="list-group list-group-flush border rounded-3 overflow-hidden">
                    {sortedLoans.map((l, index) => (
                        <div key={l.id} className="list-group-item list-group-item-action px-3 py-3 border-bottom rounded-3 mb-1 fade-scale" style={{animationDelay: `${index * 0.05}s`, animationDuration: '0.3s', animationFillMode: 'both'}}>
                            <div className="d-flex justify-content-between align-items-start mb-2">
                                <h5 className="mb-0">{l.name}</h5>
                                <div className="d-flex align-items-center gap-2">
                                    <button className="btn btn-sm btn-outline-secondary" onClick={() => handleEdit(l)}>{t.edit}</button>
                                    <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(l.id)} title={t.loans.delete}>{t.loans.delete}</button>
                                </div>
                            </div>
                            <div className="row small">
                                <div className="col-4"><div className="text-muted text-uppercase small fw-bold mb-1">{t.loans.balance}</div><div>{formatCurrency(l.balance)}</div></div>
                                <div className="col-4"><div className="text-muted text-uppercase small fw-bold mb-1">{t.loans.interest}</div><div>{l.interestRate}%</div></div>
                                <div className="col-4"><div className="text-muted text-uppercase small fw-bold mb-1">{t.loans.payment}</div><div>{formatCurrency(l.monthlyPayment)}{t.loans.perMonth}</div></div>
                            </div>
                        </div>
                    ))}
                </div>
                </>
            )}
        </div>
      </div>

      {showAddModal && (
        <div className="modal fade show d-block" tabIndex="-1" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">{editingId ? t.loans.editLoan : t.loans.addLoan}</h5>
                        <button type="button" className="btn-close" onClick={handleCloseModal}></button>
                    </div>
                    <div className="modal-body">
                        <div className="mb-3">
                            <label className="form-label">{t.loans.name}</label>
                            <input type="text" className="form-control" value={newLoan.name} onChange={e => setNewLoan({...newLoan, name: e.target.value})} placeholder="e.g. Bank Loan" />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">{t.loans.balance}</label>
                            <div className="input-group">
                                <input type="text" className="form-control" value={formatForInput(newLoan.balance)} onChange={e => setNewLoan({...newLoan, balance: parseFromInput(e.target.value)})} placeholder="0.00" />
                                <span className="input-group-text">€</span>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-6 mb-3">
                                <label className="form-label">{t.loans.interest}</label>
                                <div className="input-group">
                                    <input type="number" className="form-control" value={newLoan.interestRate === 0 ? '' : newLoan.interestRate} onChange={e => setNewLoan({...newLoan, interestRate: parseFromInput(e.target.value)})} placeholder="0" />
                                    <span className="input-group-text">%</span>
                                </div>
                            </div>
                            <div className="col-6 mb-3">
                                <label className="form-label">{t.loans.payment}</label>
                                <div className="input-group">
                                    <input type="text" className="form-control" value={formatForInput(newLoan.monthlyPayment)} onChange={e => setNewLoan({...newLoan, monthlyPayment: parseFromInput(e.target.value)})} placeholder="0.00" />
                                    <span className="input-group-text">€</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>{t.cancel}</button>
                        <button type="button" className="btn btn-primary" onClick={handleSave}>{t.save}</button>
                    </div>
                </div>
            </div>
        </div>
      )}

      {loanToDelete && (
        <div className="modal fade show d-block" tabIndex="-1" role="dialog" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">{t.loans.delete}</h5>
                  <button type="button" className="btn-close" onClick={() => setLoanToDelete(null)}></button>
                </div>
                <div className="modal-body">
                  <p>{t.loans.confirmDelete}</p>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setLoanToDelete(null)}>{t.cancel}</button>
                  <button type="button" className="btn btn-danger" onClick={confirmDelete}>{t.loans.delete}</button>
                </div>
              </div>
            </div>
          </div>
      )}
    </div>
  );
}