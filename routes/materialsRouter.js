const router = require("express").Router();

const materialService = require("../services/materialService.js")();
const weaponService = require("../services/weaponService.js")();

router.get("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) {
      res.status(400).json({ err: "Invalid or missing URL field : id" });
      return;
    }

    const material = await materialService.getMaterial(id);

    if (!material || !Object.keys(material).length) {
      res.status(404).json("Material does not exist");
      return;
    }

    res.status(200).json(material);
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
});

router.post("/create", async (req, res) => {
  try {
    // Extract and verify fields
    const [power, qty] = [req.body.power, req.body.qty];
    if (!qty || !power || typeof qty !== "number" || typeof power != "number") {
      res.status(400).json({ err: "Invalid or missing request fields, must be of format { qty:int, power: int}" });
      return;
    }

    await materialService.createMaterial(power, qty);

    res.status(200).json("OK");
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) {
      res.status(400).json({ err: "Invalid or missing URL field : id" });
      return;
    }

    // Check to see if material exists before deleting it
    const material = await materialService.getMaterial(id);
    if (!material || !Object.keys(material).length) {
      res.status(404).json("Material does not exist");
      return;
    }

    // First, "delete" the material
    await materialService.deleteMaterial(req.params.id);

    // Find all affected material, which includes any higher up in a material composition chain involving this material
    const affectedMaterials = await materialService.getMaterialParents(id).then(materials => materials.concat(id));

    // Use the affected materials to find all affected weapons
    const affectedWeapons = await weaponService.getWeaponsAffectedByMaterials(affectedMaterials);

    // For each affected weapon, recalculate it's power
    for (const affectedWeapon of affectedWeapons) {
      await weaponService.breakWeapon(affectedWeapon);
    }

    res.status(200).json("OK");
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
});


router.get("/power_level/:id", async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) {
      res.status(400).json({ err: "Invalid or missing URL field : id" });
      return;
    }

    // Check to see if material exists
    const material = await materialService.getMaterial(id);
    if (!material || !Object.keys(material).length) {
      res.status(404).json("Material does not exist");
      return;
    }

    res.status(200).json(await materialService.getTotalMaterialPower(req.params.id));
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
});

router.put("/update_power", async (req, res) => {
  try {
    // Extract and verify params
    const [id, power] = [req.body.id, req.body.power];
    if (!id || !power || typeof id !== "number" || typeof power != "number") {
      res.status(400).json({ err: "Invalid or missing request fields, must be of format { id:int, power: int}" });
      return;
    }

    // Check to see if material exists before deleting it
    const material = await materialService.getMaterial(id);

    if (!material || !Object.keys(material).length) {
      res.status(404).json("Material does not exist");
      return;
    }

    // Update the material
    await materialService.updateMaterial(id, power);

    // Find all affected material, which includes any higher up in a material composition chain involving this material
    const affectedMaterials = await materialService.getMaterialParents(id).then(materials => materials.concat(id));

    // Use the affected materials to find all affected weapons
    const affectedWeapons = await weaponService.getWeaponsAffectedByMaterials(affectedMaterials);

    // For each affected weapon, recalculate it's power
    for (const affectedWeapon of affectedWeapons) {
      await weaponService.updateWeaponPowerLevel(affectedWeapon);
    }

    res.status(200).json("OK");
  } catch (err) {
    res.status(500).json({ err: err.message });
  }

});


module.exports = router;
