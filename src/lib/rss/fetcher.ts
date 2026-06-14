import Parser from "rss-parser";
import { ArticleStatus } from "@prisma/client";

import { prisma } from "@/lib/db";
import { slugify } from "@/lib/slugify";

type ParsedFeedItem = {
  title?: string;
  link?: string;
  isoDate?: string;
  pubDate?: string;
  content?: string;
  contentSnippet?: string;
  contentEncoded?: string;
  creator?: string;
  enclosure?: {
    url?: string;
  };
  mediaContent?: {
    $?: {
      url?: string;
    };
  };
  mediaThumbnail?: {
    $?: {
      url?: string;
    };
  };
};

const parser = new Parser<Record<string, never>, ParsedFeedItem>({
  customFields: {
    item: [
      ["media:content", "mediaContent"],
      ["media:thumbnail", "mediaThumbnail"],
      ["content:encoded", "contentEncoded"],
      "creator",
    ],
  },
});

function stripHtml(value?: string | null) {
  if (!value) {
    return "";
  }

  return value
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function stripTrackingParams(url: URL) {
  const trackingKeys = [
    "utm_source",
    "utm_medium",
    "utm_campaign",
    "utm_term",
    "utm_content",
    "fbclid",
    "gclid",
  ];

  for (const key of trackingKeys) {
    url.searchParams.delete(key);
  }
}

function normalizeUrl(rawUrl?: string | null) {
  if (!rawUrl) {
    return null;
  }

  try {
    const url = new URL(rawUrl);
    stripTrackingParams(url);

    if (url.pathname !== "/") {
      url.pathname = url.pathname.replace(/\/+$/, "");
    }

    url.hash = "";
    return url.toString();
  } catch {
    return null;
  }
}

function isPrivateHost(hostname: string) {
  const lower = hostname.toLowerCase();

  if (
    lower === "localhost" ||
    lower === "::1" ||
    lower.endsWith(".local") ||
    lower.startsWith("127.") ||
    lower.startsWith("10.") ||
    lower.startsWith("192.168.") ||
    lower.startsWith("169.254.")
  ) {
    return true;
  }

  const match = lower.match(/^172\.(\d{1,2})\./);
  if (match) {
    const secondOctet = Number(match[1]);
    return secondOctet >= 16 && secondOctet <= 31;
  }

  return false;
}

function assertSafeFeedUrl(rawUrl: string) {
  const url = new URL(rawUrl);

  if (!["http:", "https:"].includes(url.protocol)) {
    throw new Error("Only http/https feeds are supported.");
  }

  if (isPrivateHost(url.hostname)) {
    throw new Error("Private network feed URLs are not allowed.");
  }
}

function extractThumbnail(item: ParsedFeedItem) {
  return (
    item.enclosure?.url ??
    item.mediaThumbnail?.$?.url ??
    item.mediaContent?.$?.url ??
    null
  );
}

function resolvePublishedAt(item: ParsedFeedItem) {
  const value = item.isoDate ?? item.pubDate;

  if (!value) {
    return new Date();
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
}

export async function fetchFeedForSource(sourceId: string) {
  const source = await prisma.source.findUnique({
    where: { id: sourceId },
    include: { category: true },
  });

  if (!source) {
    throw new Error("Source not found.");
  }

  if (!source.enabled) {
    return {
      fetchedCount: 0,
      importedCount: 0,
      skippedCount: 0,
    };
  }

  assertSafeFeedUrl(source.url);

  const feed = await parser.parseURL(source.url);
  const items = feed.items ?? [];
  let importedCount = 0;
  let skippedCount = 0;

  for (const item of items) {
    const normalizedUrl = normalizeUrl(item.link);
    const canonicalUrl = normalizeUrl(item.link);

    if (!normalizedUrl || !item.title) {
      skippedCount += 1;
      continue;
    }

    const existing = await prisma.article.findFirst({
      where: {
        OR: [
          { url: normalizedUrl },
          ...(canonicalUrl ? [{ canonicalUrl }] : []),
        ],
      },
      select: { id: true },
    });

    if (existing) {
      skippedCount += 1;
      continue;
    }

    const summary = stripHtml(item.contentSnippet ?? item.content ?? item.contentEncoded);
    const content = item.contentEncoded ?? item.content ?? null;

    await prisma.article.create({
      data: {
        title: item.title.trim(),
        url: normalizedUrl,
        canonicalUrl,
        summary: summary || "No summary available.",
        content,
        thumbnailUrl: extractThumbnail(item),
        publishedAt: resolvePublishedAt(item),
        sourceId: source.id,
        categoryId: source.categoryId,
        status: ArticleStatus.PUBLISHED,
      },
    });

    importedCount += 1;
  }

  await prisma.source.update({
    where: { id: source.id },
    data: { lastFetchedAt: new Date() },
  });

  return {
    fetchedCount: items.length,
    importedCount,
    skippedCount,
  };
}

export async function fetchAndLogSource(sourceId: string) {
  try {
    const result = await fetchFeedForSource(sourceId);

    await prisma.feedFetchLog.create({
      data: {
        sourceId,
        success: true,
        ...result,
      },
    });

    return result;
  } catch (error) {
    await prisma.feedFetchLog.create({
      data: {
        sourceId,
        success: false,
        errorMessage:
          error instanceof Error ? error.message : "Unknown feed fetch error.",
      },
    });

    throw error;
  }
}

export async function fetchAllEnabledSources() {
  const sources = await prisma.source.findMany({
    where: { enabled: true },
    select: { id: true },
  });

  const results = [];

  for (const source of sources) {
    try {
      const result = await fetchAndLogSource(source.id);
      results.push({ sourceId: source.id, success: true, ...result });
    } catch (error) {
      results.push({
        sourceId: source.id,
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  return results;
}

export function createSourceSlug(name: string) {
  return slugify(name);
}
