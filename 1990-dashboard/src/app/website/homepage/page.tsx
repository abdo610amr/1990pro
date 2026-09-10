"use client";

import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import {
  ImagePlus,
  Trash2,
  ArrowUp,
  ArrowDown,
  ExternalLink,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Upload,
  RefreshCw,
  Globe,
} from "lucide-react";
import { posApi, ApiError } from "@/lib/api";
import { resolveAssetUrl } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

interface CarouselItem {
  id: string;
  image: string;
  title: string;
  description: string;
  link: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export default function HomepageManagementPage() {
  const [items, setItems] = useState<CarouselItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const data = await posApi.getHomepageCarousel();
      setItems(data.sort((a, b) => a.sort_order - b.sort_order));
    } catch {
      showToast("error", "Failed to load carousel items.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const activeCount = items.filter((i) => i.is_active).length;

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this carousel item?")) return;
    try {
      await posApi.deleteHomepageCarouselItem(id);
      showToast("success", "Carousel item deleted.");
      fetchItems();
    } catch {
      showToast("error", "Failed to delete item.");
    }
  };

  const handleToggleStatus = async (id: string, currentActive: boolean) => {
    const wantActive = !currentActive;
    if (wantActive && activeCount >= 4) {
      showToast("error", "Maximum 4 homepage images allowed.");
      return;
    }
    try {
      await posApi.toggleHomepageCarouselStatus(id, wantActive);
      showToast("success", wantActive ? "Item activated." : "Item deactivated.");
      fetchItems();
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "Failed to update status.";
      showToast("error", msg);
    }
  };

  const handleMoveUp = async (item: CarouselItem) => {
    if (item.sort_order <= 1) return;
    try {
      await posApi.reorderHomepageCarouselItem(item.id, item.sort_order - 1);
      fetchItems();
    } catch {
      showToast("error", "Failed to reorder.");
    }
  };

  const handleMoveDown = async (item: CarouselItem) => {
    if (item.sort_order >= items.length) return;
    try {
      await posApi.reorderHomepageCarouselItem(item.id, item.sort_order + 1);
      fetchItems();
    } catch {
      showToast("error", "Failed to reorder.");
    }
  };

  const handleItemUpdated = () => {
    fetchItems();
    showToast("success", "Carousel item updated.");
  };

  const handleItemCreated = () => {
    fetchItems();
    setShowAddForm(false);
    showToast("success", "Carousel item added.");
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className={`fixed top-20 right-6 z-50 flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium shadow-lg ${
            toast.type === "success"
              ? "bg-emerald-600 text-white"
              : "bg-red-600 text-white"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle2 className="h-4 w-4" />
          ) : (
            <XCircle className="h-4 w-4" />
          )}
          {toast.message}
        </motion.div>
      )}

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-muted-foreground" />
            <h1 className="text-2xl font-bold tracking-tight">Homepage Management</h1>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage the Hero background images displayed behind the 1990 typography on the Store homepage.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge
            variant={activeCount >= 4 ? "destructive" : "outline"}
            className="text-xs"
          >
            {activeCount}/4 Active
          </Badge>
          <Button size="sm" onClick={() => setShowAddForm(!showAddForm)}>
            <ImagePlus className="mr-2 h-4 w-4" />
            Add Image
          </Button>
        </div>
      </div>

      {/* Max limit warning */}
      {activeCount >= 4 && (
        <div className="flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-700 dark:text-amber-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          Maximum 4 homepage images allowed. Deactivate an existing image to add a new active one.
        </div>
      )}

      {/* Add Form */}
      {showAddForm && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
        >
          <Card className="p-6">
            <h3 className="mb-4 font-semibold">Add New Hero Background Image</h3>
            <AddCarouselForm
              onCreated={handleItemCreated}
              onCancel={() => setShowAddForm(false)}
              onError={(msg) => showToast("error", msg)}
              activeCount={activeCount}
            />
          </Card>
        </motion.div>
      )}

      {/* Items Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20 text-muted-foreground">
          <RefreshCw className="mr-2 h-5 w-5 animate-spin" />
          Loading hero images…
        </div>
      ) : items.length === 0 ? (
        <Card className="flex flex-col items-center justify-center py-16 text-center">
          <ImagePlus className="mb-4 h-12 w-12 text-muted-foreground/40" />
          <p className="text-lg font-medium">No Hero background images yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Add up to 4 background images for the Hero section.
          </p>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {items.map((item, idx) => (
            <CarouselItemCard
              key={item.id}
              item={item}
              index={idx}
              total={items.length}
              onDelete={handleDelete}
              onToggleStatus={handleToggleStatus}
              onMoveUp={handleMoveUp}
              onMoveDown={handleMoveDown}
              onUpdated={handleItemUpdated}
              onError={(msg) => showToast("error", msg)}
              activeCount={activeCount}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════
   Add Form
   ═══════════════════════════════════════════ */

function AddCarouselForm({
  onCreated,
  onCancel,
  onError,
  activeCount,
}: {
  onCreated: () => void;
  onCancel: () => void;
  onError: (msg: string) => void;
  activeCount: number;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [link, setLink] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      setFile(f);
      setPreview(URL.createObjectURL(f));
      setImageUrl("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file && !imageUrl) {
      onError("Please upload an image or provide an image URL.");
      return;
    }
    if (isActive && activeCount >= 4) {
      onError("Maximum 4 homepage images allowed.");
      return;
    }
    setSaving(true);
    try {
      const form = new FormData();
      if (file) form.append("imageFile", file);
      else form.append("image", imageUrl);
      form.append("title", title);
      form.append("description", description);
      form.append("link", link);
      form.append("is_active", String(isActive));
      await posApi.createHomepageCarouselItem(form);
      onCreated();
    } catch (err) {
      onError(err instanceof ApiError ? err.message : "Failed to create item.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Upload Image</Label>
          <div
            onClick={() => fileRef.current?.click()}
            className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border p-6 transition-colors hover:border-foreground/30"
          >
            {preview ? (
              <img src={preview} alt="Preview" className="max-h-40 rounded object-contain" />
            ) : (
              <>
                <Upload className="mb-2 h-8 w-8 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Click to upload</span>
              </>
            )}
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>
        <div className="space-y-3">
          <div className="space-y-1">
            <Label>Or Image URL</Label>
            <Input
              placeholder="https://..."
              value={imageUrl}
              onChange={(e) => {
                setImageUrl(e.target.value);
                if (e.target.value) {
                  setFile(null);
                  setPreview(null);
                }
              }}
            />
          </div>
          <div className="space-y-1">
            <Label>Title (optional)</Label>
            <Input
              placeholder="1990 FLAGSHIP"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label>Description (optional)</Label>
            <Input
              placeholder="Luxury made personal."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label>Link (optional)</Label>
            <Input
              placeholder="/shop"
              value={link}
              onChange={(e) => setLink(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 pt-1">
            <Switch
              checked={isActive}
              onCheckedChange={setIsActive}
              id="add-active"
            />
            <Label htmlFor="add-active" className="text-sm">Active</Label>
          </div>
        </div>
      </div>
      <div className="flex gap-2 pt-2">
        <Button type="submit" size="sm" disabled={saving}>
          {saving ? "Saving…" : "Add Image"}
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

/* ═══════════════════════════════════════════
   Item Card
   ═══════════════════════════════════════════ */

function CarouselItemCard({
  item,
  index,
  total,
  onDelete,
  onToggleStatus,
  onMoveUp,
  onMoveDown,
  onUpdated,
  onError,
  activeCount,
}: {
  item: CarouselItem;
  index: number;
  total: number;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string, currentActive: boolean) => void;
  onMoveUp: (item: CarouselItem) => void;
  onMoveDown: (item: CarouselItem) => void;
  onUpdated: () => void;
  onError: (msg: string) => void;
  activeCount: number;
}) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(item.title);
  const [description, setDescription] = useState(item.description);
  const [link, setLink] = useState(item.link);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      setFile(f);
      setPreview(URL.createObjectURL(f));
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const form = new FormData();
      if (file) form.append("imageFile", file);
      form.append("title", title);
      form.append("description", description);
      form.append("link", link);
      await posApi.updateHomepageCarouselItem(item.id, form);
      setEditing(false);
      setFile(null);
      setPreview(null);
      onUpdated();
    } catch (err) {
      onError(err instanceof ApiError ? err.message : "Failed to update item.");
    } finally {
      setSaving(false);
    }
  };

  const imgSrc = preview || resolveAssetUrl(item.image);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Card className="overflow-hidden">
        {/* Image Preview */}
        <div className="relative aspect-[16/9] bg-muted">
          <img
            src={imgSrc}
            alt={item.title || `Slot ${item.sort_order}`}
            className="h-full w-full object-cover"
          />
          <div className="absolute left-3 top-3 flex items-center gap-2">
            <Badge className="bg-black/60 text-white text-[10px] border-0">
              Slot {item.sort_order}
            </Badge>
            <Badge
              variant={item.is_active ? "default" : "secondary"}
              className={`text-[10px] border-0 ${
                item.is_active
                  ? "bg-emerald-600 text-white"
                  : "bg-zinc-600 text-white"
              }`}
            >
              {item.is_active ? "Active" : "Inactive"}
            </Badge>
          </div>

          {/* Replace image button */}
          {editing && (
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="absolute inset-0 flex items-center justify-center bg-black/50 text-white opacity-0 transition-opacity hover:opacity-100"
            >
              <Upload className="mr-2 h-5 w-5" />
              Replace Image
            </button>
          )}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>

        {/* Details */}
        <div className="space-y-3 p-4">
          {editing ? (
            <>
              <div className="space-y-1">
                <Label className="text-xs">Title</Label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Optional title"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Description</Label>
                <Input
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Optional description"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Link</Label>
                <Input
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  placeholder="/shop"
                />
              </div>
              <div className="flex gap-2 pt-1">
                <Button size="sm" onClick={handleSave} disabled={saving}>
                  {saving ? "Saving…" : "Save"}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setEditing(false);
                    setTitle(item.title);
                    setDescription(item.description);
                    setLink(item.link);
                    setFile(null);
                    setPreview(null);
                  }}
                >
                  Cancel
                </Button>
              </div>
            </>
          ) : (
            <>
              {item.title && (
                <p className="text-sm font-semibold">{item.title}</p>
              )}
              {item.description && (
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {item.description}
                </p>
              )}
              {item.link && (
                <p className="flex items-center gap-1 text-xs text-blue-500">
                  <ExternalLink className="h-3 w-3" />
                  {item.link}
                </p>
              )}
              {!item.title && !item.description && !item.link && (
                <p className="text-xs text-muted-foreground italic">
                  No title, description, or link set.
                </p>
              )}
            </>
          )}

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-2 border-t border-border pt-3">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setEditing(!editing)}
              className="text-xs"
            >
              {editing ? "Cancel Edit" : "Edit"}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onToggleStatus(item.id, item.is_active)}
              className="text-xs"
              disabled={!item.is_active && activeCount >= 4}
              title={
                !item.is_active && activeCount >= 4
                  ? "Maximum 4 homepage images allowed."
                  : undefined
              }
            >
              {item.is_active ? "Deactivate" : "Activate"}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onMoveUp(item)}
              disabled={index === 0}
              className="text-xs px-2"
            >
              <ArrowUp className="h-3.5 w-3.5" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onMoveDown(item)}
              disabled={index === total - 1}
              className="text-xs px-2"
            >
              <ArrowDown className="h-3.5 w-3.5" />
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => onDelete(item.id)}
              className="ml-auto text-xs"
            >
              <Trash2 className="mr-1 h-3.5 w-3.5" />
              Delete
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
