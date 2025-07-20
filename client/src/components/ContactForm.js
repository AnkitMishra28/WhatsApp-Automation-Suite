import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { 
  User, 
  Mail, 
  Phone, 
  Building, 
  MessageSquare, 
  Send, 
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import axios from 'axios';
import './ContactForm.css';

const ContactForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  // Pre-fill form from URL parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const prefillData = {};
    
    // Get pre-fill parameters from URL
    ['name', 'email', 'phone', 'company', 'message'].forEach(field => {
      const value = urlParams.get(field);
      if (value) {
        prefillData[field] = decodeURIComponent(value);
      }
    });
    
    // If there are pre-fill parameters, update the form
    if (Object.keys(prefillData).length > 0) {
      setFormData(prev => ({
        ...prev,
        ...prefillData
      }));
      
      // Show a toast notification about pre-filled data
      const filledFields = Object.keys(prefillData).join(', ');
      toast.success(`Form pre-filled with: ${filledFields}`, {
        duration: 3000
      });
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[+]?[1-9][\d]{0,15}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Please enter a valid phone number';
    }
    
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const response = await axios.post('/api/submit-form', formData);
      
      if (response.data.success) {
        toast.success('Form submitted successfully! We\'ll contact you soon.');
        setFormData({
          name: '',
          email: '',
          phone: '',
          company: '',
          message: ''
        });
      } else {
        toast.error(response.data.message || 'Something went wrong');
      }
    } catch (error) {
      console.error('Submission error:', error);
      toast.error(error.response?.data?.message || 'Failed to submit form. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
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
      className="contact-form-container"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div className="form-header" variants={itemVariants} style={{marginTop: '0.5em', marginBottom: '1em'}}>
        <p>Fill out the form below and we'll get back to you via WhatsApp!</p>
      </motion.div>

      <motion.form 
        className="contact-form"
        onSubmit={handleSubmit}
        variants={itemVariants}
      >
        <div className="form-grid">
          {/* Name Field */}
          <motion.div 
            className={`form-field ${errors.name ? 'error' : ''}`}
            variants={itemVariants}
          >
            <label htmlFor="name">
              <User size={20} />
              Full Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your full name"
              className={errors.name ? 'error' : ''}
            />
            {errors.name && (
              <motion.span 
                className="error-message"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <AlertCircle size={16} />
                {errors.name}
              </motion.span>
            )}
          </motion.div>

          {/* Email Field */}
          <motion.div 
            className={`form-field ${errors.email ? 'error' : ''}`}
            variants={itemVariants}
          >
            <label htmlFor="email">
              <Mail size={20} />
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email address"
              className={errors.email ? 'error' : ''}
            />
            {errors.email && (
              <motion.span 
                className="error-message"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <AlertCircle size={16} />
                {errors.email}
              </motion.span>
            )}
          </motion.div>

          {/* Phone Field */}
          <motion.div 
            className={`form-field ${errors.phone ? 'error' : ''}`}
            variants={itemVariants}
          >
            <label htmlFor="phone">
              <Phone size={20} />
              Phone Number *
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Enter your phone number"
              className={errors.phone ? 'error' : ''}
            />
            {errors.phone && (
              <motion.span 
                className="error-message"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <AlertCircle size={16} />
                {errors.phone}
              </motion.span>
            )}
          </motion.div>

          {/* Company Field */}
          <motion.div 
            className="form-field"
            variants={itemVariants}
          >
            <label htmlFor="company">
              <Building size={20} />
              Company
            </label>
            <input
              type="text"
              id="company"
              name="company"
              value={formData.company}
              onChange={handleChange}
              placeholder="Enter your company name"
            />
          </motion.div>
        </div>

        {/* Message Field */}
        <motion.div 
          className="form-field message-field"
          variants={itemVariants}
        >
          <label htmlFor="message">
            <MessageSquare size={20} />
            Message
          </label>
          <textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleChange}
            placeholder="Tell us about your inquiry..."
            rows="4"
          />
        </motion.div>

        {/* Submit Button */}
        <motion.button
          type="submit"
          className={`submit-btn ${isSubmitting ? 'submitting' : ''}`}
          disabled={isSubmitting}
          variants={itemVariants}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {isSubmitting ? (
            <>
              <div className="loading-spinner"></div>
              Sending...
            </>
          ) : (
            <>
              <Send size={20} />
              Send Message
            </>
          )}
        </motion.button>

        {/* Success Message */}
        <motion.div 
          className="form-info"
          variants={itemVariants}
        >
          <CheckCircle size={20} />
          <p>Your message will be sent directly to our WhatsApp for immediate response!</p>
        </motion.div>
      </motion.form>
    </motion.div>
  );
};

export default ContactForm; 