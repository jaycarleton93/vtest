exports.seed = function (knex) {
  // Deletes ALL existing entries
  return knex('weapon_compositions')
    .del()
    .then(function () {
      // Inserts seed entries
      return knex('weapon_compositions')
        .insert([
          { weapon: "Excalibur", material_id: 1, qty: 1 },
          { weapon: "Excalibur", material_id: 6, qty: 1 },
          { weapon: "Excalibur", material_id: 9, qty: 1 },
          { weapon: "Excalibur", material_id: 12, qty: 1 },

          { weapon: "Magic Staff", material_id: 6, qty: 1 },
        ]);
    });
};


