// Shared by product lists, filters, homepage and the saved-bag catalog.
export const catalogCacheTag = "carbignite-catalog";
export const catalogCacheOptions = {
  cache: "force-cache" as const,
  next: { tags: [catalogCacheTag], revalidate: false as const },
};
