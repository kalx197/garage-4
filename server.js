const express = require('express');
const path = require('path');
const inventoryRoutes = require('./routes/inventoryRoutes');
const cartRoutes = require('./routes/cartRoutes');

const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// API Routes Mounting
app.use('/api/inventory', inventoryRoutes);
app.use('/api/cart', cartRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server executing seamlessly on port ${PORT}`));
