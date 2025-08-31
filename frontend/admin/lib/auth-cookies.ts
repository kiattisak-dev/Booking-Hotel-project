export function setAuthCookies(token: string, role: string) {
  const secure = typeof window !== 'undefined' && window.location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `auth_token=${encodeURIComponent(token)}; Path=/; Max-Age=2592000; SameSite=Lax${secure}`;
  document.cookie = `auth_role=${encodeURIComponent(role)}; Path=/; Max-Age=2592000; SameSite=Lax${secure}`;
}

export function clearAuthCookies() {
  document.cookie = `auth_token=; Path=/; Max-Age=0; SameSite=Lax`;
  document.cookie = `auth_role=; Path=/; Max-Age=0; SameSite=Lax`;
}
