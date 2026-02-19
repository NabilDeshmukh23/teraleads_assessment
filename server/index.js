require('dotenv').config();
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const patientRoutes = require('./routes/patientRoutes');
const chatRoutes = require('./routes/chatRoutes');

const app = express();

app.use(cors({
  origin: [
    'http://localhost:5173', // Local Development
    'https://teraleadsassessment-eight.vercel.app' 
  ],
  credentials: true
}));

app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/chat', chatRoutes);

const PORT = process.env.PORT || 8000; 
app.listen(PORT, () => {
  console.log(`✅ Backend running on port ${PORT}`);
});