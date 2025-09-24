# WhatsApp Form Collector

A beautiful, user-friendly web application that collects form submissions and sends them directly to WhatsApp, with CSV export functionality for data management.

## ✨ Features

### Beautiful User Interface
- **Modern Design**: Clean, professional UI with gradient backgrounds and glassmorphism effects
- **Responsive Layout**: Works perfectly on desktop, tablet, and mobile devices
- **Smooth Animations**: Framer Motion animations for enhanced user experience
- **Real-time Validation**: Instant form validation with helpful error messages
- **Loading States**: Beautiful loading animations and feedback

### 📝 Smart Form Collection
- **User-friendly Fields**: Name, email, phone, company, and message
- **Smart Validation**: Real-time validation with proper error handling
- **Auto-clear**: Form automatically clears after successful submission
- **Success Feedback**: Toast notifications for user confirmation

### WhatsApp Integration
- **Instant Delivery**: Form data sent directly to WhatsApp in real-time
- **Formatted Messages**: Beautifully formatted messages with emojis and structure
- **Multiple Providers**: Support for Twilio and WhatsApp Business API
- **Error Handling**: Robust error handling for failed deliveries

### 📊 Admin Dashboard
- **Secure Access**: Password-protected admin panel
- **Real-time Data**: View all form submissions in real-time
- **Advanced Filtering**: Search and date range filtering
- **CSV Export**: Export filtered data to CSV with date ranges
- **Statistics**: Dashboard with submission statistics

### 🔒 Security Features
- **Rate Limiting**: Prevents spam and abuse
- **Input Validation**: Server-side validation for all inputs
- **SQL Injection Protection**: Parameterized queries
- **CORS Protection**: Secure cross-origin requests
- **Helmet Security**: Additional security headers

## Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- WhatsApp Business account or Twilio account

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd whatsapp-form-collector
   ```

2. **Install dependencies**
   ```bash
   # Install server dependencies
   npm install
   
   # Install client dependencies
   cd client
   npm install
   cd ..
   ```

3. **Configure environment variables**
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` file with your configuration:
   ```env
   PORT=5000
   NODE_ENV=development
   
   # For Twilio WhatsApp
   TWILIO_ACCOUNT_SID=your_twilio_account_sid
   TWILIO_AUTH_TOKEN=your_twilio_auth_token
   TWILIO_PHONE_NUMBER=whatsapp:+1234567890
   WHATSAPP_RECIPIENT_NUMBER=whatsapp:+1234567890
   
   # For WhatsApp Business API
   WHATSAPP_BUSINESS_TOKEN=your_whatsapp_business_token
   WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
   WHATSAPP_RECIPIENT_PHONE=1234567890
   ```

4. **Start the application**
   ```bash
   # Development mode (recommended) - runs both server and React dev server
   npm run dev:full
   
   # Alternative: Run server only
   npm run dev
   
   # Production mode
   npm run build:prod
   ```

5. **Access the application**
   - **Development**: Frontend at http://localhost:3000, API at http://localhost:5000/api
   - **Production**: Everything at http://localhost:5000

## WhatsApp Setup

### Option 1: Twilio WhatsApp (Recommended for testing)

1. Sign up for a [Twilio account](https://www.twilio.com/)
2. Get your Account SID and Auth Token
3. Set up WhatsApp Sandbox in Twilio Console
4. Configure the environment variables

### Option 2: WhatsApp Business API

1. Set up a [WhatsApp Business account](https://business.whatsapp.com/)
2. Get your Business API credentials
3. Configure the environment variables

## 🎯 Usage

### For Users
1. Visit the website
2. Fill out the beautiful contact form
3. Submit the form
4. Receive instant confirmation
5. Your message is sent to WhatsApp automatically

### For Administrators
1. Click "Admin Panel" in the header
2. Enter the admin password (default: `admin123`)
3. View all form submissions
4. Use search and date filters
5. Export data to CSV

## 📁 Project Structure

```
whatsapp-form-collector/
├── server.js                 # Main server file
├── package.json              # Server dependencies
├── env.example              # Environment variables template
├── form_submissions.db      # SQLite database (auto-created)
├── client/                  # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ContactForm.js
│   │   │   ├── ContactForm.css
│   │   │   ├── AdminPanel.js
│   │   │   └── AdminPanel.css
│   │   ├── App.js
│   │   ├── App.css
│   │   ├── index.js
│   │   └── index.css
│   └── package.json
└── README.md
```

## 🔧 API Endpoints

### Form Submission
- **POST** `/api/submit-form`
  - Body: `{ name, email, phone, company, message }`
  - Response: `{ success: true, message: "Form submitted successfully!" }`

### Get Submissions
- **GET** `/api/submissions`
  - Response: `{ success: true, data: [...] }`

### Export CSV
- **GET** `/api/export-csv?startDate=2024-01-01&endDate=2024-12-31`
  - Response: CSV file download

## Customization

### Styling
- Modify CSS files in `client/src/` for custom styling
- Update color schemes in CSS variables
- Customize animations in Framer Motion components

### Form Fields
- Add/remove fields in `ContactForm.js`
- Update validation in the form component
- Modify database schema in `server.js`

### WhatsApp Message Format
- Customize message format in `sendWhatsAppMessage()` function
- Add/remove fields from the message template
- Modify emoji usage and formatting

## Deployment

### Vercel
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push

### DigitalOcean
1. Create a Droplet
2. Install Node.js and PM2
3. Clone repository and configure
4. Use PM2 for process management

## 🔒 Security Considerations

- Change default admin password in production
- Use HTTPS in production
- Implement proper session management
- Add rate limiting for production use
- Regular security updates
- Database backup strategy

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the code comments

## 🎉 Features Roadmap

- [ ] Email notifications
- [ ] SMS fallback
- [ ] Multi-language support
- [ ] Advanced analytics
- [ ] User management
- [ ] API rate limiting dashboard
- [ ] Webhook support
- [ ] Integration with CRM systems

---

**Made with ❤️ for seamless form collection and WhatsApp integration** 
