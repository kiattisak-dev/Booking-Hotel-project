import cors from "cors";

const parseOrigins = (v?: string) =>
  (v || "")
    .split(",")
    .map(s => s.trim())
    .filter(Boolean);

export const createCors = () => {
  const allowList = parseOrigins(process.env.CORS_ORIGIN);
  const options: cors.CorsOptions = {
    origin: (origin, cb) => {
      if (!origin) return cb(null, true);
      if (allowList.length === 0) return cb(null, true);
      if (allowList.includes(origin)) return cb(null, true);
      return cb(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    optionsSuccessStatus: 204,
  };
  return cors(options);
};
