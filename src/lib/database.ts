import mongoose from "mongoose";
import { DATABASE_HOST } from "@/constants/database";

// Extend globalThis to include mongoose cache
declare global {
  var mongoose: { conn: mongoose.Connection | null; promise: Promise<typeof mongoose> | null };
}

// Ensure global cache is preserved across hot reloads in development
let cached = global.mongoose || (global.mongoose = { conn: null, promise: null });

if (!DATABASE_HOST) {
  throw new Error("❌ DATABASE_HOST is not defined in environment variables.");
}

export async function connectDatabase() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(DATABASE_HOST)
    .then((mongooseInstance) => {
      return { conn: mongooseInstance.connection, promise: cached.promise };
    });
  }

  cached.conn = (await cached.promise).conn;
  return cached.conn;
}
