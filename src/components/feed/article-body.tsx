"use client";

import { useEffect, useRef } from "react";

const COPY_ICON =
  '<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>';
const CHECK_ICON =
  '<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>';

/**
 * Renders the sanitized article HTML and progressively enhances each code
 * block with a top-right copy button (Claude Code Web style). The HTML is
 * already safe (sanitized in renderArticleHtml); buttons are added imperatively
 * after mount so the server output stays a plain string.
 */
export function ArticleBody({ html }: { html: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) {
      return;
    }

    const cleanups: Array<() => void> = [];

    root.querySelectorAll("pre").forEach((pre) => {
      if (pre.querySelector(":scope > .code-copy-btn")) {
        return;
      }

      const button = document.createElement("button");
      button.type = "button";
      button.className = "code-copy-btn";
      button.setAttribute("aria-label", "コードをコピー");
      button.innerHTML = COPY_ICON;

      let timer: ReturnType<typeof setTimeout> | undefined;

      const onClick = async () => {
        const code =
          pre.querySelector("code")?.textContent ?? pre.textContent ?? "";
        try {
          await navigator.clipboard.writeText(code);
          button.innerHTML = CHECK_ICON;
          button.classList.add("is-copied");
          clearTimeout(timer);
          timer = setTimeout(() => {
            button.innerHTML = COPY_ICON;
            button.classList.remove("is-copied");
          }, 1500);
        } catch {
          // Clipboard API unavailable (e.g. non-secure context) — ignore.
        }
      };

      button.addEventListener("click", onClick);
      pre.appendChild(button);

      cleanups.push(() => {
        button.removeEventListener("click", onClick);
        clearTimeout(timer);
        button.remove();
      });
    });

    return () => cleanups.forEach((fn) => fn());
  }, [html]);

  return (
    <div
      ref={ref}
      className="article-prose mt-4"
      // Sanitized + highlighted in renderArticleHtml (rehype-sanitize).
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
