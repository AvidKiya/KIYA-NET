import type { Metadata } from "next";
import ContactPageClient from "./ContactPageClient";

export const metadata: Metadata = {
  title: "تماس با ما | کیانت",
  description: "راه‌های ارتباطی با کافی‌نت آنلاین کیانت.",
};

export default function ContactPage() {
  return <ContactPageClient />;
}
