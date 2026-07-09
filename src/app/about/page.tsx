import type { Metadata } from "next";
import AboutPageClient from "./AboutPageClient";

export const metadata: Metadata = {
  title: "درباره ما | کیانت",
  description: "داستان شکل‌گیری کافی‌نت آنلاین کیانت و اوید کیا، بنیان‌گذار آن.",
};

export default function AboutPage() {
  return <AboutPageClient />;
}
