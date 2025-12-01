// javascript
const express = require('express');

module.exports = (knex) => {
    const router = express.Router();

    // existing POST / (create order) kept as-is...
    router.post('/', async (req, res) => {
        const { user_id, items, total, notes } = req.body;
        if (!user_id || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ error: 'user_id and non-empty items array required' });
        }
        for (const it of items) {
            if (!it.menu_item_id) return res.status(400).json({ error: 'each item needs menu_item_id' });
        }
        try {
            const result = await knex.transaction(async (trx) => {
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

    // DELETE /:id - only allow deletion when order.status === 'pending'
    router.delete('/:id', async (req, res) => {
        const id = Number(req.params.id);
        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({ error: 'invalid order id' });
        }

        try {
            const order = await knex('orders').where({ id }).first();
            if (!order) {
                return res.status(404).json({ error: 'order not found' });
            }

            if (order.status !== 'pending') {
                return res.status(400).json({ error: 'only orders with status \"pending\" can be deleted' });
            }

            await knex.transaction(async (trx) => {
                await trx('orders').where({ id }).del();
                // order_items will be removed by FK ON DELETE CASCADE
            });

            return res.status(204).send();
        } catch (err) {
            console.error(err);
            return res.status(500).json({ error: 'database error' });
        }
    });

    return router;
};
