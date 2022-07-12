const [DEFAULT_QTY, DEFAULT_POWER] = [1, 100];

exports.seed = function (knex) {
  // Deletes ALL existing entries
  return knex('weapons')
    .del()
    .then(function () {
      // Inserts seed entries
      return knex('weapons')
        .insert([
          { name: "Excalibur", power_level: DEFAULT_POWER, qty: DEFAULT_QTY, },
          { name: "Magic Staff", power_level: DEFAULT_POWER, qty: DEFAULT_QTY, },
        ]);
    });
};


