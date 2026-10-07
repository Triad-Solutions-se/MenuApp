// Canonical root domain. Tenants live at <subdomain>.mcasolutions.se.
export const ROOT_DOMAIN = "mcasolutions.se"
// Former root domain (MCA Solutions → MCA Solutions AB, 2026). Hosts under it
// keep resolving: page requests 308 to the same path on ROOT_DOMAIN (printed QR
// codes depend on this), while /api/* keeps serving for webhooks and callbacks.
export const LEGACY_ROOT_DOMAINS = ["triadsolutions.se"] as const
const ALL_ROOT_DOMAINS: readonly string[] = [ROOT_DOMAIN, ...LEGACY_ROOT_DOMAINS]
export const MARKETING_SUBDOMAIN = "servera"

export const RESERVED_SUBDOMAINS = new Set<string>([
  "www",
  "admin",
  "api",
  "app",
  "auth",
  "login",
  "register",
  "signup",
  "mail",
  "smtp",
  "ftp",
  "ns1",
  "ns2",
  "static",
  "assets",
  "cdn",
  "blog",
  "docs",
  "help",
  "support",
  "status",
  "dashboard",
  MARKETING_SUBDOMAIN,
])

function hostnameOf(host: string | null | undefined): string | null {
  if (!host) return null
  return host.split(":")[0].toLowerCase()
}

/** The root domain (canonical or legacy) a host belongs to, or null for other hosts. */
export function rootDomainForHost(host: string | null | undefined): string | null {
  const hostname = hostnameOf(host)
  if (!hostname) return null
  for (const root of ALL_ROOT_DOMAINS) {
    if (hostname === root || hostname.endsWith(`.${root}`)) return root
  }
  return null
}

export function isLegacyHost(host: string | null | undefined): boolean {
  const root = rootDomainForHost(host)
  return root !== null && root !== ROOT_DOMAIN
}

export function extractSubdomainFromHost(host: string | null | undefined): string | null {
  const hostname = hostnameOf(host)
  const root = rootDomainForHost(host)
  if (!hostname || !root || hostname === root) return null
  const sub = hostname.slice(0, -(root.length + 1))
  if (!sub || sub.includes(".")) return null
  return sub
}

export function isTenantSubdomain(sub: string | null | undefined): sub is string {
  return !!sub && !RESERVED_SUBDOMAINS.has(sub)
}

const SUBDOMAIN_PATTERN = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/

export function isValidTenantSubdomain(sub: string): boolean {
  if (!SUBDOMAIN_PATTERN.test(sub)) return false
  if (RESERVED_SUBDOMAINS.has(sub)) return false
  return true
}

export function tenantUrl(subdomain: string, path: string = "/"): string {
  const cleanPath = path.startsWith("/") ? path : `/${path}`
  return `https://${subdomain}.${ROOT_DOMAIN}${cleanPath}`
}

export function marketingUrl(path: string = "/"): string {
  const cleanPath = path.startsWith("/") ? path : `/${path}`
  return `https://${MARKETING_SUBDOMAIN}.${ROOT_DOMAIN}${cleanPath}`
}

export function cookieDomainForHost(host: string | null | undefined): string | undefined {
  const root = rootDomainForHost(host)
  return root ? `.${root}` : undefined
}
