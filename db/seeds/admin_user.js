// File: `db/seeds/admin_user.js`
/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function(knex) {
    const now = new Date();

    const admin = {
        id: 1,
        name: 'Admin',
        email: 'admin@example.com',
        phone: null,
        password_hash: 12345678, // set a real hash in production
        role: 'staff',
        is_active: true,
        is_protected: true,
        created_at: now,
        updated_at: now
    };

    // Insert or update existing admin by email
    await knex('users')
        .insert(admin)
        .onConflict('email')
        .merge(admin);
};