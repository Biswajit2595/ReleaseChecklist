const prisma = require("../config/prisma");
const getStatus = require("../utils/status");

const DEFAULT_STEPS = {
  "Code Freeze": false,
  "QA Signoff": false,
  "Smoke Test": false,
  "DB Backup": false,
  "Staging Deploy": false,
  "Production Deploy": false,
  "Post Release Check": false
};

exports.getAllReleases = async (_, res) => {
  try {
    const releases = await prisma.release.findMany({
      orderBy: { createdAt: "desc" }
    });

    const data = releases.map((item) => ({
      ...item,
      status: getStatus(item.stepsCompleted)
    }));

    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createRelease = async (req, res) => {
  try {
    const { name, releaseDate, additionalInfo } = req.body;

    if (!name || !releaseDate) {
      return res.status(400).json({
        message: "name and releaseDate required"
      });
    }

    const release = await prisma.release.create({
      data: {
        name,
        releaseDate: new Date(releaseDate),
        additionalInfo: additionalInfo || "",
        stepsCompleted: DEFAULT_STEPS
      }
    });

    res.status(201).json(release);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.toggleStep = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { stepName } = req.body;

    const release = await prisma.release.findUnique({
      where: { id }
    });

    if (!release) {
      return res.status(404).json({
        message: "Release not found"
      });
    }

    const updatedSteps = {
      ...release.stepsCompleted,
      [stepName]: !release.stepsCompleted[stepName]
    };

    const updated = await prisma.release.update({
      where: { id },
      data: { stepsCompleted: updatedSteps }
    });

    res.json({
      ...updated,
      status: getStatus(updatedSteps)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateInfo = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { additionalInfo } = req.body;

    const updated = await prisma.release.update({
      where: { id },
      data: { additionalInfo }
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteRelease = async (req, res) => {
  try {
    const id = Number(req.params.id);

    await prisma.release.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: "Deleted successfully"
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};