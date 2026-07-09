export const runtime = "edge";

import { db } from "@/db";
import { systemSettings } from "@/db/schema";
import { eq } from "drizzle-orm";

export type PaymentGateway = "zarinpal" | "payping" | "test";

export interface PaymentRequestInput {
  amount: number; // in Toman
  description: string;
  callbackUrl: string;
  metadata?: Record<string, string>;
  mobile?: string;
  email?: string;
}

export interface PaymentRequestResult {
  success: boolean;
  authority?: string;
  paymentUrl?: string;
  error?: string;
  gateway: PaymentGateway;
}

export interface PaymentVerifyInput {
  authority: string;
  amount: number;
  status?: string;
  refId?: string;
  cardPan?: string;
}

export interface PaymentVerifyResult {
  success: boolean;
  refId?: string;
  cardPan?: string;
  fee?: number;
  error?: string;
  gateway: PaymentGateway;
}

export async function getActiveGateway(): Promise<PaymentGateway> {
  // Env takes precedence, then DB, then test mode.
  const envGateway = process.env.PAYMENT_GATEWAY;
  if (envGateway === "zarinpal" || envGateway === "payping" || envGateway === "test") {
    return envGateway;
  }
  const row = await db
    .select({ value: systemSettings.value })
    .from(systemSettings)
    .where(eq(systemSettings.key, "PAYMENT_GATEWAY"))
    .limit(1)
    .then((r) => r[0]);
  const value = row?.value || "test";
  if (value === "payping") return "payping";
  if (value === "test") return "test";
  return "zarinpal";
}

export async function getGatewayConfig(gateway: PaymentGateway) {
  const envKeys: Record<string, string> = {
    zarinpal: "ZARINPAL_API",
    payping: "PAYPING_TOKEN",
  };
  const envValue = envKeys[gateway] ? process.env[envKeys[gateway]] : undefined;
  if (envValue) return envValue;

  const dbKeys: Record<string, string> = {
    zarinpal: "ZARRINPAL_MERCHANT",
    payping: "PAYPING_TOKEN",
    test: "PAYMENT_GATEWAY",
  };
  const value = await db
    .select({ value: systemSettings.value })
    .from(systemSettings)
    .where(eq(systemSettings.key, dbKeys[gateway] || "ZARRINPAL_MERCHANT"))
    .limit(1)
    .then((r) => r[0]?.value);
  return value;
}

export async function createPaymentRequest(
  input: PaymentRequestInput,
  gateway?: PaymentGateway
): Promise<PaymentRequestResult> {
  const activeGateway = gateway || (await getActiveGateway());
  const merchant = await getGatewayConfig(activeGateway);

  if (activeGateway === "test" || !merchant) {
    const authority = "TEST-" + Math.random().toString(36).substring(2, 15).toUpperCase();
    return {
      success: true,
      authority,
      paymentUrl: `/payment/callback?Authority=${authority}&Status=OK&gateway=test`,
      gateway: "test",
    };
  }

  if (activeGateway === "zarinpal") {
    return zarinpalRequest(input, merchant);
  }

  if (activeGateway === "payping") {
    return paypingRequest(input, merchant);
  }

  return { success: false, error: "درگاه نامعتبر", gateway: activeGateway };
}

export async function verifyPayment(
  input: PaymentVerifyInput,
  gateway?: PaymentGateway
): Promise<PaymentVerifyResult> {
  const activeGateway = gateway || (await getActiveGateway());
  const merchant = await getGatewayConfig(activeGateway);

  if (activeGateway === "test" || !merchant) {
    return {
      success: input.status === "OK",
      refId: "TEST-REF-" + Math.random().toString(36).substring(2, 10).toUpperCase(),
      gateway: "test",
    };
  }

  if (activeGateway === "zarinpal") {
    return zarinpalVerify(input, merchant);
  }

  if (activeGateway === "payping") {
    return paypingVerify(input, merchant);
  }

  return { success: false, error: "درگاه نامعتبر", gateway: activeGateway };
}

async function zarinpalRequest(input: PaymentRequestInput, merchant: string): Promise<PaymentRequestResult> {
  const res = await fetch("https://api.zarinpal.com/pg/v4/payment/request.json", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      merchant_id: merchant,
      amount: input.amount,
      description: input.description,
      callback_url: input.callbackUrl,
      metadata: {
        mobile: input.mobile,
        email: input.email,
        ...input.metadata,
      },
    }),
  });

  const json = await res.json().catch(() => ({}));
  if (!res.ok || json.data?.code !== 100) {
    return {
      success: false,
      error: json.errors?.message || "خطا در اتصال به زرین‌پال",
      gateway: "zarinpal",
    };
  }

  const authority = json.data.authority;
  return {
    success: true,
    authority,
    paymentUrl: `https://www.zarinpal.com/pg/StartPay/${authority}`,
    gateway: "zarinpal",
  };
}

async function zarinpalVerify(input: PaymentVerifyInput, merchant: string): Promise<PaymentVerifyResult> {
  if (input.status !== "OK") {
    return { success: false, error: "پرداخت توسط کاربر لغو شد", gateway: "zarinpal" };
  }

  const res = await fetch("https://api.zarinpal.com/pg/v4/payment/verify.json", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      merchant_id: merchant,
      amount: input.amount,
      authority: input.authority,
    }),
  });

  const json = await res.json().catch(() => ({}));
  const code = json.data?.code;
  if (!res.ok || ![100, 101].includes(code)) {
    return {
      success: false,
      error: json.errors?.message || "خطا در تایید پرداخت",
      gateway: "zarinpal",
    };
  }

  return {
    success: true,
    refId: String(json.data.ref_id),
    cardPan: json.data.card_pan,
    gateway: "zarinpal",
  };
}

async function paypingRequest(input: PaymentRequestInput, token: string): Promise<PaymentRequestResult> {
  const res = await fetch("https://api.payping.ir/v2/pay", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `bearer ${token}`,
    },
    body: JSON.stringify({
      amount: input.amount,
      payerIdentity: input.mobile || input.email,
      payerName: input.description,
      description: input.description,
      returnUrl: input.callbackUrl,
      clientRefId: input.metadata?.orderId || input.metadata?.walletChargeId,
    }),
  });

  const json = await res.json().catch(() => ({}));
  if (!res.ok || !json.code) {
    return {
      success: false,
      error: json.errorMessage || "خطا در اتصال به پی‌پینگ",
      gateway: "payping",
    };
  }

  return {
    success: true,
    authority: json.code,
    paymentUrl: `https://api.payping.ir/v2/pay/gotoipg/${json.code}`,
    gateway: "payping",
  };
}

async function paypingVerify(input: PaymentVerifyInput, token: string): Promise<PaymentVerifyResult> {
  if (input.status !== "OK" && input.status !== "1" && input.status !== "true") {
    return { success: false, error: "پرداخت توسط کاربر لغو شد", gateway: "payping" };
  }

  const res = await fetch("https://api.payping.ir/v2/pay/verify", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `bearer ${token}`,
    },
    body: JSON.stringify({
      amount: input.amount,
      refId: input.refId,
      cardNumber: input.cardPan,
    }),
  });

  const json = await res.json().catch(() => ({}));
  if (!res.ok || !json.refId) {
    return {
      success: false,
      error: json.errorMessage || "خطا در تایید پرداخت پی‌پینگ",
      gateway: "payping",
    };
  }

  return {
    success: true,
    refId: String(json.refId),
    cardPan: json.cardNumber,
    gateway: "payping",
  };
}
