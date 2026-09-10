import Link from "next/link";
import { FaInstagram, FaTwitter, FaFacebook, FaGlobe } from "react-icons/fa";
import { cn } from "@/lib/utils";

interface SocialLinksProps {
  instagram?: string;
  twitter?: string;
  facebook?: string;
  website?: string;
  className?: string;
  iconClassName?: string;
}

export function SocialLinks({
  instagram,
  twitter,
  facebook,
  website,
  className,
  iconClassName = "h-5 w-5",
}: SocialLinksProps) {
  const links = [
    { href: instagram, label: "Instagram", icon: FaInstagram },
    { href: twitter, label: "Twitter", icon: FaTwitter },
    { href: facebook, label: "Facebook", icon: FaFacebook },
    { href: website, label: "Website", icon: FaGlobe },
  ].filter((link) => link.href);

  if (links.length === 0) return null;

  return (
    <div className={cn("flex gap-4", className)}>
      {links.map(({ href, label, icon: Icon }) => (
        <Link
          key={label}
          href={href!}
          target="_blank"
          rel="noopener noreferrer"
          className="text-muted-foreground transition-colors hover:text-primary"
          aria-label={label}
        >
          <Icon className={iconClassName} />
        </Link>
      ))}
    </div>
  );
}
