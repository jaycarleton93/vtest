const db = require('../config/dbConfig.js');
const table = 'compositions';

class Composition {
  constructor(payload) {
    this.parent_id = payload.parent_id;
    this.material_id = payload.material_id;
    this.qty = payload.qty;
  }

  /**
   * Finds all Compositions with a given Parent
   * @param {int} parent_id 
   * @returns {Array<Composition>}
   */
  static async findByParent(parent_id) {
    try {
      const compositions = [];

      await db(table).where('parent_id', parent_id).then((rows) => {
        for (let row of rows) {
          compositions.push(new Composition(row));
        }
      });

      return compositions;
    } catch (e) {
      console.error(e);
      throw new Error('Error finding compositions');
    }
  }

  /**
   * Finds all Compositions for a given child
   * @param {int} material_id 
   * @returns {Array<Composition>}
   */
  static async findByChild(material_id) {
    try {
      const compositions = [];

      await db(table).where('material_id', material_id).then((rows) => {
        for (let row of rows) {
          compositions.push(new Composition(row));
        }
      });

      return compositions;
    } catch (e) {
      console.error(e);
      throw new Error('Error finding compositions');
    }
  }
}

module.exports = Composition;
