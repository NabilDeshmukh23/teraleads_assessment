import { defineConfig } from "prisma/config";
import dotenv from "dotenv";

// Manually load the .env file
dotenv.config();

export default defineConfig({
  schema: "prisma/schema.prisma",
  // Ensure the datasource URL is explicitly pulled from process.env
  datasource: {
    url: process.env.DATABASE_URL,
  },
});