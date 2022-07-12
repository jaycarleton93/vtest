const db = require('../config/dbConfig.js');

const table = 'materials';

class Material {
  constructor(payload) {
    if (!payload) {
      return;
    }

    this.id = payload.id;
    this.power_level = payload.power_level;
    this.qty = payload.qty;
    this.deleted_at = payload.deleted_at;
  }

  /**
   * Creates a new Material in the database
   * @param {int} power_level
   * @param {int} qty
   * @returns {int} newID
   */
  static async create(power_level, qty) {
    try {
      // Assume the sequence could be out of order, and manually set the ID based on the current max
      // Note that if data is explicitly seeded with an ID, the sequence will automatically be out of order

      const maxID = await db(table).max("id").first().then(maxObj => maxObj.max);

      const newID = await db(table).insert([
        {
          id: maxID + 1,
          power_level: power_level,
          qty: qty
        }
      ]).returning("id").then(ids => ids[0]);

      console.log(`Created new material ${newID}`);
    } catch (e) {
      console.error(e);
      throw 'Material not created';
    }
  }

  /**
   * Finds and returns a Material from the database, by ID
   * @param {int} id : Database ID
   * @returns {Material}
   */
  static async find(id) {
    try {
      let material = await db(table).where('id', id).first();
      return new Material(material);
    } catch (e) {
      console.error(e);
      throw 'Material not found';
    }
  }

  /**
   * Updates a Material in the database, with given values
   * @param {int} id : Database ID
   * @param {Object} payload : Columns to update, and their values
   */
  static async update(id, payload) {
    await db.transaction(async (trx) => {
      const updates = [];

      for (const col in payload) {
        updates.push(
          updates.push(trx(table).update({ [col]: payload[col] }).where('id', id))
        );
      }

      await Promise.all(updates);

      console.log(`Updated material ${id}: ${JSON.stringify(payload)}`);
    });
  }

  /**
   * Delete a material from the database
   * @param {int} id : Database ID
   */
  static async del(id) {
    try {
      await db(table)
        .update({ deleted_at: db.fn.now() })
        .where('id', id);

      console.log(`Deleted material ${id}`);
    } catch (e) {
      console.error(e);
      throw 'Unable to delete material';
    }
  }
}

module.exports = Material;
