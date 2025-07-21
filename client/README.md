# 🧪 Physiosimplified – Web-Based Test Platform

Physiosimplified is a modern, responsive web-based test platform designed for conducting, managing, and evaluating online tests, primarily aimed at students and professionals in the physiotherapy domain. It features a user-friendly interface, secure authentication, real-time evaluations, and an admin dashboard for managing content and users.

---

## 🚀 Features

- 🧑‍🎓 User registration & login (JWT-based authentication)
- ✅ OTP-based email verification
- 📋 MCQ-based test modules
- 📊 Instant results and analytics
- 🧑‍🏫 Admin dashboard for question management
- 📂 MongoDB database integration
- 🔒 Secure backend APIs
- 🎨 Fully responsive design with Tailwind CSS
- ⚛️ Built with modern frontend and backend technologies

---

## 🛠️ Tech Stack

**Frontend:**

- React.js
- TypeScript
- Vite
- Tailwind CSS
- ShadCN UI

**Backend:**

- Node.js
- Express.js
- MongoDB (via Mongoose)
- JWT for Authentication
- Nodemailer (for email + OTP)

---

## 📁 Folder Structure

/client # Frontend (React)
├── src
│ ├── components
│ ├── pages
│ ├── utils
│ └── App.tsx

/server # Backend (Node + Express)
├── controllers
├── models
├── routes
├── utils
└── server.js

.env # Environment variables


Setup the Backend
cd server
npm install


Create a .env file in /server with the following:

PORT=5000
MONGODB_URI=mongodb://localhost:27017/physiosimplified
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=24h
FRONTEND_URL=http://localhost:3000
EMAIL_USER=your_email@example.com
EMAIL_PASS=your_email_password


Start the backend server:

npm run dev

Setup the Frontend

cd ../client
npm install
npm run dev

