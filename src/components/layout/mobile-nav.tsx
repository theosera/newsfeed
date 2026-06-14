import Link from "next/link";
import { Home, Search, Settings, Star } from "lucide-react";

import { cn } from "@/lib/utils";

const items = [
  { href: "/", label: "Home", icon: Home },
  { href: "/search", label: "Search", icon: Search },
  { href: "/saved", label: "Saved", icon: Star },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function MobileNav({ pathname }: { pathname: string }) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t bg-background/95 px-3 py-2 backdrop-blur lg:hidden">
      <div className="grid grid-cols-4 gap-2">
        {items.map((item) => {
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center rounded-lg px-2 py-2 text-xs text-muted-foreground",
                pathname === item.href && "bg-accent text-accent-foreground",
              )}
            >
              <Icon className="mb-1 size-4" />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
