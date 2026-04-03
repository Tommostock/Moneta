"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const PAGE_ORDER = ["/", "/rates", "/settings"];

export default function PageTransition({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const prevPath = useRef(pathname);
  const [direction, setDirection] = useState<"forward" | "back" | null>(null);
  const [key, setKey] = useState(0);

  useEffect(() => {
    if (pathname !== prevPath.current) {
      const prevIndex = PAGE_ORDER.indexOf(prevPath.current);
      const nextIndex = PAGE_ORDER.indexOf(pathname);
      setDirection(nextIndex > prevIndex ? "forward" : "back");
      setKey((k) => k + 1);
      prevPath.current = pathname;
    }
  }, [pathname]);

  const animClass = direction === "forward"
    ? "page-transition"
    : direction === "back"
      ? "page-transition-back"
      : "";

  return (
    <div key={key} className={animClass}>
      {children}
    </div>
  );
}
