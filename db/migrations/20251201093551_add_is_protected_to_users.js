exports.up = async function(knex) {
    // add column
    await knex.schema.table('users', (table) => {
        table.boolean('is_protected').notNullable().defaultTo(false);
    });

    // create trigger to prevent deletion of protected users (SQLite)
    await knex.raw(`
    CREATE TRIGGER IF NOT EXISTS prevent_delete_protected_user
    BEFORE DELETE ON users
    FOR EACH ROW
    BEGIN
      SELECT CASE
        WHEN OLD.is_protected = 1 THEN RAISE(ABORT, 'protected user cannot be deleted')
      END;
    END;
  `);
};

exports.down = async function(knex) {
    await knex.raw(`DROP TRIGGER IF EXISTS prevent_delete_protected_user;`);
    await knex.schema.table('users', (table) => {
        table.dropColumn('is_protected');
    });
};