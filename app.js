require('dotenv').config();
const express = require('express');
const cors = require('cors');
const menuRoutes = require('./routes/menuRoutes');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json()); 

// Gunakan Routes
app.use('/menu', menuRoutes);

// Cek status server
app.get('/', (req, res) => {
    res.send('✅ Server Menu Catalog Online!');
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});