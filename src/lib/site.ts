function trimOrigin(value: string | undefined): string {
  return (value?.trim() || "http://localhost:8443").replace(/\/$/, "");
}

/** Public storefront origin. Set VITE_STORE_URL when the site lives on another host. */
export function storeOrigin(): string {
  return trimOrigin(import.meta.env.VITE_STORE_URL);
}

export function storeUrl(path = "/"): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${storeOrigin()}${normalized}`;
}
