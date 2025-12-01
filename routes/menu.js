const express = require('express');

module.exports = function(knex) {
    const router = express.Router();

    // GET /menu  -> returns categories with nested items
    router.get('/', async (req, res) => {
        try {
            const categories = await knex('menu_categories')
                .select('id', 'name', 'description', 'position')
                .orderBy('position', 'asc');

            const items = await knex('menu_items')
                .select('id', 'category_id', 'name', 'description', 'available', 'position', 'price', 'image')
                .orderBy(['category_id', 'position']);

            const result = categories.map(cat => ({
                ...cat,
                items: items.filter(it => it.category_id === cat.id)
            }));

            res.json({ categories: result });
        } catch (err) {
            console.error('Error fetching menu:', err);
            res.status(500).json({ error: 'Failed to fetch menu' });
        }
    });

    return router;
};
