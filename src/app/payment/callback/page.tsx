export const runtime = "edge";

import PaymentCallbackClient from "./PaymentCallbackClient";

export default async function PaymentCallbackPage({ searchParams }: { searchParams: Promise<{ status?: string; refId?: string; type?: string; error?: string }> }) {
  const params = await searchParams;
  return (
    <PaymentCallbackClient
      status={params.status || null}
      refId={params.refId || null}
      type={params.type || null}
      error={params.error || null}
    />
  );
}
