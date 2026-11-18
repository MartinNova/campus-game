import type { MetadataRoute } from "next";
import { APP_DESCRIPTION, APP_NAME, APP_SHORT_NAME } from "@/lib/config/app";

/**
 * Web app manifest: "Add to Home Screen" opens the app full screen
 * (no browser address bar), like a native app.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: APP_NAME,
    short_name: APP_SHORT_NAME,
    description: APP_DESCRIPTION,
    start_url: "/",
    display: "standalone",
    background_color: "#f5f6f8",
    theme_color: "#ffffff",
    icons: [{ src: "/icon.png", sizes: "500x500", type: "image/png" }],
  };
}
