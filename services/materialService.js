/**
 * A mapping of required and available materials, where each key is a material ID
 * @typedef {Object} MaterialMap
 * @property {int} required
 * @property {int} available
 * @property {MaterialMap} [children]
 */

const { find, update, del, create } = require('../models/material');
const findCompositionsByChild = require("../models/composition").findByChild;
const findCompositionsByParent = require("../models/composition").findByParent;

const MaterialService = () => {

  /**
   * Retreives a material, by its ID
   * @param {int} id 
   * @returns {Material} 
   */
  const getMaterial = async (id) => {
    return find(id);
  };

  /**
   * Retreives a material, by its ID
   * @param {int} powerLevel
   * @param {int} qty
   * @returns {Material} 
   */
  const createMaterial = async (powerLevel, qty) => {
    return await create(powerLevel, qty);
  };

  /**
   * Calculates the total power of a material, by summing the base power, with all composing materials base powers
   * @param {int} id 
   * @returns {int} totalPower
   */
  const getTotalMaterialPower = async (id) => {
    const material = await find(id);
    const compositions = await findCompositionsByParent(material.id);

    // For each composing material, if any, find their total power level, and add to the base
    let totalPower = material.power_level;
    for (const composition of compositions) {
      const childMaterial = await find(composition.material_id);

      totalPower += composition.qty * await (getTotalMaterialPower(childMaterial.id));
    }

    return totalPower;
  };

  /**
   * Updates a material
   * @param {int} id 
   * @param {int} [power] 
   * @param {int} [qty] 
   */
  const updateMaterial = async (id, power, qty) => {
    let payload = {};
    if (power) payload.power_level = power;
    if (qty) payload.qty = qty;

    await update(id, payload);
  };

  /**
   * Finds all materials that are composed of a given material, or any material higher up in the composition chain(eg, composed of something that is composed of this)
   * @param {int} id 
   * @returns {Array<int>} : IDs of parent materials
   */
  const getMaterialParents = async (id) => {
    const parentCompositions = await findCompositionsByChild(id);
    let parentMaterials = [];

    for (const parentComposition of parentCompositions) {
      parentMaterials.push(parentComposition.parent_id);
      const newParentMaterials = await getMaterialParents(parentComposition.parent_id);
      if (newParentMaterials.length > 0) parentMaterials = parentMaterials.concat(newParentMaterials);
    }

    return parentMaterials;
  };

  /**
   * For a set of given materials, finds the available quantity of each, as well as the available and required quantities of each child element that could be used to compose it
   * @param {MaterialMap} materialMap 
   * @returns {MaterialMap} materialMap
   */
  const getMaterialQuantities = async (materialMap) => {
    // Get the base required quantity of each material
    for (const id in materialMap) {

      const compositions = await findCompositionsByParent(id);
      if (compositions.length) materialMap[id].children = {};

      // For each material that can be used to compose the current one, find its quantities, and its childrens quantities
      for (const composition of await findCompositionsByParent(id)) {
        const subMap = await getMaterialQuantities({
          [composition.material_id]: {
            required: composition.qty,
            available: await getMaterial(composition.material_id).then(material => material.qty),
          }
        });


        materialMap[id].children[composition.material_id] = subMap[composition.material_id];
      }
    }

    return materialMap;
  };

  /**
   * Deletes a given material
   * @param {int} id 
   */
  const deleteMaterial = async (id) => {
    await del(id);
  };


  return {
    getMaterial,
    getMaterialQuantities,
    createMaterial,
    getTotalMaterialPower,
    getMaterialParents,
    updateMaterial,
    deleteMaterial
  };
};

module.exports = MaterialService;
