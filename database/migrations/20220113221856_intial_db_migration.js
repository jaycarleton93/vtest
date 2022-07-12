exports.up = async function (knex) {
  await knex.schema.createTable('materials', function (t) {
    t.increments('id').unsigned().primary();
    t.integer('power_level');
    t.integer('qty');
    t.timestamp('deleted_at');
  });

  await knex.schema.createTable('compositions', function (t) {
    t.integer('parent_id').index().references('id').inTable('materials');
    t.integer('material_id').index().references('id').inTable('materials');
    t.integer('qty');
  });
};

exports.down = async function (knex) {
  await knex.schema.dropTable('compositions');
  await knex.schema.dropTable('materials');
};
