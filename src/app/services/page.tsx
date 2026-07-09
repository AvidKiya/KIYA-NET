import type { Metadata } from "next";
import ServicesPageClient from "./ServicesPageClient";

export const metadata: Metadata = {
  title: "خدمات کیانت | کافی‌نت آنلاین",
  description: "لیست کامل خدمات کافی‌نت آنلاین کیانت به همراه قیمت و زمان تحویل هر خدمت.",
};

export default function ServicesPage() {
  return <ServicesPageClient />;
}
