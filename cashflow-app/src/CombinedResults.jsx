import { useState, useEffect, useMemo } from 'react';
import { supabase } from './supabase';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const CombinedResults = ({ t, theme }) => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('lead_submissions')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setSubmissions(data || []);
      } catch (err) {
        console.error('Error fetching submissions:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const stats = useMemo(() => {
    if (submissions.length === 0) return null;

    const scores = submissions.map(s => s.data?.score || 0);
    const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
    
    // Score buckets
    const buckets = {
      '0-20': 0,
      '21-40': 0,
      '41-60': 0,
      '61-80': 0,
      '81-100': 0
    };

    scores.forEach(s => {
      if (s <= 20) buckets['0-20']++;
      else if (s <= 40) buckets['21-40']++;
      else if (s <= 60) buckets['41-60']++;
      else if (s <= 80) buckets['61-80']++;
      else buckets['81-100']++;
    });

    return {
      total: submissions.length,
      avgScore: Math.round(avgScore),
      buckets
    };
  }, [submissions]);

  const barData = {
    labels: stats ? Object.keys(stats.buckets) : [],
    datasets: [
      {
        label: t.submissionsCount || 'Number of Submissions',
        data: stats ? Object.values(stats.buckets) : [],
        backgroundColor: theme === 'dark' ? 'rgba(75, 192, 192, 0.6)' : 'rgba(54, 162, 235, 0.6)',
        borderColor: theme === 'dark' ? 'rgba(75, 192, 192, 1)' : 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      },
    ],
  };

  const pieData = {
    labels: ['Critical', 'High Stress', 'Moderate', 'Strong'],
    datasets: [
      {
        data: stats ? [
          stats.buckets['0-20'] + stats.buckets['21-40'],
          stats.buckets['41-60'],
          stats.buckets['61-80'],
          stats.buckets['81-100']
        ] : [],
        backgroundColor: [
          'rgba(255, 99, 132, 0.7)',
          'rgba(255, 159, 64, 0.7)',
          'rgba(255, 205, 86, 0.7)',
          'rgba(75, 192, 192, 0.7)',
        ],
        hoverOffset: 4,
      },
    ],
  };

  if (loading) return <div className="p-5 text-center"><div className="spinner-border text-primary" role="status"></div><p className="mt-3">Loading results...</p></div>;
  if (error) return <div className="p-5 text-center text-danger"><h3>Error</h3><p>{error}</p></div>;

  return (
    <div className="container-fluid py-5 fade-scale">
      <div className="row mb-5">
        <div className="col-12">
          <h1 className="display-4 fw-bold mb-4">Financial Stability - Combined Results</h1>
          <p className="lead text-muted">Analysis of all {submissions.length} submissions received to date.</p>
        </div>
      </div>

      <div className="row g-4 mb-5">
        <div className="col-md-3">
          <div className={`card h-100 border-0 shadow-sm p-4 rounded-4 ${theme === 'dark' ? 'bg-dark text-white' : ''}`}>
            <h6 className="text-secondary text-uppercase fw-bold mb-3">Total Responses</h6>
            <div className="display-4 fw-bold text-primary">{submissions.length}</div>
          </div>
        </div>
        <div className="col-md-3">
          <div className={`card h-100 border-0 shadow-sm p-4 rounded-4 ${theme === 'dark' ? 'bg-dark text-white' : ''}`}>
            <h6 className="text-secondary text-uppercase fw-bold mb-3">Average Score</h6>
            <div className="display-4 fw-bold text-success">{stats?.avgScore || 0}</div>
          </div>
        </div>
        <div className="col-md-6">
          <div className={`card h-100 border-0 shadow-sm p-4 rounded-4 ${theme === 'dark' ? 'bg-dark text-white' : ''}`}>
            <h6 className="text-secondary text-uppercase fw-bold mb-3">Summary</h6>
            <p className="mb-0">
              The aggregate data shows an overall stability score of <strong>{stats?.avgScore}</strong>. 
              {stats?.avgScore > 70 ? ' Most businesses are in a strong position.' : ' There are significant risks across the sample.'}
            </p>
          </div>
        </div>
      </div>

      <div className="row g-4 mb-5">
        <div className="col-lg-7">
          <div className={`card border-0 shadow-sm p-4 rounded-4 h-100 ${theme === 'dark' ? 'bg-dark text-white border-secondary' : ''}`}>
            <h5 className="fw-bold mb-4">Score Distribution</h5>
            <div style={{ height: '300px' }}>
              <Bar data={barData} options={{ maintainAspectRatio: false }} />
            </div>
          </div>
        </div>
        <div className="col-lg-5">
          <div className={`card border-0 shadow-sm p-4 rounded-4 h-100 ${theme === 'dark' ? 'bg-dark text-white border-secondary' : ''}`}>
            <h5 className="fw-bold mb-4">Status Breakdown</h5>
            <div style={{ height: '300px' }}>
              <Pie data={pieData} options={{ maintainAspectRatio: false }} />
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-12">
          <div className={`card border-0 shadow-sm p-4 rounded-4 ${theme === 'dark' ? 'bg-dark text-white' : ''}`}>
            <h5 className="fw-bold mb-4">Recent Submissions</h5>
            <div className="table-responsive">
              <table className={`table table-hover ${theme === 'dark' ? 'table-dark' : ''}`}>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>User</th>
                    <th>Score</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {submissions.map((s, idx) => {
                    const score = s.data?.score || 0;
                    let badgeClass = 'bg-success';
                    if (score < 40) badgeClass = 'bg-danger';
                    else if (score < 70) badgeClass = 'bg-warning text-dark';

                    return (
                      <tr key={s.id || idx}>
                        <td>{new Date(s.created_at).toLocaleDateString()}</td>
                        <td>{s.user_email || 'Anonymous'}</td>
                        <td className="fw-bold">{score}</td>
                        <td><span className={`badge ${badgeClass}`}>{score >= 81 ? 'Strong' : score >= 61 ? 'Moderate' : score >= 31 ? 'Stress' : 'Critical'}</span></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CombinedResults;
