"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon, type IconName } from "./Icon";

const items: { href: string; label: string; icon: IconName }[] = [
  { href: "/", label: "Home", icon: "home" },
  { href: "/learn", label: "Learn", icon: "learn" },
  { href: "/practice", label: "Practice", icon: "practice" },
  { href: "/vocabulary", label: "Vocabulary", icon: "vocabulary" },
  { href: "/progress", label: "Progress", icon: "progress" },
];

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2.5 rounded-xl">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-forest-700 font-display text-lg font-bold text-cream-50">
        T
      </span>
      <span className="font-display text-xl font-bold text-forest-800">Türkçem</span>
    </Link>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r border-forest-100 bg-cream-100 p-5 lg:flex">
      <Logo />
      <nav aria-label="Main" className="mt-10 flex flex-col gap-1">
        {items.map((item) => {
          const active = isActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                active ? "bg-forest-700 text-white" : "text-forest-800 hover:bg-forest-100"
              }`}
            >
              <Icon name={item.icon} />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <p className="mt-auto text-xs leading-relaxed text-ink-soft">
        Practise real situations, one short conversation at a time.
      </p>
    </aside>
  );
}

export function MobileHeader() {
  return (
    <header className="sticky top-0 z-20 flex items-center border-b border-forest-100 bg-cream-50/90 px-4 py-3 backdrop-blur lg:hidden">
      <Logo />
    </header>
  );
}

export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-forest-100 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden"
    >
      {items.map((item) => {
        const active = isActive(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={`flex flex-col items-center gap-0.5 px-1 py-2 text-[11px] font-semibold ${
              active ? "text-forest-700" : "text-ink-soft"
            }`}
          >
            <span className={`rounded-full px-4 py-1 transition ${active ? "bg-forest-100" : ""}`}>
              <Icon name={item.icon} className="h-5 w-5" />
            </span>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
