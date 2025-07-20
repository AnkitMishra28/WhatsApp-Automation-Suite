import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { 
  Download, 
  Calendar,
  Search,
  RefreshCw,
  FileText,
  User,
  Mail,
  Phone,
  Building,
  MessageSquare,
  Clock
} from 'lucide-react';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import './AdminPanel.css';

const AdminPanel = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [filteredSubmissions, setFilteredSubmissions] = useState([]);
  const [showUrlGenerator, setShowUrlGenerator] = useState(false);
  const [urlParams, setUrlParams] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    message: ''
  });

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/submissions');
      if (response.data.success) {
        setSubmissions(response.data.data);
      } else {
        toast.error('Failed to fetch submissions');
      }
    } catch (error) {
      console.error('Error fetching submissions:', error);
      toast.error('Error loading submissions');
    } finally {
      setLoading(false);
    }
  };

  // Auto-refresh submissions every 30 seconds for real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      fetchSubmissions();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, []);

  const filterSubmissions = useCallback(() => {
    let filtered = [...submissions];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(submission =>
        submission.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        submission.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        submission.phone?.includes(searchTerm) ||
        submission.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        submission.message?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Date filter
    if (startDate || endDate) {
      filtered = filtered.filter(submission => {
        const submissionDate = new Date(submission.created_at);
        const start = startDate ? new Date(startDate) : null;
        const end = endDate ? new Date(endDate) : null;

        if (start && end) {
          return submissionDate >= start && submissionDate <= end;
        } else if (start) {
          return submissionDate >= start;
        } else if (end) {
          return submissionDate <= end;
        }
        return true;
      });
    }

    setFilteredSubmissions(filtered);
  }, [submissions, searchTerm, startDate, endDate]);

  useEffect(() => {
    fetchSubmissions();
  }, []);

  useEffect(() => {
    filterSubmissions();
  }, [filterSubmissions]);

  const handleExportCSV = async () => {
    try {
      setExporting(true);
      
      let url = '/api/export-csv';
      const params = new URLSearchParams();
      
      if (startDate) {
        params.append('startDate', startDate.toISOString());
      }
      if (endDate) {
        params.append('endDate', endDate.toISOString());
      }
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await axios.get(url, {
        responseType: 'blob'
      });

      const blob = new Blob([response.data], { type: 'text/csv' });
      const url2 = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url2;
      link.download = `form_submissions_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url2);

      toast.success('CSV exported successfully!');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export CSV');
    } finally {
      setExporting(false);
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStartDate(null);
    setEndDate(null);
  };

  const generateUrl = () => {
    const params = new URLSearchParams();
    Object.entries(urlParams).forEach(([key, value]) => {
      if (value.trim()) {
        params.append(key, value.trim());
      }
    });
    
    const baseUrl = window.location.origin;
    const generatedUrl = `${baseUrl}?${params.toString()}`;
    
    // Copy to clipboard
    navigator.clipboard.writeText(generatedUrl).then(() => {
      toast.success('URL copied to clipboard!');
    }).catch(() => {
      toast.error('Failed to copy URL');
    });
    
    return generatedUrl;
  };

  const clearUrlParams = () => {
    setUrlParams({
      name: '',
      email: '',
      phone: '',
      company: '',
      message: ''
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    // Convert to IST (UTC+5:30)
    const istOffset = 5.5 * 60; // in minutes
    const utc = date.getTime() + (date.getTimezoneOffset() * 60000);
    const istTime = new Date(utc + (istOffset * 60000));
    return istTime.toLocaleString('en-IN', { hour12: false });
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 }
  };

  return (
    <motion.div 
      className="admin-panel-container"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="admin-header">
        {/* Remove the Admin Dashboard heading */}
        <p className="admin-subtitle">Manage form submissions and export data</p>
        <div className="realtime-indicator">
          <div className="pulse-dot"></div>
          <span>Real-time updates enabled</span>
        </div>
      </div>

      {/* Controls Section */}
      <motion.div className="controls-section" variants={itemVariants}>
        <div className="controls-grid">
          {/* Search Box */}
          <div className="search-box">
            <Search size={20} />
            <input
              type="text"
              placeholder="Search by name, email, phone, company, or message..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Date Filters */}
          <div className="date-filters">
            <div className="date-picker">
              <Calendar size={20} />
              <DatePicker
                selected={startDate}
                onChange={(date) => setStartDate(date)}
                selectsStart
                startDate={startDate}
                endDate={endDate}
                placeholderText="Start Date"
                className="date-input"
                dateFormat="yyyy-MM-dd"
              />
            </div>
            <div className="date-picker">
              <Calendar size={20} />
              <DatePicker
                selected={endDate}
                onChange={(date) => setEndDate(date)}
                selectsEnd
                startDate={startDate}
                endDate={endDate}
                minDate={startDate}
                placeholderText="End Date"
                className="date-input"
                dateFormat="yyyy-MM-dd"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="action-buttons">
            <motion.button
              className="refresh-btn"
              onClick={fetchSubmissions}
              disabled={loading}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <RefreshCw size={20} className={loading ? 'spinning' : ''} />
              Refresh
            </motion.button>

            <motion.button
              className="clear-btn"
              onClick={clearFilters}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Clear Filters
            </motion.button>

                      <motion.button
            className="export-btn"
            onClick={handleExportCSV}
            disabled={exporting || filteredSubmissions.length === 0}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {exporting ? (
              <>
                <div className="loading-spinner"></div>
                Exporting...
              </>
            ) : (
              <>
                <Download size={20} />
                Export CSV ({filteredSubmissions.length})
              </>
            )}
          </motion.button>

          <motion.button
            className="url-generator-btn"
            onClick={() => setShowUrlGenerator(!showUrlGenerator)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            🔗 URL Generator
          </motion.button>
          </div>
        </div>
      </motion.div>

      {/* URL Generator Section */}
      {showUrlGenerator && (
        <motion.div 
          className="url-generator-section"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
        >
          <h3>🔗 Pre-filled URL Generator</h3>
          <p className="url-generator-subtitle">Generate URLs that pre-fill the contact form for marketing campaigns</p>
          
          <div className="url-generator-grid">
            <div className="url-input-group">
              <label>Name:</label>
              <input
                type="text"
                value={urlParams.name}
                onChange={(e) => setUrlParams(prev => ({ ...prev, name: e.target.value }))}
                placeholder="John Doe"
              />
            </div>
            <div className="url-input-group">
              <label>Email:</label>
              <input
                type="email"
                value={urlParams.email}
                onChange={(e) => setUrlParams(prev => ({ ...prev, email: e.target.value }))}
                placeholder="john@example.com"
              />
            </div>
            <div className="url-input-group">
              <label>Phone:</label>
              <input
                type="tel"
                value={urlParams.phone}
                onChange={(e) => setUrlParams(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="+1234567890"
              />
            </div>
            <div className="url-input-group">
              <label>Company:</label>
              <input
                type="text"
                value={urlParams.company}
                onChange={(e) => setUrlParams(prev => ({ ...prev, company: e.target.value }))}
                placeholder="Acme Corp"
              />
            </div>
            <div className="url-input-group">
              <label>Message:</label>
              <textarea
                value={urlParams.message}
                onChange={(e) => setUrlParams(prev => ({ ...prev, message: e.target.value }))}
                placeholder="Interested in your services..."
                rows="3"
              />
            </div>
          </div>
          
          <div className="url-generator-actions">
            <motion.button
              className="generate-url-btn"
              onClick={generateUrl}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Generate & Copy URL
            </motion.button>
            <motion.button
              className="clear-url-btn"
              onClick={clearUrlParams}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Clear Fields
            </motion.button>
          </div>
        </motion.div>
      )}

      {/* Stats Section */}
      <motion.div className="stats-section" variants={itemVariants}>
        <div className="stats-grid">
          <div className="stat-card">
            <FileText size={24} />
            <div>
              <h3>{submissions.length}</h3>
              <p>Total Submissions</p>
            </div>
          </div>
          <div className="stat-card">
            <User size={24} />
            <div>
              <h3>{filteredSubmissions.length}</h3>
              <p>Filtered Results</p>
            </div>
          </div>
          <div className="stat-card">
            <Clock size={24} />
            <div>
              <h3>{submissions.length > 0 ? formatDate(submissions[0].created_at).split(',')[0] : 'N/A'}</h3>
              <p>Latest Submission</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Submissions Table */}
      <motion.div className="submissions-section" variants={itemVariants}>
        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading submissions...</p>
          </div>
        ) : filteredSubmissions.length === 0 ? (
          <div className="empty-state">
            <FileText size={48} />
            <h3>No submissions found</h3>
            <p>Try adjusting your search or date filters</p>
          </div>
        ) : (
          <div className="submissions-table">
            <div className="table-header">
              <div className="header-cell">Name</div>
              <div className="header-cell">Contact</div>
              <div className="header-cell">Company</div>
              <div className="header-cell">Message</div>
              <div className="header-cell">Date</div>
            </div>
            
            <div className="table-body">
              {filteredSubmissions.map((submission) => (
                <motion.div 
                  key={submission.id} 
                  className="table-row"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="table-cell">
                    <div className="user-info">
                      <User size={16} />
                      <span>{submission.name}</span>
                    </div>
                  </div>
                  <div className="table-cell">
                    <div className="contact-info">
                      {submission.email && (
                        <div className="contact-item">
                          <Mail size={14} />
                          <span>{submission.email}</span>
                        </div>
                      )}
                      {submission.phone && (
                        <div className="contact-item">
                          <Phone size={14} />
                          <span>{submission.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="table-cell">
                    {submission.company ? (
                      <div className="company-info">
                        <Building size={16} />
                        <span>{submission.company}</span>
                      </div>
                    ) : (
                      <span className="no-data">-</span>
                    )}
                  </div>
                  <div className="table-cell">
                    {submission.message ? (
                      <div className="message-preview">
                        <MessageSquare size={16} />
                        <span>{submission.message.length > 50 
                          ? `${submission.message.substring(0, 50)}...` 
                          : submission.message}
                        </span>
                      </div>
                    ) : (
                      <span className="no-data">-</span>
                    )}
                  </div>
                  <div className="table-cell">
                    <div className="date-info">
                      <Clock size={16} />
                      <span>{formatDate(submission.created_at)}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default AdminPanel; 