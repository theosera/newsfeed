export type PageSearchParams = Promise<Record<string, string | string[] | undefined>>;

export async function normalizeSearchParams(searchParams?: PageSearchParams) {
  const resolved = (await searchParams) ?? {};

  return Object.fromEntries(
    Object.entries(resolved).map(([key, value]) => [
      key,
      Array.isArray(value) ? value[0] : value,
    ]),
  ) as Record<string, string | undefined>;
}
