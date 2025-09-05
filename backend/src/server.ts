import dotenv from "dotenv";
dotenv.config();

import app from "./app";
import { connectDB } from "./configs/db";
import { startSchedulers } from "./jobs/schedulers";

const PORT = Number(process.env.PORT || 8081);

(async () => {
  try {
    await connectDB();
    startSchedulers();
    app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
  } catch (err) {
    console.error("❌ Failed to start server:", err);
    process.exit(1);
  }
})();
