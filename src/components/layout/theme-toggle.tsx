"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // The resolved theme is only known on the client, so defer theme-dependent
  // rendering until after mount to keep the server and first client render in
  // sync (avoids a hydration mismatch on the icon/label).
  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = resolvedTheme === "dark";

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label="テーマを切り替える"
      suppressHydrationWarning
    >
      {mounted ? (
        <>
          {isDark ? <Sun /> : <Moon />}
          <span>{isDark ? "Light" : "Dark"}</span>
        </>
      ) : (
        <>
          <Sun className="opacity-0" aria-hidden />
          <span className="opacity-0">Light</span>
        </>
      )}
    </Button>
  );
}
