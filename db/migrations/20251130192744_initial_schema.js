exports.up = function(knex) {
    // Money is stored as integer *öre* (1 SEK = 100 öre)
    return knex.schema
        .createTable('users', (table) => {
            table.increments('id').primary();
            table.string('name').notNullable();
            table.string('email').notNullable().unique();
            table.string('phone');
            table.string('password_hash');
            table.enu('role', ['customer', 'staff']).notNullable().defaultTo('customer');
            table.boolean('is_active').notNullable().defaultTo(true);
            table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
            table.timestamp('updated_at').nullable().defaultTo(knex.fn.now());
        })

        .createTable('menu_categories', (table) => {
            table.increments('id').primary();
            table.string('name').notNullable().unique();
            table.string('description');
            table.integer('position').notNullable().defaultTo(0);
        })

        .createTable('menu_items', (table) => {
            table.increments('id').primary();
            table.integer('category_id').unsigned().references('id').inTable('menu_categories').onDelete('SET NULL');
            table.string('name').notNullable();
            table.text('description');
            // store price in öre (integer). Use application logic to convert SEK <-> öre.
            table.integer('price').notNullable().defaultTo(0);
            table.boolean('available').notNullable().defaultTo(true);
            table.string('image');
            table.integer('position').notNullable().defaultTo(0);
            table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
            table.timestamp('updated_at').nullable().defaultTo(knex.fn.now());

            // uniqueness: one item name per category
            table.unique(['category_id', 'name'], 'uq_menuitems_category_name');
            table.index(['category_id', 'available'], 'idx_menuitems_category_available');
        })

        .createTable('orders', (table) => {
            table.increments('id').primary();
            table.integer('user_id').unsigned().references('id').inTable('users').onDelete('SET NULL');
            table.string('guest_name');
            table.string('guest_phone');
            table.enu('status', ['pending','in_kitchen','ready','completed','cancelled']).notNullable().defaultTo('pending');
            table.boolean('locked').notNullable().defaultTo(false);
            table.integer('total').notNullable().defaultTo(0);
            table.datetime('pickup_time').nullable();
            table.text('staff_note').nullable();
            table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
            table.timestamp('updated_at').nullable().defaultTo(knex.fn.now());

            // helpful indexes
            table.index('status', 'idx_orders_status');
            table.index('pickup_time', 'idx_orders_pickup_time');
            table.index('created_at', 'idx_orders_created_at');
        })

        .createTable('order_items', (table) => {
            table.increments('id').primary();
            table.integer('order_id').unsigned().notNullable().references('id').inTable('orders').onDelete('CASCADE');
            table.integer('menu_item_id').unsigned().references('id').inTable('menu_items').onDelete('SET NULL');
            table.integer('quantity').notNullable().defaultTo(1);
            table.integer('unit_price').notNullable().defaultTo(0);
            table.integer('line_total').notNullable().defaultTo(0);
            table.text('notes').nullable();

            table.index('order_id', 'idx_orderitems_order');
        })

        .createTable('order_comments', (table) => {
            table.increments('id').primary();
            table.integer('order_id').unsigned().notNullable().references('id').inTable('orders').onDelete('CASCADE');
            table.integer('staff_id').unsigned().references('id').inTable('users').onDelete('SET NULL');
            table.text('message').notNullable();
            table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());

            table.index('order_id', 'idx_ordercomments_order');
        });
};

exports.down = function(knex) {
    return knex.schema
        .dropTableIfExists('order_comments')
        .dropTableIfExists('order_items')
        .dropTableIfExists('orders')
        .dropTableIfExists('menu_items')
        .dropTableIfExists('menu_categories')
        .dropTableIfExists('users');
};
