import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// Base = nom du repo pour GitHub Pages (URL /astruidix-astuces/)
export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: "/astruidix-astuces/",
});
