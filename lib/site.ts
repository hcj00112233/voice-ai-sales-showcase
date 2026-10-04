const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/** Prefix public asset URLs when the site is hosted below a project path. */
export function sitePath(path: string): string {
  return `${basePath}${path.startsWith("/") ? path : `/${path}`}`;
}
