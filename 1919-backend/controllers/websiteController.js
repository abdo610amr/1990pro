import { readCollection, writeCollection, getNextId } from "../lib/jsonStore.js";
import { saveUploadedFile } from "../lib/fileStorage.js";

const COLLECTION = "homepageCarousel";
const MAX_ACTIVE = 4;

/**
 * GET  /  — Public: returns carousel items.
 *   ?active=true  → only active items, sorted by sort_order
 *   otherwise     → all items sorted by sort_order
 */
export async function getCarouselItems(req, res) {
  try {
    const items = await readCollection(COLLECTION);
    const sorted = [...items].sort((a, b) => a.sort_order - b.sort_order);

    if (req.query.active === "true") {
      return res.json(sorted.filter((i) => i.is_active));
    }
    res.json(sorted);
  } catch (err) {
    console.error("getCarouselItems error:", err);
    res.status(500).json({ message: "Failed to load homepage carousel." });
  }
}

/**
 * POST /  — Admin only: create a new carousel item.
 */
export async function createCarouselItem(req, res) {
  try {
    const items = await readCollection(COLLECTION);
    const { title, description, link, is_active } = req.body;

    const wantActive =
      is_active === true || is_active === "true" || is_active === "1";

    // Enforce max active limit
    if (wantActive) {
      const activeCount = items.filter((i) => i.is_active).length;
      if (activeCount >= MAX_ACTIVE) {
        return res
          .status(400)
          .json({ message: "Maximum 4 homepage images allowed." });
      }
    }

    let image = req.body.image || "";
    if (req.file) {
      image = await saveUploadedFile(
        req.file.buffer,
        "carousel",
        req.file.originalname
      );
    }

    const now = new Date().toISOString();
    const newItem = {
      id: String(getNextId(items)),
      image,
      title: title || "",
      description: description || "",
      link: link || "",
      sort_order: items.length + 1,
      is_active: wantActive,
      created_at: now,
      updated_at: now,
    };

    items.push(newItem);
    await writeCollection(COLLECTION, items);

    res.status(201).json(newItem);
  } catch (err) {
    console.error("createCarouselItem error:", err);
    res.status(500).json({ message: "Failed to create carousel item." });
  }
}

/**
 * PUT /:id  — Admin only: update a carousel item (image, title, description, link, is_active).
 */
export async function updateCarouselItem(req, res) {
  try {
    const items = await readCollection(COLLECTION);
    const idx = items.findIndex((i) => String(i.id) === String(req.params.id));
    if (idx === -1) {
      return res.status(404).json({ message: "Carousel item not found." });
    }

    const { title, description, link, is_active } = req.body;

    // If activating, enforce max active limit
    if (is_active !== undefined) {
      const wantActive =
        is_active === true || is_active === "true" || is_active === "1";
      if (wantActive && !items[idx].is_active) {
        const activeCount = items.filter((i) => i.is_active).length;
        if (activeCount >= MAX_ACTIVE) {
          return res
            .status(400)
            .json({ message: "Maximum 4 homepage images allowed." });
        }
      }
      items[idx].is_active = wantActive;
    }

    if (title !== undefined) items[idx].title = title;
    if (description !== undefined) items[idx].description = description;
    if (link !== undefined) items[idx].link = link;

    if (req.file) {
      items[idx].image = await saveUploadedFile(
        req.file.buffer,
        "carousel",
        req.file.originalname
      );
    } else if (req.body.image !== undefined) {
      items[idx].image = req.body.image;
    }

    items[idx].updated_at = new Date().toISOString();
    await writeCollection(COLLECTION, items);

    res.json(items[idx]);
  } catch (err) {
    console.error("updateCarouselItem error:", err);
    res.status(500).json({ message: "Failed to update carousel item." });
  }
}

/**
 * DELETE /:id  — Admin only: remove a carousel item.
 */
export async function deleteCarouselItem(req, res) {
  try {
    let items = await readCollection(COLLECTION);
    const idx = items.findIndex((i) => String(i.id) === String(req.params.id));
    if (idx === -1) {
      return res.status(404).json({ message: "Carousel item not found." });
    }

    items.splice(idx, 1);

    // Re-normalise sort_order
    items
      .sort((a, b) => a.sort_order - b.sort_order)
      .forEach((item, i) => {
        item.sort_order = i + 1;
      });

    await writeCollection(COLLECTION, items);
    res.json({ message: "Carousel item deleted." });
  } catch (err) {
    console.error("deleteCarouselItem error:", err);
    res.status(500).json({ message: "Failed to delete carousel item." });
  }
}

/**
 * PATCH /:id/reorder  — Admin only: set new sort_order.
 *   Body: { sort_order: number }
 */
export async function reorderCarouselItem(req, res) {
  try {
    const items = await readCollection(COLLECTION);
    const idx = items.findIndex((i) => String(i.id) === String(req.params.id));
    if (idx === -1) {
      return res.status(404).json({ message: "Carousel item not found." });
    }

    const newOrder = Number(req.body.sort_order);
    if (!Number.isFinite(newOrder) || newOrder < 1) {
      return res.status(400).json({ message: "Invalid sort_order." });
    }

    // Remove item then re-insert at new position
    const [item] = items.splice(idx, 1);
    const sorted = items.sort((a, b) => a.sort_order - b.sort_order);
    const insertIdx = Math.min(newOrder - 1, sorted.length);
    sorted.splice(insertIdx, 0, item);

    // Re-normalise
    sorted.forEach((it, i) => {
      it.sort_order = i + 1;
      it.updated_at = new Date().toISOString();
    });

    await writeCollection(COLLECTION, sorted);
    res.json(sorted.sort((a, b) => a.sort_order - b.sort_order));
  } catch (err) {
    console.error("reorderCarouselItem error:", err);
    res.status(500).json({ message: "Failed to reorder carousel item." });
  }
}

/**
 * PATCH /:id/status  — Admin only: toggle is_active.
 *   Body: { is_active: boolean }
 */
export async function toggleCarouselStatus(req, res) {
  try {
    const items = await readCollection(COLLECTION);
    const idx = items.findIndex((i) => String(i.id) === String(req.params.id));
    if (idx === -1) {
      return res.status(404).json({ message: "Carousel item not found." });
    }

    const wantActive =
      req.body.is_active === true ||
      req.body.is_active === "true" ||
      req.body.is_active === "1";

    if (wantActive && !items[idx].is_active) {
      const activeCount = items.filter((i) => i.is_active).length;
      if (activeCount >= MAX_ACTIVE) {
        return res
          .status(400)
          .json({ message: "Maximum 4 homepage images allowed." });
      }
    }

    items[idx].is_active = wantActive;
    items[idx].updated_at = new Date().toISOString();
    await writeCollection(COLLECTION, items);

    res.json(items[idx]);
  } catch (err) {
    console.error("toggleCarouselStatus error:", err);
    res.status(500).json({ message: "Failed to toggle carousel status." });
  }
}
