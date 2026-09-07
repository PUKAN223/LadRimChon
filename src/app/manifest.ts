import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "หลาดริมชล - แอปสั่งอาหารตลาดมหาวิทยาลัย",
    short_name: "หลาดริมชล",
    description: "สั่งอาหารล่วงหน้าจากตลาดมหาวิทยาลัย รับไว ไม่ต้องรอคิว",
    id: "/",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#F7F3E8",
    theme_color: "#F7F3E8",
    categories: ["food", "shopping", "lifestyle"],
    icons: [
      {
        src: "/images/app-icon-cream.png",
        sizes: "798x729",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/images/app-icon-cream.png",
        sizes: "798x729",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
