import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/schema.ts",
  out: "./drizzle",
  // 修正點 1: 直接指定 dialect 為 'turso'
  dialect: "turso", 
  // 修正點 2: 移除 driver: "turso" 這一行，因為它在舊版才需要，新版已不支援此屬性搭配 turso
  dbCredentials: {
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN,
  },
});