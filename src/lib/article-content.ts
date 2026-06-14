import { unified } from "unified";
import rehypeParse from "rehype-parse";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import type { Schema } from "hast-util-sanitize";
import rehypeHighlight from "rehype-highlight";
import rehypeStringify from "rehype-stringify";

// RSS article bodies are untrusted external HTML. We sanitize first (strip
// scripts / event handlers / disallowed tags), then run syntax highlighting,
// which only adds safe <span class="hljs-..."> tokens after sanitization.
const schema: Schema = {
  ...defaultSchema,
  attributes: {
    ...defaultSchema.attributes,
    // Preserve language-* on <code> so highlighting can pick the grammar.
    code: [["className"]],
    span: [["className"]],
    a: [...(defaultSchema.attributes?.a ?? []), "target", "rel"],
  },
};

const processor = unified()
  .use(rehypeParse, { fragment: true })
  .use(rehypeSanitize, schema)
  .use(rehypeHighlight, { detect: true, ignoreMissing: true })
  .use(rehypeStringify);

/**
 * Sanitize + syntax-highlight an RSS article's HTML body, returning HTML safe
 * to inject. Returns an empty string for empty input.
 */
export async function renderArticleHtml(html?: string | null): Promise<string> {
  if (!html || !html.trim()) {
    return "";
  }

  const file = await processor.process(html);
  return String(file);
}
