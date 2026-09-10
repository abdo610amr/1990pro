"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Mail, MapPin, Phone } from "lucide-react";
import { PageBreadcrumb } from "@/components/shared/page-breadcrumb";
import { PageTransition } from "@/components/shared/page-transition";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { STORE_ADDRESS_LINE1, STORE_ADDRESS_LINE2 } from "@/lib/constants";
import { toast } from "sonner";

const contactSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  subject: z.string().min(1, "Subject is required"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type ContactForm = z.infer<typeof contactSchema>;

export default function ContactPage() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactForm>({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = async () => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    toast.success("Message sent. We'll get back to you within 24 hours.");
    reset();
  };

  return (
    <PageTransition>
      <div className="luxury-container luxury-section">
        <PageBreadcrumb items={[{ label: "Contact" }]} />

        <div className="mb-12 text-center">
          <p className="luxury-subheading">Get in Touch</p>
          <h1 className="luxury-heading mt-2">Contact Us</h1>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            Questions about an order, a brand partnership, or our collections?
            Our team is here to help.
          </p>
        </div>

        <div className="grid gap-12 lg:grid-cols-3">
          <div className="space-y-6">
            {[
              {
                icon: Mail,
                title: "Email",
                detail: "hello@1990.com",
                sub: "We reply within 24 hours",
              },
              {
                icon: Phone,
                title: "Phone",
                detail: "+1 (212) 555-1990",
                sub: "Mon–Fri, 9am–6pm EST",
              },
              {
                icon: MapPin,
                title: "Flagship",
                detail: STORE_ADDRESS_LINE1,
                sub: STORE_ADDRESS_LINE2,
              },
            ].map(({ icon: Icon, title, detail, sub }) => (
              <div key={title} className="rounded-2xl border p-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-medium">{title}</h3>
                <p className="mt-1 text-sm">{detail}</p>
                <p className="text-xs text-muted-foreground">{sub}</p>
              </div>
            ))}
          </div>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="rounded-2xl border p-8 lg:col-span-2"
          >
            <h2 className="font-heading text-2xl font-light">Send a Message</h2>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input id="name" className="mt-1.5" {...register("name")} />
                {errors.name && (
                  <p className="mt-1 text-xs text-destructive">
                    {errors.name.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  className="mt-1.5"
                  {...register("email")}
                />
                {errors.email && (
                  <p className="mt-1 text-xs text-destructive">
                    {errors.email.message}
                  </p>
                )}
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="subject">Subject</Label>
                <Input id="subject" className="mt-1.5" {...register("subject")} />
                {errors.subject && (
                  <p className="mt-1 text-xs text-destructive">
                    {errors.subject.message}
                  </p>
                )}
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  rows={6}
                  className="mt-1.5 resize-none"
                  {...register("message")}
                />
                {errors.message && (
                  <p className="mt-1 text-xs text-destructive">
                    {errors.message.message}
                  </p>
                )}
              </div>
            </div>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="mt-6 rounded-full px-8"
            >
              {isSubmitting ? "Sending..." : "Send Message"}
            </Button>
          </form>
        </div>
      </div>
    </PageTransition>
  );
}
