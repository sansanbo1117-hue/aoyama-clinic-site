import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "青山整形外科 受付ワークベンチ",
    short_name: "青山受付",
    description: "青山整形外科クリニックの受付・予約・問い合わせ管理",
    start_url: "/admin",
    display: "standalone",
    background_color: "#f7f8f4",
    theme_color: "#0a5f3f",
    lang: "ja",
    icons: [{ src: "/favicon.ico", sizes: "256x256", type: "image/x-icon" }],
  };
}
