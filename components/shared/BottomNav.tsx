"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeftRight, TrendingUp, Settings2 } from "lucide-react";

const tabs = [
  { href: "/", label: "Convert", icon: ArrowLeftRight },
  { href: "/rates", label: "Rates", icon: TrendingUp },
  { href: "/settings", label: "Settings", icon: Settings2 },
] as const;

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-bg-primary border-t border-border-subtle">
      <div
        className="flex items-center justify-around"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        {tabs.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center justify-center gap-1 py-2 px-4 min-w-[64px] min-h-[44px] transition-colors duration-100 ${
                isActive ? "text-accent" : "text-text-muted"
              }`}
            >
              <Icon size={22} />
              <span className="text-[10px] font-sans">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
