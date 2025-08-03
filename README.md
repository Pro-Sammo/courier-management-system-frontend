# 📦 Courier and Parcel Management System

A full-featured MERN Stack logistics management platform that enables customers to book parcels, track deliveries in real time, and empowers admins and delivery agents with complete operational tools.

## 🚀 Live Demo

> 🔗 [Live Application URL](https://your-deployed-app-link.com)  
> 🧪 [Postman Collection](https://link-to-postman.com)

---

## 🧩 Tech Stack

### 💻 Frontend
- **React.js**
- **Redux Toolkit + RTK Query**
- **Tailwind CSS / Shadcn UI**
- **React Router**
- **Socket.IO (Client)**
- **Google Maps API**

### 🔧 Backend
- **Node.js** with **Express.js**
- **PostgreSQL** or **MongoDB**
- **JWT Authentication**
- **Socket.IO (Server)**
- **Cloudinary (optional for parcel label uploads)**

---

## 🔐 Roles and Functionalities

### 👤 Customer
- Register/Login
- Book parcel (pickup, delivery, size/type, COD/prepaid)
- View bookings and statuses
- Track parcel in **real-time on map**

### 🚚 Delivery Agent
- View assigned parcels
- Update status (Picked Up, In Transit, Delivered, Failed)
- View **optimized delivery route** via Google Maps API

### 🛠️ Admin
- Parcel Dashboard with:
  - Daily bookings
  - Failed deliveries
  - COD totals
- Assign agents to parcels
- View/manage all users and bookings
- Export reports (CSV/PDF)

---

## 🔁 Real-Time & Maps Features
- Real-time delivery status via **Socket.IO**
- **Geolocation tracking** of agents
- Optimized multi-stop route generation
- **Google Maps** with markers, directions, and live location

---

## ✨ Advanced Features (Implemented/Planned)
- QR Code generation for parcels
- Barcode scan for pickup/delivery confirmation
- Email/SMS notifications
- Multi-language support (e.g., English, Bengali)

---

## 📂 Project Structure

```bash
├── client/                     # React frontend
│   ├── components/
│   ├── pages/
│   ├── store/
│   ├── services/
│   └── App.tsx
├── server/                     # Express backend
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── utils/
│   └── index.js
└── README.md
