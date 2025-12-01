const express = require('express');
const knexLib = require('knex');

const env = process.env.NODE_ENV || 'development';
const knexConfig = require('./knexfile')[env];
const knex = knexLib(knexConfig);

const app = express();
app.use(express.json());

// mount menu routes (uses the same knex instance)
app.use('/menu', require('./routes/menu')(knex));
app.use('/orders', require('./routes/orders')(knex));
app.use('/orders/:id', require('./routes/orders')(knex));

async function startServer() {
    try {
        // lightweight connectivity check
        await knex.raw('select 1 as result');
        console.log('DB connection OK.');

        const port = process.env.PORT || 3000;
        app.listen(port, () => {
            console.log(`Server listening on http://localhost:${port}`);
        });
    } catch (err) {
        console.error('DB connection FAILED:', err.message || err);
        try { await knex.destroy(); } catch (_) {}
        process.exit(1);
    }
}

startServer();
