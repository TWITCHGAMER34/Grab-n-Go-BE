/**
 * knexfile.js for sqlite3 (development)
 * - useNullAsDefault: recommended for sqlite3
 * - migrations.directory: keep migrations under ./src/db/migrations
 * - pool.afterCreate: enable foreign key support
 */
module.exports = {

    development: {
        client: 'sqlite3',
        connection: {
            filename: './dev.sqlite3'
        },
        useNullAsDefault: true,
        migrations: {
            directory: './db/migrations',
            tableName: 'knex_migrations'
        },
        seeds: {
            directory: './db/seeds'
        },
        pool: {
            afterCreate: (conn, cb) => {
                conn.run('PRAGMA foreign_keys = ON', cb);
            }
        }
    },

    staging: {
        client: 'postgresql',
        connection: {
            database: 'my_db',
            user:     'username',
            password: 'password'
        },
        pool: { min: 2, max: 10 },
        migrations: { tableName: 'knex_migrations' }
    },

    production: {
        client: 'postgresql',
        connection: {
            database: 'my_db',
            user:     'username',
            password: 'password'
        },
        pool: { min: 2, max: 10 },
        migrations: { tableName: 'knex_migrations' }
    }

};