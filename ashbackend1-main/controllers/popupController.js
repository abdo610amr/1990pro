import { readDocument, writeDocument } from "../lib/jsonStore.js";
import { saveUploadedFile } from "../lib/fileStorage.js";

const DEFAULT_POPUP = {
  enabled: false,
  title: "",
  description: "",
  image: "",
  buttonText: "",
  buttonUrl: "",
  showOnce: true,
  showEveryVisit: false,
};

function parseBool(value, fallback) {
  if (value === undefined || value === null) return fallback;
  if (typeof value === "boolean") return value;
  return String(value).toLowerCase() === "true";
}

export const getPopup = async (_req, res) => {
  try {
    const popup = await readDocument("popup", DEFAULT_POPUP);
    res.json(popup);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch popup settings" });
  }
};

export const updatePopup = async (req, res) => {
  try {
    const current = await readDocument("popup", DEFAULT_POPUP);
    const {
      enabled,
      title,
      description,
      image,
      buttonText,
      buttonUrl,
      showOnce,
      showEveryVisit,
    } = req.body;

    let imageUrl = image ?? current.image ?? "";

    if (req.file) {
      imageUrl = await saveUploadedFile(
        req.file.buffer,
        "popup",
        req.file.originalname
      );
    }

    const updated = {
      enabled: parseBool(enabled, current.enabled),
      title: title !== undefined ? String(title).trim() : current.title,
      description:
        description !== undefined
          ? String(description).trim()
          : current.description,
      image: imageUrl,
      buttonText:
        buttonText !== undefined ? String(buttonText).trim() : current.buttonText,
      buttonUrl:
        buttonUrl !== undefined ? String(buttonUrl).trim() : current.buttonUrl,
      showOnce: parseBool(showOnce, current.showOnce),
      showEveryVisit: parseBool(showEveryVisit, current.showEveryVisit),
    };

    await writeDocument("popup", updated);
    res.json(updated);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to update popup settings" });
  }
};
