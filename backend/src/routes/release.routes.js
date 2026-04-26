const router = require("express").Router();

const {
  getAllReleases,
  createRelease,
  toggleStep,
  updateInfo,
  deleteRelease
} = require("../controllers/release.controller");

router.get("/", getAllReleases);
router.post("/", createRelease);
router.patch("/:id/steps", toggleStep);
router.patch("/:id/info", updateInfo);
router.delete("/:id", deleteRelease);

module.exports = router;