import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Toaster, toast } from 'react-hot-toast';
import { 
  Eye,
  EyeOff
} from 'lucide-react';
import ContactForm from './components/ContactForm';
import AdminPanel from './components/AdminPanel';
import './App.css';

function App() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [showPasswordInput, setShowPasswordInput] = useState(false);

  const handleAdminAccess = () => {
    if (adminPassword === 'admin123') { // In production, use proper authentication
      setIsAdmin(true);
      setShowPasswordInput(false);
      setAdminPassword('');
      toast.success('Admin access granted!');
    } else {
      toast.error('Invalid password!');
    }
  };

  const handleLogout = () => {
    setIsAdmin(false);
    toast.success('Logged out successfully!');
  };

  return (
    <div className="App">
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
            borderRadius: '12px',
            padding: '16px',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />

      {/* Header */}
      <motion.header 
        className="header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="container">
          <div className="header-content">
            <motion.h1 
              className="logo"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              📱 WhatsApp Form Collector
            </motion.h1>
            
            <div className="header-actions">
              {!isAdmin ? (
                <motion.button
                  className="admin-btn"
                  onClick={() => setShowPasswordInput(true)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Eye size={20} />
                  Admin Panel
                </motion.button>
              ) : (
                <motion.button
                  className="logout-btn"
                  onClick={handleLogout}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <EyeOff size={20} />
                  Logout
                </motion.button>
              )}
            </div>
          </div>
        </div>
      </motion.header>

      {/* Hero Section (only show when not admin) */}
      {/* (Remove the hero section entirely) */}

      {/* Admin Password Modal */}
      {showPasswordInput && (
        <motion.div 
          className="modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div 
            className="modal"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
          >
            <h3>Admin Access</h3>
            <p>Enter password to access admin panel</p>
            <input
              type="password"
              placeholder="Enter password"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAdminAccess()}
            />
            <div className="modal-actions">
              <button onClick={handleAdminAccess}>Access</button>
              <button onClick={() => setShowPasswordInput(false)}>Cancel</button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Main Content */}
      <main className="main-content">
        <div className="container">
          {isAdmin ? (
            <AdminPanel />
          ) : (
            <ContactForm />
          )}
        </div>
      </main>

      {/* Footer */}
      <motion.footer 
        className="footer"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        <div className="container">
          <p>&copy; 2024 WhatsApp Form Collector. All rights reserved.</p>
        </div>
      </motion.footer>
    </div>
  );
}

export default App; 