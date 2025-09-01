export const API_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL || '').replace(/\/$/, '');

type Options = RequestInit & { auth?: boolean };

function mergeHeaders(base: HeadersInit, extra?: HeadersInit) {
  const h = new Headers(base);
  if (extra) new Headers(extra).forEach((v, k) => h.set(k, v));
  return h;
}

export async function apiFetch<T = any>(path: string, opts: Options = {}) {
  if (!API_BASE) throw new Error("Missing NEXT_PUBLIC_API_BASE_URL");
  const headers = mergeHeaders({ "Content-Type": "application/json" }, opts.headers);
  if (opts.auth) {
    const { useAuthStore } = await import("@/lib/stores/auth");
    const token = useAuthStore.getState().token;
    if (token) headers.set("Authorization", `Bearer ${token}`);
  }
  const res = await fetch(`${API_BASE}${path}`, { ...opts, headers, credentials: 'include' });
  if (!res.ok) {
    let msg = '';
    try {
      const ct = res.headers.get('content-type') || '';
      if (ct.includes('application/json')) {
        const j = await res.json();
        msg = j?.message || JSON.stringify(j);
      } else {
        msg = await res.text();
      }
    } catch {}
    throw new Error(msg || `HTTP ${res.status}`);
  }
  const text = await res.text();
  return text ? (JSON.parse(text) as T) : (undefined as any);
}
