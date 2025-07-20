const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Trust proxy for rate limiting (fixes X-Forwarded-For warning)
app.set('trust proxy', 1);

// Security middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});
app.use('/api/', limiter);

// Database setup
const db = new sqlite3.Database('./form_submissions.db', (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database.');
    createTable();
  }
});

function createTable() {
  const sql = `
    CREATE TABLE IF NOT EXISTS form_submissions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT,
      phone TEXT,
      company TEXT,
      message TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `;
  
  db.run(sql, (err) => {
    if (err) {
      console.error('Error creating table:', err.message);
    } else {
      console.log('Form submissions table created or already exists.');
    }
  });
}

// API Routes
app.post('/api/submit-form', async (req, res) => {
  try {
    const { name, email, phone, company, message } = req.body;
    
    // Validate required fields
    if (!name || !phone) {
      return res.status(400).json({ 
        success: false, 
        message: 'Name and phone number are required' 
      });
    }

    // Insert into database
    const sql = `INSERT INTO form_submissions (name, email, phone, company, message) 
                 VALUES (?, ?, ?, ?, ?)`;
    
    db.run(sql, [name, email, phone, company, message], function(err) {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ 
          success: false, 
          message: 'Error saving form data' 
        });
      }

      // Send WhatsApp message
      sendWhatsAppMessage({
        name,
        email,
        phone,
        company,
        message,
        submissionId: this.lastID
      });

      res.json({ 
        success: true, 
        message: 'Form submitted successfully!',
        submissionId: this.lastID
      });
    });

  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

// Get all submissions
app.get('/api/submissions', (req, res) => {
  const sql = `SELECT * FROM form_submissions ORDER BY created_at DESC`;
  
  db.all(sql, [], (err, rows) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ 
        success: false, 
        message: 'Error fetching submissions' 
      });
    }
    
    res.json({ 
      success: true, 
      data: rows 
    });
  });
});

// Export to CSV
app.get('/api/export-csv', (req, res) => {
  const { startDate, endDate } = req.query;
  
  let sql = `SELECT * FROM form_submissions`;
  let params = [];
  
  if (startDate && endDate) {
    sql += ` WHERE created_at BETWEEN ? AND ?`;
    params = [startDate, endDate];
  }
  
  sql += ` ORDER BY created_at DESC`;
  
  db.all(sql, params, (err, rows) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ 
        success: false, 
        message: 'Error fetching data for export' 
      });
    }

    // Generate CSV content with all values quoted and formatted for Excel
    const csvHeader = 'Name,Email,Phone,Company,Message,Created At\n';
    const csvContent = rows.map(row => {
      // Format date as IST YYYY-MM-DD HH:MM:SS
      const istDateString = row.created_at ? toISTString(row.created_at) : '';
      // Prefix phone and date with single quote to force Excel to treat as text
      const phone = row.phone ? `'${row.phone}` : '';
      const excelDate = istDateString ? `'${istDateString}` : '';
      return `"${row.name || ''}","${row.email || ''}","${phone}","${row.company || ''}","${row.message || ''}","${excelDate}"`;
    }).join('\n');
    
    const csvData = csvHeader + csvContent;
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="form_submissions_${new Date().toISOString().split('T')[0]}.csv"`);
    res.send(csvData);
  });
});

// Helper to convert UTC date string to IST formatted string
function toISTString(dateStringOrDate) {
  const date = typeof dateStringOrDate === 'string' ? new Date(dateStringOrDate) : dateStringOrDate;
  const istOffset = 5.5 * 60; // IST is UTC+5:30
  const utc = date.getTime() + (date.getTimezoneOffset() * 60000);
  const istTime = new Date(utc + (istOffset * 60000));
  return istTime.toLocaleString('en-IN', { hour12: false });
}

// WhatsApp integration function
async function sendWhatsAppMessage(formData) {
  const message = `
🆕 New Form Submission

👤 Name: ${formData.name}
📧 Email: ${formData.email || 'Not provided'}
📱 Phone: ${formData.phone}
🏢 Company: ${formData.company || 'Not provided'}
💬 Message: ${formData.message || 'No message'}

