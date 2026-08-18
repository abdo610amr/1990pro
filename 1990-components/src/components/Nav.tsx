import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";

const links = [
  { label: "New Arrivals", href: "#new-arrivals" },
  { label: "Best Sellers", href: "#best-sellers" },
  { label: "Collection", href: "#collection" },
  { label: "Coming Soon", href: "#coming-soon" },
];

export function Nav() {
  const [open, setOpen] = useState(false);
  const [solid, setSolid] = useState(false);

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        solid ? "bg-background/92 border-b border-border backdrop-blur-sm" : "border-b border-transparent"
      }`}
    >
      <nav className="mx-auto flex max-w-[1500px] items-center justify-between px-6 py-5 md:px-12">
        <a href="#top" className="display text-2xl leading-none text-primary">
          1990
        </a>

        <ul className="hidden items-center gap-10 md:flex">
          {links.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                className="label relative text-primary/80 transition-colors after:absolute after:-bottom-1.5 after:left-0 after:h-px after:w-full after:origin-right after:scale-x-0 after:bg-primary after:transition-transform after:duration-500 hover:text-primary hover:after:origin-left hover:after:scale-x-100"
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        <a href="#final" className="label hidden text-primary md:block">
          Shop
        </a>

        <button
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
          className="text-primary md:hidden"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      {open && (
        <div className="border-t border-border bg-background px-6 pb-10 pt-6 md:hidden">
          <ul className="flex flex-col gap-6">
            {links.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="display block text-3xl text-primary"
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
          <p className="label mt-10 text-primary/60">Est. 2026 — Made for originals</p>
        </div>
      )}
    </header>
  );
}
