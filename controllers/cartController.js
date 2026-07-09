const pool = require('../config/db');

exports.addToCart = async (req, res) => {
    const { itemId, quantity } = req.body;

    try {
        // Evaluate stock viability
        const itemCheck = await pool.query('SELECT quantity FROM inventory WHERE id = $1', [itemId]);
        if (itemCheck.rowCount === 0) return res.status(404).json({ error: 'Target inventory item untraceable.' });

        // Upsert cart row
        await pool.query(
            `INSERT INTO cart (item_id, quantity) VALUES ($1, $2)
             ON CONFLICT (item_id) DO UPDATE SET quantity = cart.quantity + EXCLUDED.quantity`,
            [itemId, quantity]
        );
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.checkoutCart = async (req, res) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN'); // Atomic Transaction Start

        const cartItems = await client.query('SELECT item_id, quantity FROM cart');
        
        if (cartItems.rowCount === 0) {
            return res.status(400).json({ error: 'Cart execution halted: Staging area is vacant.' });
        }

        // Deduct quantities systematically
        for (const row of cartItems.rows) {
            const updateResult = await client.query(
                'UPDATE inventory SET quantity = quantity - $1 WHERE id = $2 AND quantity >= $1 RETURNING id',
                [row.quantity, row.item_id]
            );
            if (updateResult.rowCount === 0) {
                throw new Error(`Inventory depletion conflict encountered for Item Reference ID: ${row.item_id}`);
            }
        }

        // Purge the transaction cart state
        await client.query('DELETE FROM cart');
        await client.query('COMMIT'); // Persist structural state changes safely
        res.json({ success: true });
    } catch (err) {
        await client.query('ROLLBACK'); // Evaporate operations on error state
        res.status(400).json({ error: err.message });
    } finally {
        client.release();
    }
};

exports.clearCart = async (req, res) => {
    try {
        await pool.query('DELETE FROM cart');
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
