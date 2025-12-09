import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";

// 建立與 Turso (LibSQL) 的連線客戶端
const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

// 初始化 Drizzle ORM
export const db = drizzle(client, { schema });