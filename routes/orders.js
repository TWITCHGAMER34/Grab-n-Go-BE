// `routes/orders.js`
const express = require('express');

module.exports = (knex) => {
    const router = express.Router();

    // POST /orders
    // Body: { user_id: number, items: [{ menu_item_id: number, quantity?: number, price?: number }], total?: number, notes?: string }
    router.post('/', async (req, res) => {
        const { user_id, items, total, notes } = req.body;

        if (!user_id || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ error: 'user_id and non-empty items array required' });
        }

        // basic items validation
        for (const it of items) {
            if (!it.menu_item_id) return res.status(400).json({ error: 'each item needs menu_item_id' });
        }

        try {
            const result = await knex.transaction(async (trx) => {
                // compute total if not provided
                const computedTotal = typeof total === 'number'
                    ? total
                    : items.reduce((s, it) => s + (Number(it.price || 0) * (it.quantity || 1)), 0);

                const [orderId] = await trx('orders').insert({
                    user_id,
                    total: computedTotal,
                    status: 'pending',
                    notes: notes || null,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                });

                const orderItems = items.map(it => ({
                    order_id: orderId,
                    menu_item_id: it.menu_item_id,
                    quantity: it.quantity || 1,
                    price: typeof it.price === 'number' ? it.price : null,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                }));

                if (orderItems.length) {
                    await trx('order_items').insert(orderItems);
                }

                return orderId;
            });

            return res.status(201).json({ id: result });
        } catch (err) {
            console.error(err);
            return res.status(500).json({ error: 'database error' });
        }
    });

    return router;
};