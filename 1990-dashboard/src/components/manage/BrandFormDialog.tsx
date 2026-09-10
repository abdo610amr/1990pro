"use client";

import { useEffect, useState } from "react";
import { UploadCloud } from "lucide-react";
import type { PosBrand } from "@/types/pos";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export interface BrandFormValues {
  name: string;
  slug: string;
  story: string;
  about: string;
  featured: boolean;
  active: boolean;
  logo?: File;
}

export function buildBrandFormData(form: BrandFormValues): FormData {
  const body = new FormData();
  body.append("name", form.name);
  if (form.slug) body.append("slug", form.slug);
  body.append("story", form.story);
  body.append("about", form.about);
  body.append("featured", String(form.featured));
  body.append("active", String(form.active));
  if (form.logo) body.append("logo", form.logo);
  return body;
}

interface BrandFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  brand: PosBrand | null;
  onSubmit: (form: BrandFormValues) => Promise<void>;
  submitting: boolean;
}

export function BrandFormDialog({
  open,
  onOpenChange,
  brand,
  onSubmit,
  submitting,
}: BrandFormDialogProps) {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [story, setStory] = useState("");
  const [about, setAbout] = useState("");
  const [featured, setFeatured] = useState(false);
  const [active, setActive] = useState(true);
  const [logo, setLogo] = useState<File | undefined>();

  useEffect(() => {
    if (brand) {
      setName(brand.name);
      setSlug(brand.slug);
      setStory(brand.story ?? "");
      setAbout(brand.about ?? "");
      setFeatured(brand.featured === true);
      setActive(brand.active !== false);
    } else {
      setName("");
      setSlug("");
      setStory("");
      setAbout("");
      setFeatured(false);
      setActive(true);
    }
    setLogo(undefined);
  }, [brand, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({ name, slug, story, about, featured, active, logo });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{brand ? "Edit Brand" : "Add Brand"}</DialogTitle>
          <DialogDescription>
            Manage brand name, slug, story, and optional logo.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <DialogBody className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="brand-name">Name</Label>
              <Input
                id="brand-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="brand-slug">Slug</Label>
              <Input
                id="brand-slug"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="auto from name if empty"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="brand-story">Story</Label>
              <Textarea
                id="brand-story"
                value={story}
                onChange={(e) => setStory(e.target.value)}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="brand-about">About</Label>
              <Textarea
                id="brand-about"
                value={about}
                onChange={(e) => setAbout(e.target.value)}
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="brand-logo">Logo</Label>
              <label
                htmlFor="brand-logo"
                className="flex min-h-24 cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-primary/25 bg-secondary/25 p-4 text-center"
              >
                <UploadCloud className="mb-2 h-5 w-5 text-primary" />
                <span className="text-xs text-muted-foreground">
                  {logo?.name ??
                    (brand?.logo ? "Current logo retained" : "Optional logo")}
                </span>
                <Input
                  id="brand-logo"
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={(e) => setLogo(e.target.files?.[0])}
                />
              </label>
            </div>
            <div className="flex items-center justify-between rounded-xl border px-3 py-3">
              <Label htmlFor="brand-featured">Featured</Label>
              <Switch
                id="brand-featured"
                checked={featured}
                onCheckedChange={setFeatured}
              />
            </div>
            <div className="flex items-center justify-between rounded-xl border px-3 py-3">
              <Label htmlFor="brand-active">Active</Label>
              <Switch
                id="brand-active"
                checked={active}
                onCheckedChange={setActive}
              />
            </div>
          </DialogBody>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Saving…" : brand ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
