import { Link } from "react-router-dom";
import { Mail, MapPin, Phone } from "lucide-react";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { FacebookIcon, InstagramIcon } from "@/components/ui/SocialIcons";
import { useContactConfig, useStoreName } from "@/hooks/useStoreSettings";

export function Footer() {
  const storeName = useStoreName();
  const contact = useContactConfig();

  return (
    <footer className="mt-auto border-t border-border bg-sidebar text-sidebar-foreground">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 md:grid-cols-4 md:px-6">
        <div className="space-y-4 md:col-span-2">
          <div className="flex items-center gap-3">
            <BrandLogo monogramClassName="bg-sidebar-primary text-sidebar-primary-foreground" />
            <p className="font-display text-xl font-bold">{storeName}</p>
          </div>
          <p className="max-w-sm text-sm text-sidebar-foreground/70">
            Curated luxury fragrances for those who appreciate the finer things in life.
          </p>
          <div className="flex gap-3">
            {contact?.social.instagram && (
              <a
                href={contact.social.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg bg-sidebar-accent p-2 transition hover:bg-sidebar-primary"
                aria-label="Instagram"
              >
                <InstagramIcon className="h-4 w-4" />
              </a>
            )}
            {contact?.social.facebook && (
              <a
                href={contact.social.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg bg-sidebar-accent p-2 transition hover:bg-sidebar-primary"
                aria-label="Facebook"
              >
                <FacebookIcon className="h-4 w-4" />
              </a>
            )}
          </div>
        </div>

        <div>
          <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider">Quick Links</h4>
          <ul className="space-y-2 text-sm text-sidebar-foreground/70">
            <li><Link to="/shop" className="hover:text-sidebar-primary">Shop</Link></li>
            <li><Link to="/track-order" className="hover:text-sidebar-primary">Track Order</Link></li>
            <li><Link to="/contact" className="hover:text-sidebar-primary">Contact</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider">Contact</h4>
          <ul className="space-y-3 text-sm text-sidebar-foreground/70">
            {contact?.address && (
              <li className="flex gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{contact.address}</span>
              </li>
            )}
            {contact?.phone && (
              <li className="flex gap-2">
                <Phone className="mt-0.5 h-4 w-4 shrink-0" />
                <a href={`tel:${contact.phone}`} className="hover:text-sidebar-primary">
                  {contact.phone}
                </a>
              </li>
            )}
            {contact?.email && (
              <li className="flex gap-2">
                <Mail className="mt-0.5 h-4 w-4 shrink-0" />
                <a href={`mailto:${contact.email}`} className="hover:text-sidebar-primary">
                  {contact.email}
                </a>
              </li>
            )}
          </ul>
        </div>
      </div>

      <div className="border-t border-sidebar-border py-4 text-center text-xs text-sidebar-foreground/50">
        &copy; {new Date().getFullYear()} {storeName}. All rights reserved.
      </div>
    </footer>
  );
}
