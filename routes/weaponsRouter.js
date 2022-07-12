const router = require("express").Router();
const weaponService = require("../services/weaponService.js")();

router.get("/buildable_quantity/:weapon", async (req, res) => {
  try {
    const name = req.params.weapon;

    res.status(200).json(await weaponService.getBuildableWeaponQuantity(name));
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
});


module.exports = router;
