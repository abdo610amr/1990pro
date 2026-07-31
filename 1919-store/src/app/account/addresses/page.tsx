"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Plus, Trash2, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useAuthStore } from "@/store/auth-store";
import { toast } from "sonner";
import type { Address } from "@/types";

export default function AddressesPage() {
  const { addresses, addAddress, removeAddress } = useAuthStore();
  const [open, setOpen] = useState(false);
  const { register, handleSubmit, reset } = useForm<Omit<Address, "id">>();

  const onSubmit = async (data: Omit<Address, "id">) => {
    try {
      await addAddress({ ...data, isDefault: addresses.length === 0 });
      toast.success("Address added");
      reset();
      setOpen(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to add address");
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="font-heading text-xl font-light">Saved Addresses</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger
            render={
              <Button variant="outline" className="rounded-full">
                <Plus className="mr-2 h-4 w-4" />
                Add Address
              </Button>
            }
          />
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Address</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>First Name</Label>
                  <Input className="mt-1.5" {...register("firstName")} />
                </div>
                <div>
                  <Label>Last Name</Label>
                  <Input className="mt-1.5" {...register("lastName")} />
                </div>
              </div>
              <div>
                <Label>Label</Label>
                <Input placeholder="Home, Work, etc." className="mt-1.5" {...register("label")} />
              </div>
              <div>
                <Label>Street</Label>
                <Input className="mt-1.5" {...register("street")} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>City</Label>
                  <Input className="mt-1.5" {...register("city")} />
                </div>
                <div>
                  <Label>State</Label>
                  <Input className="mt-1.5" {...register("state")} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Zip Code</Label>
                  <Input className="mt-1.5" {...register("zipCode")} />
                </div>
                <div>
                  <Label>Country</Label>
                  <Input defaultValue="United States" className="mt-1.5" {...register("country")} />
                </div>
              </div>
              <div>
                <Label>Phone</Label>
                <Input className="mt-1.5" {...register("phone")} />
              </div>
              <Button type="submit" className="w-full rounded-full">
                Save Address
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        {addresses.map((address) => (
          <div
            key={address.id}
            className="flex items-start justify-between rounded-2xl border p-6"
          >
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium">{address.label}</span>
                {address.isDefault && (
                  <span className="flex items-center gap-1 text-xs text-primary">
                    <Star className="h-3 w-3 fill-primary" />
                    Default
                  </span>
                )}
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                {address.firstName} {address.lastName}
              </p>
              <p className="text-sm text-muted-foreground">
                {address.street}, {address.city}, {address.state} {address.zipCode}
              </p>
              <p className="text-sm text-muted-foreground">{address.phone}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={async () => {
                try {
                  await removeAddress(address.id);
                  toast.success("Address removed");
                } catch (error) {
                  toast.error(
                    error instanceof Error
                      ? error.message
                      : "Unable to remove address"
                  );
                }
              }}
            >
              <Trash2 className="h-4 w-4 text-muted-foreground" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
