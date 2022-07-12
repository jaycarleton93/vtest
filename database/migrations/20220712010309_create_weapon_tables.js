exports.up = async function (knex) {
    await knex.schema.createTable('weapons', function (t) {
        t.string('name').primary();
        t.integer('power_level').notNullable();
        t.integer('qty').notNullable();
        t.enu('status', ['new', 'broken']).notNullable().defaultTo('new', options = {});
        t.timestamp('broken_at');
    });

    await knex.schema.createTable('weapon_compositions', function (t) {
        t.string('weapon').notNullable().index().references('name').inTable('weapons');
        t.integer('material_id').notNullable().index().references('id').inTable('materials');
        t.integer('qty').notNullable();
    });
};

exports.down = async function (knex) {
    await knex.schema.dropTable('weapon_compositions');
    await knex.schema.dropTable('weapons');
};
