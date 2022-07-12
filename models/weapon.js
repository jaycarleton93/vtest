const db = require('../config/dbConfig.js');

const table = 'weapons';

const [BROKEN_STATUS, NEW_STATUS] = ["broken", "new"];

class Weapon {
  constructor(payload) {
    this.name = payload.name;
    this.power_level = payload.power_level;
    this.qty = payload.qty;
    this.status = payload.status;
    this.broken_at = payload.broken_at;
  }

  /**
   * Finds a weapon in the database, based on it's name
   * @param {string} name 
   * @returns {Weapon}
   */
  static async find(name) {
    try {
      const weapon = await db(table).where('name', name).first();
      return new Weapon(weapon);
    } catch (e) {
      console.error(e);
      throw 'Weapon not found';
    }
  }

  /**
   * Updates the Weapon in the database, with given values
   * @param {string} name : Weapon name
   * @param {Object} payload : Columns to update, and their values
   */
  static async update(name, payload) {
    await db.transaction(async (trx) => {
      const updates = [];

      for (const col in payload) {
        updates.push(
          updates.push(trx(table).update({ [col]: payload[col] }).where('name', name))
        );
      }

      await Promise.all(updates);

      console.log(`Updated weapon ${name} : ${JSON.stringify(payload)}`);
    });
  }

  /**
   * Breaks a weapon, in the database
   * @param {string} name : Weapon name
   */
  static async destroy(name) {
    await db.transaction(async (trx) => {
      const updates = [
        trx(table).update({ status: BROKEN_STATUS }).where('name', name),
        trx(table).update({ broken_at: db.fn.now() }).where('name', name)
      ];

      await Promise.all(updates);

      console.log(`Destroyed weapon ${name}`);
    });
  }
}

module.exports = Weapon;