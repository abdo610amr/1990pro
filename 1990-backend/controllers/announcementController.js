import { readDocument, writeDocument } from "../lib/jsonStore.js";

const DEFAULT_ANNOUNCEMENT = {
  enabled: false,
  text: "",
  link: "",
  backgroundColor: "#1a1a2e",
  textColor: "#ffffff",
};

export const getAnnouncement = async (_req, res) => {
  try {
    const announcement = await readDocument("announcement", DEFAULT_ANNOUNCEMENT);
    res.json(announcement);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch announcement settings" });
  }
};

export const updateAnnouncement = async (req, res) => {
  try {
    const current = await readDocument("announcement", DEFAULT_ANNOUNCEMENT);
    const { enabled, text, link, backgroundColor, textColor } = req.body;

    const updated = {
      enabled: enabled !== undefined ? Boolean(enabled) : current.enabled,
      text: text !== undefined ? String(text).trim() : current.text,
      link: link !== undefined ? String(link).trim() : current.link,
      backgroundColor:
        backgroundColor !== undefined
          ? String(backgroundColor).trim()
          : current.backgroundColor,
      textColor:
        textColor !== undefined
          ? String(textColor).trim()
          : current.textColor,
    };

    await writeDocument("announcement", updated);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Failed to update announcement settings" });
  }
};
