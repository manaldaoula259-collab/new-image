import { prompts } from "@/core/utils/prompts";
import { MetadataRoute } from "next";

const routes = [
  "https://photoshot.app",
  "https://photoshot.app/terms",
  "https://photoshot.app/privacy",
  "https://photoshot.app/faq",
  "https://photoshot.app/prompts",
  ...prompts.map(
    ({ slug }) => `https://photoshot.app/prompts/dreambooth/${slug}`
  ),
];

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map((route) => ({ url: route }));
}
