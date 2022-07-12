const db = require('../config/dbConfig.js');
const table = 'weapon_compositions';

class WeaponComposition {
  constructor(payload) {
    this.weapon = payload.weapon;
    this.material_id = payload.material_id;
    this.qty = payload.qty;
  }

  /**
   * Finds all Weapon Compositions for a given weapon
   * @param {string} weapon 
   * @returns {Array<WeaponComposition>}
   */
  static async findByWeapon(weapon) {
    try {
      const compositions = [];

      await db(table).where('weapon', weapon).then((rows) => {
        for (let row of rows) {
          compositions.push(new WeaponComposition(row));
        }
      });

      return compositions;
    } catch (e) {
      console.error(e);
      throw new Error('Error finding weapon compositions');
    }
  }

  /**
   * Finds all Weapon Compositions using a given material
   * @param {int} material_id
   * @returns {Array<WeaponComposition>}
   */
  static async findByMaterial(material_id) {
    try {
      const compositions = [];

      await db(table).where('material_id', material_id).then((rows) => {
        for (let row of rows) {
          compositions.push(new WeaponComposition(row));
        }
      });

      return compositions;
    } catch (e) {
      console.error(e);
      throw new Error('Error finding weapon compositions');
    }
  }
}

module.exports = WeaponComposition;
