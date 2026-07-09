import type { Metadata } from "next";
import MiniAppClient from "./MiniAppClient";

export const metadata: Metadata = {
  title: "KIYA-NET Mini App",
  description: "ورود سریع به خدمات کیانت از داخل تلگرام و بله",
};

export default function MiniAppPage() {
  return <MiniAppClient />;
}