🆔 Submission ID: ${formData.submissionId}
⏰ Submitted: ${toISTString(new Date())}
  `.trim();

  console.log('WhatsApp message to be sent:', message);
  
  // Try Twilio WhatsApp first
  if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
    try {
      const twilio = require('twilio');
      const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
      
      await client.messages.create({
        body: message,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: process.env.WHATSAPP_RECIPIENT_NUMBER
      });
      
      console.log('✅ WhatsApp message sent via Twilio');
      
      // Send auto-acknowledgement to user
      await sendAutoAcknowledgement(formData.phone);
      
      return true;
    } catch (error) {
      console.error('❌ Twilio WhatsApp error:', error.message);
    }
  }
  
  // Try WhatsApp Business API
  if (process.env.WHATSAPP_BUSINESS_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID) {
    try {
      const axios = require('axios');
      
      await axios.post(
        `https://graph.facebook.com/v17.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`,
        {
          messaging_product: 'whatsapp',
          to: process.env.WHATSAPP_RECIPIENT_PHONE,
          type: 'text',
          text: { body: message }
        },
        {
          headers: {
            'Authorization': `Bearer ${process.env.WHATSAPP_BUSINESS_TOKEN}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log('✅ WhatsApp message sent via Business API');
      
      // Send auto-acknowledgement to user
      await sendAutoAcknowledgement(formData.phone);
      
      return true;
    } catch (error) {
      console.error('❌ WhatsApp Business API error:', error.message);
    }
  }
  
  // If no WhatsApp integration is configured, just log the message
  console.log('⚠️  No WhatsApp integration configured. Message would be:');
  console.log(message);
  return false;
}

// Auto-acknowledgement function
async function sendAutoAcknowledgement(userPhone) {
  const acknowledgementMessage = "Thanks for your submission! We'll get back to you shortly.";
  
  console.log('Sending auto-acknowledgement to:', userPhone);
  
  // Try Twilio WhatsApp first
  if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
    try {
      const twilio = require('twilio');
      const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
      
      await client.messages.create({
        body: acknowledgementMessage,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: `whatsapp:${userPhone}`
      });
      
      console.log('✅ Auto-acknowledgement sent via Twilio');
      return true;
    } catch (error) {
      console.error('❌ Twilio auto-acknowledgement error:', error.message);
    }
  }
  
  // Try WhatsApp Business API
  if (process.env.WHATSAPP_BUSINESS_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID) {
    try {
      const axios = require('axios');
      
      await axios.post(
        `https://graph.facebook.com/v17.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`,
        {
          messaging_product: 'whatsapp',
          to: userPhone,
          type: 'text',
          text: { body: acknowledgementMessage }
        },
        {
          headers: {
            'Authorization': `Bearer ${process.env.WHATSAPP_BUSINESS_TOKEN}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log('✅ Auto-acknowledgement sent via Business API');
      return true;
    } catch (error) {
      console.error('❌ WhatsApp Business API auto-acknowledgement error:', error.message);
    }
  }
  
  console.log('⚠️  Could not send auto-acknowledgement. Message would be:');
  console.log(acknowledgementMessage);
  return false;
}

// Serve static files from React build (only in production)
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'client/build')));
  
  // Catch all handler for React app
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
  });
} else {
  // In development, serve a simple message for the root route
  app.get('/', (req, res) => {
    res.json({
      message: 'WhatsApp Form Collector API is running!',
      instructions: 'Please start the React development server with: cd client && npm start',
      api_endpoints: {
        submit_form: 'POST /api/submit-form',
        get_submissions: 'GET /api/submissions',
        export_csv: 'GET /api/export-csv'
      }
    });
  });
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Frontend: http://localhost:${PORT}`);
  console.log(`API: http://localhost:${PORT}/api`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  db.close((err) => {
    if (err) {
      console.error('Error closing database:', err.message);
    } else {
      console.log('Database connection closed.');
    }
    process.exit(0);
  });
});