"use client";

import { useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";

const emptySubscribe = () => () => {};

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();

  // The resolved theme is only known on the client, so defer theme-dependent
  // rendering until after mount to keep the server and first client render in
  // sync (avoids a hydration mismatch on the icon/label). useSyncExternalStore
  // gives a stable false on the server / during hydration, then true on the
  // client — without a setState-in-effect (which ESLint react-hooks flags).
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );

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
