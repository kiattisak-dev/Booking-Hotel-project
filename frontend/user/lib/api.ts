import { Room, Package, Booking, User, Payment, SearchFilters } from "@/types";
import { useAuth } from "@/store/useAuth";

export const API_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL || "").replace(
  /\/$/,
  ""
);

type Options = RequestInit & { auth?: boolean; isFormData?: boolean };

export async function apiFetch<T = any>(path: string, opts: Options = {}) {
  const headers: HeadersInit = opts.isFormData
    ? { ...(opts.headers || {}) }
    : { "Content-Type": "application/json", ...(opts.headers || {}) };
  if (opts.auth) {
    const token = useAuth.getState().user?.token;
    if (token) {
      (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
      if (typeof document !== "undefined") {
        const role = useAuth.getState().user?.role || "USER";
        const isProd = window.location.protocol === "https:";
        document.cookie = `auth_token=${token}; path=/; ${
          isProd ? "Secure; SameSite=None;" : ""
        }`;
        document.cookie = `auth_role=${role}; path=/; ${
          isProd ? "Secure; SameSite=None;" : ""
        }`;
      }
    }
  }
  const res = await fetch(`${API_BASE}${path}`, {
    ...opts,
    headers,
    credentials: "include",
  });
  if (!res.ok) {
    const msg = await res.text().catch(() => "");
    throw new Error(msg || `HTTP ${res.status}`);
  }
  const text = await res.text();
  return text ? (JSON.parse(text) as T) : (undefined as any);
}

export const authAPI = {
  register: async (data: {
    name: string;
    email: string;
    password: string;
  }): Promise<User> =>
    apiFetch<User>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  login: async (data: { email: string; password: string }): Promise<User> => {
    const res = await apiFetch<{ user: Omit<User, "token">; token: string }>(
      "/api/auth/login",
      { method: "POST", body: JSON.stringify(data) }
    );
    return { ...res.user, token: res.token };
  },
  me: async (): Promise<User> =>
    apiFetch<User>("/api/auth/profile", { auth: true }),
};

export const roomAPI = {
  getAvailable: async (filters: SearchFilters): Promise<Room[]> => {
    const q = new URLSearchParams();
    if (filters.checkIn) q.set("checkIn", filters.checkIn);
    if (filters.checkOut) q.set("checkOut", filters.checkOut);
    if (typeof filters.guests === "number")
      q.set("guests", String(filters.guests));
    if (typeof filters.minPrice === "number")
      q.set("minPrice", String(filters.minPrice));
    if (typeof filters.maxPrice === "number")
      q.set("maxPrice", String(filters.maxPrice));
    if (filters.roomType) q.set("roomType", filters.roomType);
    if (filters.amenities?.length)
      q.set("amenities", filters.amenities.join(","));
    const qs = q.toString();
    return apiFetch<Room[]>(`/api/rooms/available${qs ? `?${qs}` : ""}`);
  },
  getAll: async (
    page = 1,
    limit = 10
  ): Promise<{ rooms: Room[]; total: number }> =>
    apiFetch<{ rooms: Room[]; total: number }>(
      `/api/rooms?page=${page}&limit=${limit}`
    ),
  getById: async (id: string): Promise<Room> =>
    apiFetch<Room>(`/api/rooms/${id}`),
};

export const packageAPI = {
  getActive: async (): Promise<Package[]> =>
    apiFetch<Package[]>("/api/packages?active=true"),
};

export const bookingAPI = {
  create: async (data: {
    roomId?: string;
    roomTypeId?: string;
    checkIn: string;
    checkOut: string;
    guests: number;
    contactDetails: any;
  }): Promise<Booking> =>
    apiFetch<Booking>("/api/bookings", {
      method: "POST",
      auth: true,
      body: JSON.stringify(data),
    }),
  getMyBookings: async (): Promise<Booking[]> =>
    apiFetch<Booking[]>("/api/bookings/me", { auth: true }),
  attachPayment: async (
    bookingId: string,
    paymentId: string
  ): Promise<Booking> =>
    apiFetch<Booking>(`/api/bookings/${bookingId}/payment`, {
      method: "PUT",
      auth: true,
      body: JSON.stringify({ paymentId }),
    }),
};

async function fileToDataUrl(f: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => resolve(String(fr.result));
    fr.onerror = reject;
    fr.readAsDataURL(f);
  });
}

export const paymentAPI = {
  uploadSlip: async (
    file: File,
    bookingId: string,
    amount?: number
  ): Promise<Payment> => {
    const fileToDataUrl = (f: File) =>
      new Promise<string>((resolve, reject) => {
        const fr = new FileReader();
        fr.onload = () => resolve(String(fr.result));
        fr.onerror = reject;
        fr.readAsDataURL(f);
      });
    const slipImage = await fileToDataUrl(file);
    return apiFetch<Payment>("/api/payments", {
      method: "POST",
      auth: true,
      body: JSON.stringify({ booking: bookingId, slipImage, amount }),
    });
  },
  getQR: async (pp: string, amount?: number) => {
    const q = new URLSearchParams();
    q.set("pp", pp);
    if (amount !== undefined) q.set("amount", String(amount));
    return apiFetch<{ payload: string; qrcodeDataUrl: string }>(
      `/api/payments/qr?${q.toString()}`
    );
  },
};
