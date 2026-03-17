import { useState, useEffect } from 'react';

export default function Customers({ t, project, onUpdateProject }) {
  const customers = project.customers || [];
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCustomer, setNewCustomer] = useState({ name: '', email: '', date: '' });
  const [sortBy, setSortBy] = useState('newest');
  const [searchQuery, setSearchQuery] = useState('');
  const [showOptionsDropdown, setShowOptionsDropdown] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [customerToDelete, setCustomerToDelete] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const itemsPerPage = 10;

  const setCustomers = (newCustomers) => {
    onUpdateProject({ ...project, customers: newCustomers });
  };

  const handleSave = () => {
    if (!newCustomer.name) return;
    
    if (editingId) {
      const updatedCustomers = customers.map(c => 
        c.id === editingId ? { ...c, ...newCustomer } : c
      );
      setCustomers(updatedCustomers);
    } else {
      const updatedCustomers = [...customers, {
        id: Date.now(),
        ...newCustomer,
        status: 'pending',
        createdAt: Date.now()
      }];
      setCustomers(updatedCustomers);
    }
    setNewCustomer({ name: '', email: '', date: '' });
    setEditingId(null);
    setShowAddModal(false);
  };

  const handleEdit = (customer) => {
    setNewCustomer({ name: customer.name, email: customer.email, date: customer.date });
    setEditingId(customer.id);
    setShowAddModal(true);
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setNewCustomer({ name: '', email: '', date: '' });
    setEditingId(null);
  };

  const toggleStatus = (id) => {
    const updatedCustomers = customers.map(c => 
      c.id === id ? { ...c, status: c.status === 'pending' ? 'completed' : 'pending' } : c
    );
    setCustomers(updatedCustomers);
  };

  const handleDelete = (id) => {
    setCustomerToDelete(id);
  };

  const confirmDelete = () => {
    if (customerToDelete) {
      const updatedCustomers = customers.filter(c => c.id !== customerToDelete);
      setCustomers(updatedCustomers);
      setCustomerToDelete(null);
    }
  };

  const sortedCustomers = [...customers].sort((a, b) => {
    if (sortBy === 'newest') {
      return b.createdAt - a.createdAt;
    } else if (sortBy === 'nearest') {
      if (!a.date) return 1;
      if (!b.date) return -1;
      return new Date(a.date) - new Date(b.date);
    } else if (sortBy === 'nameAsc') {
      return a.name.localeCompare(b.name);
    } else if (sortBy === 'nameDesc') {
      return b.name.localeCompare(a.name);
    } else if (sortBy === 'completed') {
      if (a.status === 'completed' && b.status !== 'completed') return -1;
      if (a.status !== 'completed' && b.status === 'completed') return 1;
      return b.createdAt - a.createdAt;
    } else if (sortBy === 'pending') {
      if (a.status === 'pending' && b.status !== 'pending') return -1;
      if (a.status !== 'pending' && b.status === 'pending') return 1;
      return b.createdAt - a.createdAt;
    }
    return 0;
  });

  const filteredCustomers = sortedCustomers.filter(c => {
    return c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.email && c.email.toLowerCase().includes(searchQuery.toLowerCase()));
  });

  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
  const paginatedCustomers = filteredCustomers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleExport = () => {
    const headers = [t.customers.name, t.customers.email, t.customers.date, t.customers.status];
    const rows = filteredCustomers.map(c => [
      `"${c.name.replace(/"/g, '""')}"`,
      `"${c.email.replace(/"/g, '""')}"`,
      c.date,
      c.status === 'completed' ? t.customers.done : t.customers.notDone
    ]);
    
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'customers.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Reset to first page when search or sort changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, sortBy]);

  return (
    <div className="card border-0 shadow-sm h-100 fade-scale" style={{ minHeight: '80vh', borderRadius: '16px', overflow: 'hidden' }}>
      <div className="card-body p-4 d-flex flex-column">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="fw-bold mb-0">{t.customers.title}</h2>
          <div className="d-flex gap-2 align-items-center">
             <input 
                type="text" 
                className="form-control form-control-sm" 
                placeholder={t.customers.search} 
                value={searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{maxWidth: '200px'}}
             />
             <div className="dropdown position-relative">
                <button 
                  className="btn btn-sm btn-white border dropdown-toggle d-flex align-items-center gap-2" 
                  type="button"
                  onClick={() => setShowOptionsDropdown(!showOptionsDropdown)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16" className="text-secondary">
                    <path fillRule="evenodd" d="M11.5 15a.5.5 0 0 0 .5-.5V2.707l3.146 3.147a.5.5 0 0 0 .708-.708l-4-4a.5.5 0 0 0-.708 0l-4 4a.5.5 0 1 0 .708.708L11 2.707V14.5a.5.5 0 0 0 .5.5zm-7-14a.5.5 0 0 1 .5.5v11.793l3.146-3.147a.5.5 0 0 1 .708.708l-4 4a.5.5 0 0 1-.708 0l-4-4a.5.5 0 0 1 .708-.708L4 13.293V1.5a.5.5 0 0 1 .5-.5z"/>
                  </svg>
                  <span className="fw-medium">
                    {t.customers.sort}
                  </span>
                </button>
                {showOptionsDropdown && (
                  <ul className="dropdown-menu show shadow-sm p-2 border-0 fade-scale" style={{display: 'block', position: 'absolute', right: 0, zIndex: 1000, minWidth: '220px', transformOrigin: 'top right', animationDuration: '0.2s'}}>
                    <li><h6 className="dropdown-header text-uppercase small fw-bold text-muted" style={{fontSize: '0.7rem', letterSpacing: '0.5px'}}>{t.customers.sort}</h6></li>
                    <li>
                      <button className={`dropdown-item rounded-2 d-flex justify-content-between align-items-center px-3 py-2 ${sortBy === 'newest' ? 'text-primary fw-bold' : ''}`} style={{backgroundColor: sortBy === 'newest' ? 'var(--highlight-bg)' : 'transparent'}} onClick={() => { setSortBy('newest'); setShowOptionsDropdown(false); }}>
                        {t.customers.sortNewest}
                      </button>
                    </li>
                    <li>
                      <button className={`dropdown-item rounded-2 d-flex justify-content-between align-items-center px-3 py-2 ${sortBy === 'nearest' ? 'text-primary fw-bold' : ''}`} style={{backgroundColor: sortBy === 'nearest' ? 'var(--highlight-bg)' : 'transparent'}} onClick={() => { setSortBy('nearest'); setShowOptionsDropdown(false); }}>
                        {t.customers.sortNearest}
                      </button>
                    </li>
                    <li>
                      <button className={`dropdown-item rounded-2 d-flex justify-content-between align-items-center px-3 py-2 ${sortBy === 'nameAsc' ? 'text-primary fw-bold' : ''}`} style={{backgroundColor: sortBy === 'nameAsc' ? 'var(--highlight-bg)' : 'transparent'}} onClick={() => { setSortBy('nameAsc'); setShowOptionsDropdown(false); }}>
                        {t.customers.sortNameAsc}
                      </button>
                    </li>
                    <li>
                      <button className={`dropdown-item rounded-2 d-flex justify-content-between align-items-center px-3 py-2 ${sortBy === 'nameDesc' ? 'text-primary fw-bold' : ''}`} style={{backgroundColor: sortBy === 'nameDesc' ? 'var(--highlight-bg)' : 'transparent'}} onClick={() => { setSortBy('nameDesc'); setShowOptionsDropdown(false); }}>
                        {t.customers.sortNameDesc}
                      </button>
                    </li>
                    <li>
                      <button className={`dropdown-item rounded-2 d-flex justify-content-between align-items-center px-3 py-2 ${sortBy === 'completed' ? 'text-primary fw-bold' : ''}`} style={{backgroundColor: sortBy === 'completed' ? 'var(--highlight-bg)' : 'transparent'}} onClick={() => { setSortBy('completed'); setShowOptionsDropdown(false); }}>
                        {t.customers.done}
                      </button>
                    </li>
                    <li>
                      <button className={`dropdown-item rounded-2 d-flex justify-content-between align-items-center px-3 py-2 ${sortBy === 'pending' ? 'text-primary fw-bold' : ''}`} style={{backgroundColor: sortBy === 'pending' ? 'var(--highlight-bg)' : 'transparent'}} onClick={() => { setSortBy('pending'); setShowOptionsDropdown(false); }}>
                        {t.customers.notDone}
                      </button>
                    </li>
                  </ul>
                )}
             </div>
             <button className="btn btn-sm btn-white border d-flex align-items-center justify-content-center" style={{width: '32px', height: '32px'}} onClick={handleExport} title={t.export}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z"/>
                  <path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3z"/>
                </svg>
             </button>
             <button className="btn btn-primary btn-sm d-flex align-items-center justify-content-center" style={{width: '32px', height: '32px'}} onClick={() => setShowAddModal(true)}>
                <span className="fs-5" style={{lineHeight: 1}}>+</span>
             </button>
          </div>
        </div>

        <div className="customer-list flex-grow-1">
            {paginatedCustomers.length === 0 ? (
                <p className="text-muted text-center py-5">{searchQuery ? t.customers.noResults : t.customers.noCustomers}</p>
            ) : (
                <div className="list-group list-group-flush">
                    {paginatedCustomers.map((c, index) => (
                        <div key={c.id} className="list-group-item list-group-item-action px-3 py-3 border-bottom rounded-3 mb-1 fade-scale" style={{animationDelay: `${index * 0.05}s`, animationDuration: '0.3s', animationFillMode: 'both'}}>
                            <div className="d-flex justify-content-between align-items-start mb-2">
                                <h5 className={`mb-0 ${c.status === 'completed' ? 'text-decoration-line-through text-muted' : ''}`}>{c.name}</h5>
                                <div className="d-flex align-items-center gap-2">
                                    <button className="btn btn-sm btn-outline-secondary" onClick={() => handleEdit(c)}>{t.edit}</button>
                                    <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(c.id)}>{t.customers.delete}</button>
                                </div>
                            </div>
                            <div className="row small">
                                <div className="col-md-4"><div className="text-muted text-uppercase small fw-bold mb-1">{t.customers.email}</div><div>{c.email || '-'}</div></div>
                                <div className="col-md-4"><div className="text-muted text-uppercase small fw-bold mb-1">{t.customers.date}</div><div>{c.date ? new Date(c.date).toLocaleDateString() : '-'}</div></div>
                                <div className="col-md-4">
                                    <div className="text-muted text-uppercase small fw-bold mb-1">{t.customers.status}</div>
                                    <div>
                                        <span 
                                            className={`badge ${c.status === 'completed' ? 'bg-success-subtle text-success-emphasis' : 'bg-warning-subtle text-warning-emphasis'}`}
                                            style={{cursor: 'pointer', userSelect: 'none'}}
                                            onClick={() => toggleStatus(c.id)}
                                        >
                                            {c.status === 'completed' ? t.customers.done : t.customers.notDone}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>

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
      </div>

      {showAddModal && (
        <div className="modal fade show d-block" tabIndex="-1" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">{editingId ? t.customers.editCustomer : t.customers.addCustomer}</h5>
                        <button type="button" className="btn-close" onClick={handleCloseModal}></button>
                    </div>
                    <div className="modal-body">
                        <div className="mb-3">
                            <label className="form-label">{t.customers.name}</label>
                            <div className="input-group">
                                <span className="input-group-text border-end-0 text-muted" style={{backgroundColor: 'var(--input-bg)'}}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                        <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0Zm4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4Zm-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10c-2.29 0-3.516.68-4.168 1.332-.678.678-.83 1.418-.832 1.664h10Z"/>
                                    </svg>
                                </span>
                                <input type="text" className="form-control border-start-0 ps-0" value={newCustomer.name} onChange={e => setNewCustomer({...newCustomer, name: e.target.value})} placeholder="John Doe" />
                            </div>
                        </div>
                        <div className="mb-3">
                            <label className="form-label">{t.customers.email}</label>
                            <div className="input-group">
                                <span className="input-group-text border-end-0 text-muted" style={{backgroundColor: 'var(--input-bg)'}}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                        <path d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V4Zm2-1a1 1 0 0 0-1 1v.217l7 4.2 7-4.2V4a1 1 0 0 0-1-1H2Zm13 2.383-4.708 2.825L15 11.105V5.383Zm-.034 6.876-5.64-3.471L8 9.583l-1.326-.795-5.64 3.47A1 1 0 0 0 2 13h12a1 1 0 0 0 .966-.741ZM1 11.105l4.708-2.897L1 5.383v5.722Z"/>
                                    </svg>
                                </span>
                                <input type="email" className="form-control border-start-0 ps-0" value={newCustomer.email} onChange={e => setNewCustomer({...newCustomer, email: e.target.value})} placeholder="john@example.com" />
                            </div>
                        </div>
                        <div className="mb-3">
                            <label className="form-label">{t.customers.date}</label>
                            <div className="input-group">
                                <span className="input-group-text border-end-0 text-muted" style={{backgroundColor: 'var(--input-bg)'}}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                        <path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5zM1 4v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4H1z"/>
                                    </svg>
                                </span>
                                <input type="date" className="form-control border-start-0 ps-0" value={newCustomer.date} onChange={e => setNewCustomer({...newCustomer, date: e.target.value})} />
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

      {customerToDelete && (
        <div className="modal fade show d-block" tabIndex="-1" role="dialog" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">{t.customers.delete}</h5>
                  <button type="button" className="btn-close" onClick={() => setCustomerToDelete(null)}></button>
                </div>
                <div className="modal-body">
                  <p>{t.customers.confirmDelete}</p>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setCustomerToDelete(null)}>{t.cancel}</button>
                  <button type="button" className="btn btn-danger" onClick={confirmDelete}>{t.customers.delete}</button>
                </div>
              </div>
            </div>
          </div>
      )}
    </div>
  );
}