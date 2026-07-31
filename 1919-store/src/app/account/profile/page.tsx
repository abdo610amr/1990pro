"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/store/auth-store";
import { toast } from "sonner";

const profileSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email"),
  phone: z.string().optional(),
});

type ProfileForm = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const { user, updateProfile } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user?.firstName ?? "",
      lastName: user?.lastName ?? "",
      email: user?.email ?? "",
      phone: user?.phone ?? "",
    },
  });

  const onSubmit = async (data: ProfileForm) => {
    await new Promise((resolve) => setTimeout(resolve, 600));
    await updateProfile(data);
    toast.success("Profile updated successfully");
  };

  return (
    <div className="rounded-2xl border p-8">
      <h2 className="font-heading text-xl font-light">Profile</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Update your personal information.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="firstName">First Name</Label>
            <Input id="firstName" className="mt-1.5" {...register("firstName")} />
            {errors.firstName && (
              <p className="mt-1 text-xs text-destructive">
                {errors.firstName.message}
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="lastName">Last Name</Label>
            <Input id="lastName" className="mt-1.5" {...register("lastName")} />
            {errors.lastName && (
              <p className="mt-1 text-xs text-destructive">
                {errors.lastName.message}
              </p>
            )}
          </div>
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" className="mt-1.5" {...register("email")} />
          {errors.email && (
            <p className="mt-1 text-xs text-destructive">{errors.email.message}</p>
          )}
        </div>
        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" className="mt-1.5" {...register("phone")} />
        </div>
        <Button type="submit" disabled={isSubmitting} className="rounded-full px-8">
          {isSubmitting ? "Saving..." : "Save Changes"}
        </Button>
      </form>
    </div>
  );
}
