"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Users, Plus, Shield, KeyRound, UserCheck, UserX, Target, Percent } from "lucide-react";
import { posApi } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import type { PosUser } from "@/types/pos";
import { ErpPageHeader } from "@/components/erp/page-header";
import { ErpToolbar } from "@/components/erp/toolbar";
import { ErpTable, ErpTd, ErpTh } from "@/components/erp/data-table";
import { StatusBadge } from "@/components/erp/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useAuthStore } from "@/store/auth-store";

export default function AdminUsersPage() {
  const queryClient = useQueryClient();
  const token = useAuthStore((s) => s.token);
  const usersQuery = useQuery({
    queryKey: ["admin-users"],
    queryFn: () => posApi.users(token!),
    enabled: !!token,
  });
  const perfQuery = useQuery({
    queryKey: ["admin-seller-perf"],
    queryFn: posApi.sellerPerformance,
  });

  const [query, setQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUser, setEditingUser] = useState<PosUser | null>(null);
  const [resetPassUser, setResetPassUser] = useState<PosUser | null>(null);

  // Form states
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"seller" | "admin">("seller");
  const [maxDiscount, setMaxDiscount] = useState("10");
  const [monthlyTarget, setMonthlyTarget] = useState("30000");
  const [busy, setBusy] = useState(false);

  const perfMap = new Map((perfQuery.data ?? []).map((p) => [p.seller_id, p]));

  const filteredUsers = (usersQuery.data ?? []).filter((u) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (
      u.full_name?.toLowerCase().includes(q) ||
      u.username?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q)
    );
  });

  const resetForm = () => {
    setFullName("");
    setUsername("");
    setEmail("");
    setPassword("");
    setRole("seller");
    setMaxDiscount("10");
    setMonthlyTarget("30000");
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !username || !password) {
      toast.error("Full Name, Username, and Password are required");
      return;
    }
    setBusy(true);
    try {
      await posApi.createUser(token!, {
        full_name: fullName,
        username,
        email,
        password,
        role,
        max_discount: Number(maxDiscount) || 0,
        monthly_target: Number(monthlyTarget) || 0,
      });
      toast.success("Staff user created successfully");
      setShowAddModal(false);
      resetForm();
      await usersQuery.refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Creation failed");
    } finally {
      setBusy(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setBusy(true);
    try {
      await posApi.updateUser(token!, editingUser.id, {
        full_name: fullName,
        username,
        email,
        role,
        max_discount: Number(maxDiscount) || 0,
        monthly_target: Number(monthlyTarget) || 0,
      });
      toast.success("User updated successfully");
      setEditingUser(null);
      resetForm();
      await usersQuery.refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Update failed");
    } finally {
      setBusy(false);
    }
  };

  const handleToggleStatus = async (user: PosUser) => {
    const nextStatus = user.status === "disabled" ? "active" : "disabled";
    try {
      await posApi.toggleUserStatus(token!, user.id, nextStatus);
      toast.success(`User status changed to ${nextStatus}`);
      await usersQuery.refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Status update failed");
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetPassUser || !password || password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setBusy(true);
    try {
      await posApi.resetUserPassword(token!, resetPassUser.id, password);
      toast.success("Password reset successfully");
      setResetPassUser(null);
      setPassword("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Password reset failed");
    } finally {
      setBusy(false);
    }
  };

  const startEdit = (user: PosUser) => {
    setEditingUser(user);
    setFullName(user.full_name || "");
    setUsername(user.username || "");
    setEmail(user.email || "");
    setRole(user.role === "admin" ? "admin" : "seller");
    setMaxDiscount(String(user.max_discount ?? 0));
    setMonthlyTarget(String(user.monthly_target ?? 0));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <ErpPageHeader
          eyebrow="Staff & Governance"
          title="Sellers & Users Management"
          description="Manage POS staff accounts, roles, maximum discount limits, and targets."
        />
        <Button onClick={() => { resetForm(); setShowAddModal(true); }} className="gap-2 self-start sm:self-auto">
          <Plus className="h-4 w-4" /> Add New Staff
        </Button>
      </div>

      <ErpToolbar
        search={query}
        onSearchChange={setQuery}
        searchPlaceholder="Search by name, username, or email…"
        onRefresh={() => void usersQuery.refetch()}
        refreshing={usersQuery.isFetching}
      />

      <ErpTable>
        <thead>
          <tr>
            <ErpTh>Staff Member</ErpTh>
            <ErpTh>Username</ErpTh>
            <ErpTh>Role</ErpTh>
            <ErpTh>Status</ErpTh>
            <ErpTh>Max Discount</ErpTh>
            <ErpTh>Monthly Target</ErpTh>
            <ErpTh>Target Progress</ErpTh>
            <ErpTh className="text-right">Actions</ErpTh>
          </tr>
        </thead>
        <tbody>
          {filteredUsers.map((user) => {
            const perf = perfMap.get(user.id);
            const progress = perf ? perf.target_progress : 0;

            return (
              <tr key={user.id} className="hover:bg-secondary/40">
                <ErpTd className="font-medium">
                  <p className="font-semibold text-sm">{user.full_name || user.username}</p>
                  <p className="text-xs text-muted-foreground">{user.email || "No email"}</p>
                </ErpTd>
                <ErpTd className="font-mono text-xs">{user.username}</ErpTd>
                <ErpTd>
                  <Badge className={user.role === "admin" ? "bg-amber-400 text-black border-0" : "bg-secondary text-foreground"}>
                    {user.role === "admin" ? "Admin" : "Seller"}
                  </Badge>
                </ErpTd>
                <ErpTd>
                  <StatusBadge value={user.status || "active"} kind="user" />
                </ErpTd>
                <ErpTd className="font-mono">{user.max_discount ?? 0}%</ErpTd>
                <ErpTd className="font-mono">{formatCurrency(user.monthly_target ?? 0)}</ErpTd>
                <ErpTd>
                  <div className="w-32 space-y-1">
                    <div className="flex justify-between text-[10px] text-muted-foreground">
                      <span>{formatCurrency(perf?.monthly_sales ?? 0)}</span>
                      <span>{progress}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all"
                        style={{ width: `${Math.min(100, progress)}%` }}
                      />
                    </div>
                  </div>
                </ErpTd>
                <ErpTd>
                  <div className="flex justify-end gap-1">
                    <Button size="sm" variant="outline" onClick={() => startEdit(user)}>
                      Edit
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setResetPassUser(user)}>
                      <KeyRound className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      size="sm"
                      variant={user.status === "disabled" ? "default" : "outline"}
                      onClick={() => void handleToggleStatus(user)}
                    >
                      {user.status === "disabled" ? <UserCheck className="h-3.5 w-3.5 text-emerald-500" /> : <UserX className="h-3.5 w-3.5 text-destructive" />}
                    </Button>
                  </div>
                </ErpTd>
              </tr>
            );
          })}
        </tbody>
      </ErpTable>

      {/* Add / Edit Modal */}
      {(showAddModal || editingUser) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/50">
          <Card className="w-full max-w-lg shadow-2xl">
            <CardContent className="p-6 space-y-4">
              <h2 className="font-heading text-2xl">{editingUser ? "Edit Staff User" : "Add Staff User"}</h2>
              <form onSubmit={editingUser ? handleUpdate : handleCreate} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold">Full Name *</label>
                  <Input value={fullName} onChange={(e) => setFullName(e.target.value)} required placeholder="e.g. Ahmed Hassan" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold">Username *</label>
                    <Input value={username} onChange={(e) => setUsername(e.target.value)} required placeholder="ahmed" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold">Email</label>
                    <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ahmed@1990.store" />
                  </div>
                </div>

                {!editingUser && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold">Password *</label>
                    <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} placeholder="••••••••" />
                  </div>
                )}

                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold">Role</label>
                    <select
                      className="w-full h-10 rounded-xl border bg-background px-3 text-sm"
                      value={role}
                      onChange={(e) => setRole(e.target.value as "seller" | "admin")}
                    >
                      <option value="seller">Seller</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold">Max Discount (%)</label>
                    <Input type="number" value={maxDiscount} onChange={(e) => setMaxDiscount(e.target.value)} min={0} max={100} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold">Monthly Target</label>
                    <Input type="number" value={monthlyTarget} onChange={(e) => setMonthlyTarget(e.target.value)} min={0} />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => { setShowAddModal(false); setEditingUser(null); }}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={busy}>
                    {busy ? "Saving…" : editingUser ? "Update User" : "Create Staff User"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Reset Password Modal */}
      {resetPassUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/50">
          <Card className="w-full max-w-md shadow-2xl">
            <CardContent className="p-6 space-y-4">
              <h2 className="font-heading text-2xl">Reset Password</h2>
              <p className="text-xs text-muted-foreground">Reset password for {resetPassUser.full_name || resetPassUser.username}</p>
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold">New Password *</label>
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    placeholder="New password (min 6 chars)"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button type="button" variant="outline" onClick={() => setResetPassUser(null)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={busy}>
                    {busy ? "Resetting…" : "Reset Password"}
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
