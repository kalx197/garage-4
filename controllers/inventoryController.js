const pool = require('../config/db');

// PUBLIC ENDPOINT: Anyone can check if an item exists, view its price, and quantity.
// Notice that 'placement_location' is excluded here to protect your layout.
exports.searchItemsPublic = async (req, res) => {
  const { name } = req.query;
  try {
    if (!name) {
      return res.status(400).json({ error: 'Please enter an item name to search.' });
    }

    const items = await pool.query(
      'SELECT item_name, description, price, quantity FROM inventory_items WHERE item_name ILIKE $1',
      [`%${name}%`]
    );

    if (items.rows.length === 0) {
      return res.status(404).json({ exists: false, message: 'Item does not exist in this garage.' });
    }

    res.json({ exists: true, items: items.rows });
  } catch (err) {
    res.status(500).json({ error: 'Database error searching items.' });
  }
};

// PROTECTED ENDPOINT: Only you (Admin) can view full details, including physical locations.
exports.getAllItemsAdmin = async (req, res) => {
  try {
    const items = await pool.query('SELECT * FROM inventory_items ORDER BY placement_location ASC');
    res.json(items.rows);
  } catch (err) {
    res.status(500).json({ error: 'Database error fetching inventory logs.' });
  }
};

// PROTECTED ENDPOINT: Only you can insert items into the garage inventory.
exports.addItemAdmin = async (req, res) => {
  const { item_name, description, price, placement_location, quantity } = req.body;
  try {
    if (!item_name || !price || !placement_location) {
      return res.status(400).json({ error: 'Item name, price, and placement location are required fields.' });
    }

    const newItem = await pool.query(
      `INSERT INTO inventory_items (item_name, description, price, placement_location, quantity, created_by) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [item_name, description, price, placement_location, quantity || 0, req.user.id]
    );
    res.status(201).json({ message: 'Item successfully logged in inventory.', item: newItem.rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Database error adding item.' });
  }
};
