import path from "node:path";
import {
  Document,
  Font,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";
import { formatJalaliDateTime, formatToman, toPersianDigits } from "@/lib/format";
import { statusLabel } from "@/lib/format";
import type { Order } from "@/db/schema";

const fontsDir = path.join(process.cwd(), "src", "fonts");

let fontsRegistered = false;
function registerFonts() {
  if (fontsRegistered) return;
  Font.register({
    family: "Vazirmatn",
    fonts: [
      { src: path.join(fontsDir, "Vazirmatn-Regular.ttf"), fontWeight: "normal" },
      { src: path.join(fontsDir, "Vazirmatn-Medium.ttf"), fontWeight: "medium" },
      { src: path.join(fontsDir, "Vazirmatn-Bold.ttf"), fontWeight: "bold" },
    ],
  });
  Font.registerHyphenationCallback((word) => [word]);
  fontsRegistered = true;
}

const COLORS = {
  ink: "#0b1220",
  sub: "#4b5768",
  line: "#e4e9f0",
  brand: "#0f9d78",
  brandDark: "#0b6b53",
  amber: "#c8862a",
  soft: "#f4f7f6",
};

const styles = StyleSheet.create({
  page: {
    fontFamily: "Vazirmatn",
    direction: "rtl",
    padding: 36,
    fontSize: 10.5,
    color: COLORS.ink,
    backgroundColor: "#ffffff",
  },
  headerRow: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: COLORS.brand,
    paddingBottom: 14,
    marginBottom: 20,
  },
  brandBlock: { flexDirection: "column", alignItems: "flex-end" },
  brandTitle: { fontSize: 20, fontWeight: "bold", color: COLORS.brandDark },
  brandSub: { fontSize: 9, color: COLORS.sub, marginTop: 3 },
  docTag: {
    backgroundColor: COLORS.brand,
    color: "#ffffff",
    fontSize: 10,
    fontWeight: "medium",
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
  },
  section: {
    marginBottom: 16,
    backgroundColor: COLORS.soft,
    borderRadius: 10,
    padding: 14,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: COLORS.brandDark,
    marginBottom: 10,
    textAlign: "right",
  },
  row: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    marginBottom: 7,
  },
  label: { color: COLORS.sub, fontSize: 9.5, textAlign: "right" },
  value: { color: COLORS.ink, fontSize: 10.5, fontWeight: "medium", textAlign: "left" },
  divider: { borderBottomWidth: 1, borderBottomColor: COLORS.line, marginVertical: 10 },
  paragraph: { fontSize: 10.5, lineHeight: 1.9, textAlign: "right", color: COLORS.ink },
  totalRow: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: COLORS.brandDark,
    borderRadius: 10,
    padding: 14,
    marginTop: 4,
  },
  totalLabel: { color: "#eafff6", fontSize: 11 },
  totalValue: { color: "#ffffff", fontSize: 15, fontWeight: "bold" },
  footer: {
    position: "absolute",
    bottom: 28,
    left: 36,
    right: 36,
    borderTopWidth: 1,
    borderTopColor: COLORS.line,
    paddingTop: 10,
    flexDirection: "row-reverse",
    justifyContent: "space-between",
  },
  footerText: { fontSize: 8.5, color: COLORS.sub },
  statusBadge: {
    alignSelf: "flex-end",
    fontSize: 9.5,
    fontWeight: "medium",
    color: COLORS.brandDark,
    backgroundColor: "#dcf5ec",
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
});

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

export function KiyaOrderDocument({
  order,
  mode,
}: {
  order: Order;
  mode: "receipt" | "delivery";
}) {
  registerFonts();
  const isDelivery = mode === "delivery";

  return (
    <Document
      title={`${isDelivery ? "برگه تحویل" : "رسید سفارش"} ${order.trackingCode}`}
      author="KIYA NET - کیانت"
    >
      <Page size="A4" style={styles.page}>
        <View style={styles.headerRow}>
          <View style={styles.brandBlock}>
            <Text style={styles.brandTitle}>KIYA NET | کیانت</Text>
            <Text style={styles.brandSub}>کافی‌نت آنلاین - اوید کیا</Text>
          </View>
          <Text style={styles.docTag}>
            {isDelivery ? "برگه تحویل کار" : "رسید ثبت سفارش"}
          </Text>
        </View>

        <Text style={styles.statusBadge}>
          وضعیت سفارش: {statusLabel(order.status)}
        </Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>مشخصات سفارش</Text>
          <InfoRow label="کد رهگیری" value={toPersianDigits(order.trackingCode)} />
          <InfoRow label="نام مشتری" value={order.fullName} />
          <InfoRow label="شماره تماس" value={toPersianDigits(order.phone)} />
          <InfoRow label="دسته‌بندی خدمت" value={order.categoryTitle} />
          <InfoRow label="نوع خدمت" value={order.serviceTitle} />
          <InfoRow label="تعداد / مقدار" value={toPersianDigits(order.quantity)} />
          <InfoRow label="سرویس فوری" value={order.urgent ? "بله (اولویت‌دار)" : "خیر"} />
          <InfoRow label="تاریخ ثبت سفارش" value={formatJalaliDateTime(order.createdAt)} />
          {order.deliveredAt ? (
            <InfoRow label="تاریخ تحویل" value={formatJalaliDateTime(order.deliveredAt)} />
          ) : null}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>توضیحات ثبت‌شده توسط مشتری</Text>
          <Text style={styles.paragraph}>{order.description}</Text>
        </View>

        {isDelivery ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>گزارش و نتیجه کار (اپراتور کیانت)</Text>
            <Text style={styles.paragraph}>
              {order.adminNote?.trim()
                ? order.adminNote
                : "کار شما توسط تیم کیانت با موفقیت انجام و آماده تحویل شد."}
            </Text>
          </View>
        ) : null}

        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>مبلغ قابل پرداخت</Text>
          <Text style={styles.totalValue}>{formatToman(order.estimatedPrice)}</Text>
        </View>

        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>
            KIYA NET - کافی‌نت آنلاین کیانت | مالک: اوید کیا (Avid Kiya)
          </Text>
          <Text style={styles.footerText}>این فایل به‌صورت خودکار توسط سامانه کیانت صادر شده است.</Text>
        </View>
      </Page>
    </Document>
  );
}
