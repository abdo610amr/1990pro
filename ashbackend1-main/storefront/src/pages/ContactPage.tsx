import { Mail, MapPin, MessageCircle, Phone, Clock } from "lucide-react";
import { FacebookIcon, InstagramIcon } from "@/components/ui/SocialIcons";
import { useContactConfig, useStoreName } from "@/hooks/useStoreSettings";

export function ContactPage() {
  const storeName = useStoreName();
  const contact = useContactConfig();

  const whatsappUrl = contact?.whatsapp
    ? `https://wa.me/${contact.whatsapp.replace(/\D/g, "")}`
    : null;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-6 md:py-12">
      <div className="mb-12 text-center">
        <h1 className="font-display text-3xl font-bold md:text-4xl">Contact Us</h1>
        <p className="mt-2 text-muted-foreground">
          We&apos;d love to hear from you. Reach out anytime.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-6 rounded-2xl border border-border bg-card p-8">
          <h2 className="font-display text-2xl font-semibold">{storeName}</h2>

          {contact?.address && (
            <div className="flex gap-4">
              <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <div>
                <p className="font-medium">Address</p>
                <p className="text-sm text-muted-foreground">{contact.address}</p>
              </div>
            </div>
          )}

          {contact?.phone && (
            <div className="flex gap-4">
              <Phone className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <div>
                <p className="font-medium">Phone</p>
                <a
                  href={`tel:${contact.phone}`}
                  className="text-sm text-muted-foreground hover:text-primary"
                >
                  {contact.phone}
                </a>
              </div>
            </div>
          )}

          {contact?.email && (
            <div className="flex gap-4">
              <Mail className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <div>
                <p className="font-medium">Email</p>
                <a
                  href={`mailto:${contact.email}`}
                  className="text-sm text-muted-foreground hover:text-primary"
                >
                  {contact.email}
                </a>
              </div>
            </div>
          )}

          {contact?.hours && (
            <div className="flex gap-4">
              <Clock className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <div>
                <p className="font-medium">Store Hours</p>
                <p className="text-sm text-muted-foreground">{contact.hours}</p>
              </div>
            </div>
          )}

          {whatsappUrl && (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-[#25D366] px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90"
            >
              <MessageCircle className="h-5 w-5" />
              Chat on WhatsApp
            </a>
          )}
        </div>

        <div className="rounded-2xl border border-border bg-sidebar p-8 text-sidebar-foreground">
          <h2 className="font-display mb-6 text-2xl font-semibold">Follow Us</h2>
          <p className="mb-8 text-sm text-sidebar-foreground/70">
            Stay connected for new arrivals, exclusive offers, and fragrance tips.
          </p>
          <div className="flex flex-wrap gap-4">
            {contact?.social.instagram && (
              <a
                href={contact.social.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 rounded-xl bg-sidebar-accent px-5 py-3 text-sm font-medium transition hover:bg-sidebar-primary"
              >
                <InstagramIcon className="h-5 w-5" />
                Instagram
              </a>
            )}
            {contact?.social.facebook && (
              <a
                href={contact.social.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 rounded-xl bg-sidebar-accent px-5 py-3 text-sm font-medium transition hover:bg-sidebar-primary"
              >
                <FacebookIcon className="h-5 w-5" />
                Facebook
              </a>
            )}
            {contact?.social.tiktok && (
              <a
                href={contact.social.tiktok}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 rounded-xl bg-sidebar-accent px-5 py-3 text-sm font-medium transition hover:bg-sidebar-primary"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                </svg>
                TikTok
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
