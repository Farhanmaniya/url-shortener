const crypto = require("crypto");
const URL = require("../models/url");

const handleURLShortening = async (req, res) => {
  const { url } = req.body;

  if (!url) return res.status(400).json({ error: "URL is required" });
  if (!url.startsWith("http"))
    return res.status(400).json({ error: "URL must start with http" });

  const shortId = crypto.randomBytes(4).toString("hex");

  const createdBy = req.session.userId || null;

  try {
    await URL.create({
      shortId,
      redirectURL: url,
      visitHistory: [],
      createdBy: createdBy,
    });

    const allUrls = await URL.find({});
    return res.render("home", { urls: allUrls });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const handleURLRedirection = async (req, res) => {
  try {
    const shortId = req.params.shortId;
    const entry = await URL.findOneAndUpdate(
      {
        shortId,
      },
      {
        $push: {
          visitHistory: {
            timestamp: Date.now(),
          },
        },
      },
    );
    if (!entry) {
      return res.status(404).json({ error: "Short URL not found" });
    }
    res.redirect(entry.redirectURL);
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const handleGetAnalytics = async (req, res) => {
  try {
    const shortId = req.params.shortId;
    const result = await URL.findOne({ shortId });
    if (!result) return res.status(404).json({ error: "Short URL not found" });

    return res.json({
      totalClicks: result.visitHistory.length,
      analytics: result.visitHistory,
    });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const handleMyLinks = async (req, res) => {
  try {
    const urls = await URL.find({ createdBy: req.session.userId });
    return res.render("mylinks", { urls: urls });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = {
  handleURLShortening,
  handleURLRedirection,
  handleGetAnalytics,
  handleMyLinks,
};
