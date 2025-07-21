const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const testRoutes = require('./routes/tests');
const resultRoutes = require('./routes/results');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/tests', testRoutes);
app.use('/api/results', resultRoutes);



// Routes
app.use('/api/auth', require('./routes/auth'));

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB Connected');
    app.listen(process.env.PORT, () =>
      console.log(`Server running on port ${process.env.PORT}`)
    );
  })
  .catch(err => console.error(err));
