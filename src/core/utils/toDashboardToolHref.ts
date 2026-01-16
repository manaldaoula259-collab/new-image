export function toDashboardToolHref(href: string) {
  if (!href) return "/dashboard/tools";
  if (href.startsWith("/dashboard/")) return href;
  if (!href.startsWith("/")) return `/dashboard/tools/${href}`;
  return `/dashboard/tools${href}`;
}

export function fromDashboardToolSlug(slugPath: string) {
  // slugPath is like "ai-photo-filter/image-to-prompt" or "studio-ghibli"
  if (!slugPath) return "/";
  return `/${slugPath.replace(/^\/+/, "")}`;
}



