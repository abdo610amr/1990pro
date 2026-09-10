"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Tags, Plus, Edit, Shield, CheckCircle2, XCircle, Percent, Barcode, Phone, Mail } from "lucide-react";
import { posApi } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import type { PosBrand } from "@/types/pos";
import { ErpPageHeader } from "@/components/erp/page-header";
import { ErpToolbar } from "@/components/erp/toolbar";
import { ErpTable, ErpTd, ErpTh } from "@/components/erp/data-table";
import { StatusBadge } from "@/components/erp/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export default function AdminBrandsPage() {
  const brandsQuery = useQuery({
    queryKey: ["admin-brands-all"],
    queryFn: () => posApi.brands({ all: true }),
  });

  const [query, setQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingBrand, setEditingBrand] = useState<PosBrand | null>(null);

  const [name, setName] = useState("");
  const [barcodePrefix, setBarcodePrefix] = useState("");
  const [commissionPercentage, setCommissionPercentage] = useState("0");
  const [description, setDescription] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<"active" | "disabled">("active");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);

  const brands = brandsQuery.data ?? [];

  const filteredBrands = brands.filter((b) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (
      b.name.toLowerCase().includes(q) ||
      b.barcodePrefix?.toLowerCase().includes(q) ||
      b.contactPerson?.toLowerCase().includes(q)
    );
  });

  const resetForm = () => {
    setName("");
    setBarcodePrefix("");
    setCommissionPercentage("0");
    setDescription("");
    setContactPerson("");
    setPhone("");
    setEmail("");
    setAddress("");
    setNotes("");
    setStatus("active");
    setLogoFile(null);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Brand Name is required");
      return;
    }
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append("name", name.trim());
      if (barcodePrefix) fd.append("barcodePrefix", barcodePrefix.trim());
      fd.append("commissionPercentage", String(Number(commissionPercentage) || 0));
      fd.append("description", description.trim());
      fd.append("contactPerson", contactPerson.trim());
      fd.append("phone", phone.trim());
      fd.append("email", email.trim());
      fd.append("address", address.trim());
      fd.append("notes", notes.trim());
      fd.append("status", status);
      if (logoFile) fd.append("logo", logoFile);

      await posApi.createBrand(fd);
      toast.success(`Brand "${name}" created successfully`);
      setShowAddModal(false);
      resetForm();
      await brandsQuery.refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Creation failed");
    } finally {
      setBusy(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBrand) return;
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append("name", name.trim());
      if (barcodePrefix) fd.append("barcodePrefix", barcodePrefix.trim());
      fd.append("commissionPercentage", String(Number(commissionPercentage) || 0));
      fd.append("description", description.trim());
      fd.append("contactPerson", contactPerson.trim());
      fd.append("phone", phone.trim());
      fd.append("email", email.trim());
      fd.append("address", address.trim());
      fd.append("notes", notes.trim());
      fd.append("status", status);
      if (logoFile) fd.append("logo", logoFile);

      await posApi.updateBrand(editingBrand.id, fd);
      toast.success(`Brand "${name}" updated successfully`);
      setEditingBrand(null);
      resetForm();
      await brandsQuery.refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Update failed");
    } finally {
      setBusy(false);
    }
  };

  const handleToggleStatus = async (brand: PosBrand) => {
    const nextStatus = brand.status === "disabled" ? "active" : "disabled";
    try {
      await posApi.updateBrandStatus(brand.id, nextStatus);
      toast.success(`Brand status set to ${nextStatus}`);
      await brandsQuery.refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Status update failed");
    }
  };

  const startEdit = (b: PosBrand) => {
    setEditingBrand(b);
    setName(b.name || "");
    setBarcodePrefix(b.barcodePrefix || "");
    setCommissionPercentage(String(b.commissionPercentage ?? 0));
    setDescription(b.description || "");
    setContactPerson(b.contactPerson || "");
    setPhone(b.phone || "");
    setEmail(b.email || "");
    setAddress(b.address || "");
    setNotes(b.notes || "");
    setStatus(b.status === "disabled" ? "disabled" : "active");
    setLogoFile(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <ErpPageHeader
          eyebrow="Supplier & Brand Entities"
          title="Brand Management"
          description="Manage supplier brand entities, barcode prefixes, commission rates, and contact details."
        />
        <Button onClick={() => { resetForm(); setShowAddModal(true); }} className="gap-2 self-start sm:self-auto">
          <Plus className="h-4 w-4" /> Add New Brand
        </Button>
      </div>

      <ErpToolbar
        search={query}
        onSearchChange={setQuery}
        searchPlaceholder="Search brand name, prefix, contact person…"
        onRefresh={() => void brandsQuery.refetch()}
        refreshing={brandsQuery.isFetching}
      />

      <ErpTable>
        <thead>
          <tr>
            <ErpTh>Brand</ErpTh>
            <ErpTh>Prefix</ErpTh>
            <ErpTh>Commission %</ErpTh>
            <ErpTh>Contact Person</ErpTh>
            <ErpTh>Products</ErpTh>
            <ErpTh>Status</ErpTh>
            <ErpTh className="text-right">Actions</ErpTh>
          </tr>
        </thead>
        <tbody>
          {filteredBrands.map((b) => (
            <tr key={b.id} className="hover:bg-secondary/40">
              <ErpTd className="font-medium">
                <div className="flex items-center gap-3">
                  <img src={b.logo} alt={b.name} className="h-10 w-10 object-contain rounded-lg border p-1 bg-white" />
                  <div>
                    <p className="font-semibold text-sm">{b.name}</p>
                    <p className="text-[11px] text-muted-foreground">/{b.slug}</p>
                  </div>
                </div>
              </ErpTd>
              <ErpTd className="font-mono font-bold text-xs text-primary">
                {b.barcodePrefix}
              </ErpTd>
              <ErpTd className="font-mono font-semibold">
                {b.commissionPercentage}%
              </ErpTd>
              <ErpTd>
                <p className="text-xs font-medium">{b.contactPerson || "—"}</p>
                <p className="text-[10px] text-muted-foreground">{b.phone || b.email || ""}</p>
              </ErpTd>
              <ErpTd>{b.productCount ?? 0} products</ErpTd>
              <ErpTd>
                <StatusBadge value={b.status || "active"} kind="brand" />
              </ErpTd>
              <ErpTd>
                <div className="flex justify-end gap-1">
                  <Button size="sm" variant="outline" onClick={() => startEdit(b)}>
                    <Edit className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    size="sm"
                    variant={b.status === "disabled" ? "default" : "outline"}
                    onClick={() => void handleToggleStatus(b)}
                  >
                    {b.status === "disabled" ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> : <XCircle className="h-3.5 w-3.5 text-destructive" />}
                  </Button>
                </div>
              </ErpTd>
            </tr>
          ))}
        </tbody>
      </ErpTable>

      {/* Add / Edit Brand Modal */}
      {(showAddModal || editingBrand) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/50">
          <Card className="w-full max-w-xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <CardContent className="p-6 space-y-4">
              <h2 className="font-heading text-2xl">{editingBrand ? "Edit Brand Entity" : "Create New Brand Entity"}</h2>
              <form onSubmit={editingBrand ? handleUpdate : handleCreate} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold">Brand Name *</label>
                    <Input value={name} onChange={(e) => setName(e.target.value)} required placeholder="Nike" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold">Barcode Prefix</label>
                    <Input value={barcodePrefix} onChange={(e) => setBarcodePrefix(e.target.value)} placeholder="NK" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold">Commission Percentage (%)</label>
                    <Input type="number" step="0.1" value={commissionPercentage} onChange={(e) => setCommissionPercentage(e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold">Status</label>
                    <select
                      className="w-full h-10 rounded-xl border bg-background px-3 text-sm"
                      value={status}
                      onChange={(e) => setStatus(e.target.value as "active" | "disabled")}
                    >
                      <option value="active">Active</option>
                      <option value="disabled">Disabled</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold">Brand Logo</label>
                  <Input type="file" accept="image/*" onChange={(e) => setLogoFile(e.target.files?.[0] ?? null)} />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold">Contact Person</label>
                    <Input value={contactPerson} onChange={(e) => setContactPerson(e.target.value)} placeholder="John Doe" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold">Phone</label>
                    <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 234 567 890" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold">Email</label>
                    <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="contact@brand.com" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold">Address</label>
                    <Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="HQ Address" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold">Description</label>
                  <textarea
                    className="w-full min-h-[80px] p-3 rounded-xl border bg-background text-sm"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Brief description of the supplier brand..."
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button type="button" variant="outline" onClick={() => { setShowAddModal(false); setEditingBrand(null); }}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={busy}>
                    {busy ? "Saving…" : editingBrand ? "Update Brand" : "Create Brand"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
