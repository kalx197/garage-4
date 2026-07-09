const express = require('express');
const app = express();
require('dotenv').config();

app.use(express.json());

// Wire up structural routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/inventory', require('./routes/inventoryRoutes'));

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Garage Inventory Platform live on port ${PORT}`);
});
