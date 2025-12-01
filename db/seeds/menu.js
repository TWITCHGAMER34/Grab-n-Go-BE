const fs = require('fs');
const path = require('path');

exports.seed = async function(knex) {
    await knex('menu_items').del();
    await knex('menu_categories').del();

    const now = new Date();

    const categories = [
        { id: 1, name: 'Burgers', description: 'Classic & specialty burgers', position: 1 },
        { id: 2, name: 'Salads', description: 'Fresh salads and bowls', position: 2 },
        { id: 3, name: 'Drinks', description: 'Soft drinks, coffee and tea', position: 3 },
        { id: 4, name: 'Sides', description: 'Fries, nuggets and extras', position: 4 },
        { id: 5, name: 'Desserts', description: 'Sweet treats', position: 5 }
    ];
    await knex('menu_categories').insert(categories);

    // base folder where seed images live (adjust to your project layout)
    const imagesDir = path.resolve(__dirname, './images');

    function readImageBuffer(filename) {
        const p = path.join(imagesDir, filename);
        // synchronous read is fine in seed scripts
        if (!fs.existsSync(p)) return null;
        return fs.readFileSync(p);
    }

    const items = [
        { category_id: 1, name: 'Classic Burger', description: 'Beef patty, lettuce, tomato, onion, house sauce', price: 99, available: true, position: 1, image: readImageBuffer('classic-burger.png'), created_at: now, updated_at: now },
        { category_id: 1, name: 'Cheese Burger', description: 'Classic + cheddar', price: 109, available: true, position: 2, image: readImageBuffer('cheese-burger.png'), created_at: now, updated_at: now },
        { category_id: 1, name: 'Veggie Burger', description: 'Seasonal veggie patty, vegan mayo', price: 95, available: true, position: 3, image: readImageBuffer('veggie-burger.png'), created_at: now, updated_at: now },

        { category_id: 2, name: 'Caesar Salad', description: 'Romaine, parmesan, croutons, caesar dressing', price: 13, available: true, position: 1, image: readImageBuffer('caesar-salad.png'), created_at: now, updated_at: now },
        { category_id: 2, name: 'Greek Salad', description: 'Tomato, cucumber, feta, olives', price: 12, available: true, position: 2, image: readImageBuffer('greek-salad.png'), created_at: now, updated_at: now },

        { category_id: 3, name: 'Coca-Cola (330ml)', description: null, price: 3, available: true, position: 1, image: readImageBuffer('coke-330.png'), created_at: now, updated_at: now },
        { category_id: 3, name: 'Latte', description: 'Medium, freshly brewed', price: 4, available: true, position: 2, image: readImageBuffer('latte.png'), created_at: now, updated_at: now },
        { category_id: 3, name: 'Bottled Water', description: null, price: 2, available: true, position: 3, image: readImageBuffer('bottled-water.png'), created_at: now, updated_at: now },

        { category_id: 4, name: 'Fries', description: 'Crispy salted fries', price: 3, available: true, position: 1, image: readImageBuffer('fries.png'), created_at: now, updated_at: now },
        { category_id: 4, name: 'Onion Rings', description: 'Battered onion rings', price: 3, available: true, position: 2, image: readImageBuffer('onion-rings.png'), created_at: now, updated_at: now },

        { category_id: 5, name: 'Chocolate Brownie', description: 'Warm brownie with ice cream', price: 5, available: true, position: 1, image: readImageBuffer('chocolate-brownie.png'), created_at: now, updated_at: now },
        { category_id: 5, name: 'Cheesecake', description: 'Classic baked cheesecake', price: 5, available: true, position: 2, image: readImageBuffer('cheesecake.png'), created_at: now, updated_at: now }
    ];

    // remove image fields that are null to avoid inserting explicit nulls if file missing
    const sanitized = items.map(i => {
        const copy = { ...i };
        if (copy.image === null) delete copy.image;
        return copy;
    });

    await knex('menu_items').insert(sanitized);
};
