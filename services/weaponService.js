/**
 * A mapping of required and available materials, where each key is a material ID
 * @typedef {Object} MaterialMap
 * @property {int} required
 * @property {int} available
 * @property {MaterialMap} [children]
 */

const { find, update, destroy } = require('../models/weapon');
const weaponComposition = require('../models/weapon_composition');
const findMaterial = require('../models/material').find;

const materialService = require("../services/materialService.js")();

const WeaponService = () => {

  /**
   * Retrieves a weapon, by its name
   * @param {string} name 
   * @returns {Weapon}
   */
  const getWeapon = async (name) => {
    return find(name);
  };

  /**
   * Calculates the total power of the weapon, based on it's component materials
   * @returns {int} power : Calculated power level of the weapon
   */
  const calculateWeaponPowerLevel = async (name) => {
    // Find the composition for this weapon
    const composition = await weaponComposition.findByWeapon(name);

    let power = 0;

    // For each composing material, sum the total power, multiplied by the recipes quantity
    for (const composingMaterial of composition) {
      const material = await findMaterial(composingMaterial.material_id);
      power += await materialService.getTotalMaterialPower(material.id) * composingMaterial.qty;
    }

    return power;
  };

  /**
   * Recaulculates the total weapon power, based on the current material values, and sets it
   * @param {string} name 
   */
  const updateWeaponPowerLevel = async (name) => {
    await update(
      name,
      {
        power_level: await calculateWeaponPowerLevel(name)
      }
    );
  };

  /**
   * Destroys a weapon
   * @param {string} name 
   */
  const breakWeapon = async (name) => {
    await destroy(name);
  };

  /**
   * Returns all weapon compositions impacted or affected by given materials
   * @param {int} materialID 
   * @returns {Array<int>} affectedWeaponsIDs
   */
  const getWeaponsAffectedByMaterials = async (materialIDs) => {
    const affectedWeapons = [];

    for (const materialID of materialIDs) {
      const materialAffectedWeapons = await weaponComposition.findByMaterial(materialID);
      for (const affectedWeapon of materialAffectedWeapons) {
        if (!affectedWeapons.includes(affectedWeapon.weapon)) affectedWeapons.push(affectedWeapon.weapon);
      }
    }

    return affectedWeapons;
  };

  /**
   * Determines the mximum number of a given weapon that can be constructed, using existing material quantities
   * Materials can be constructed from other materials as well
   * @param {string} name 
   * @returns {int}
   */
  const getBuildableWeaponQuantity = async (name) => {

    // Find the materials that compose this weapon
    // Get the available quantities of these materials from the database
    let materials = {};
    for (const composition of await weaponComposition.findByWeapon(name)) {
      materials[composition.material_id] = {
        required: composition.qty,
        available: await materialService.getMaterial(composition.material_id).then(material => material.qty),
      };
    }

    // Find the available quantities of any materials composing the required materials, or materials composing those materials, etc
    materials = {
      [name]: {
        available: 0,
        children: await materialService.getMaterialQuantities(materials)
      }
    };

    return getComposableMaterialQty(materials)[name].buildable;
  };

  /**
   * Determines the composable material quantity for given materials, inclding using children and grandchildren to compose them
   * @param {MaterialMap} materialMap 
   * @returns {materialMap}
   */
  const getComposableMaterialQty = (materialMap) => {
    for (const id in materialMap) {
      materialMap[id].buildable = materialMap[id].available;

      if (!("children" in materialMap[id])) continue;

      // For all required children, see if we have enough of each quantity to build it
      let minChildMultiplier = Infinity;

      for (const child in materialMap[id].children) {
        materialMap[id].children[child] = getComposableMaterialQty({
          [child]: materialMap[id].children[child]
        })[child];

        const childMultiplier = Math.floor(materialMap[id].children[child].buildable / materialMap[id].children[child].required);
        if (childMultiplier < minChildMultiplier) minChildMultiplier = childMultiplier;
      }

      // Log the children used to compose parent weapons/materials
      let childrenComposed = {};
      for (const child in materialMap[id].children) {
        childrenComposed[child] = minChildMultiplier * materialMap[id].children[child].required;
      }
      console.log(`Used following composition to compose ${minChildMultiplier} of ${id} : ${JSON.stringify(childrenComposed)}`);


      materialMap[id].buildable += minChildMultiplier;
    }

    return materialMap;
  };

  return {
    getWeapon,
    breakWeapon,
    getWeaponsAffectedByMaterials,
    calculateWeaponPowerLevel,
    updateWeaponPowerLevel,
    getBuildableWeaponQuantity
  };
};

module.exports = WeaponService;
