const { nanoid } = require("nanoid");
const URL = require("../models/url");

const handleURLShortening = async (req, res) => {
  const body = req.body;

  if (!body.url) return res.status(400).json({ error: "URL is required" });
  if (!body.url.startsWith('http')) return res.status(400).json({ error: "URL must start with http" });
  const shortID = nanoid(8);
  await URL.create({
    shortId: shortID,
    redirectURL: body.url,
    visitHistory: [],
  });

  const allUrls = await URL.find({});
  return res.render('home', {
    id: shortID,
    urls: allUrls
  });
};

const handleURLRedirection = async (req, res) => {
  const shortId = req.params.shortId;
  if (['login', 'signup'].includes(shortId)) {
    return res.status(404).send('Not found');
  }
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
};

const handleGetAnalytics = async (req, res) => {
  const shortId = req.params.shortId;
  const result = await URL.findOne({ shortId });
  if (!result) return res.status(404).json({ error: "Short URL not found" });

  return res.json({
    totalClicks: result.visitHistory.length,
    analytics: result.visitHistory,
  });
};

module.exports = {
  handleURLShortening,
  handleURLRedirection,
  handleGetAnalytics,
};
