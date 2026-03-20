import crypto from "crypto";

const LIQPAY_PUBLIC_KEY = process.env.LIQPAY_PUBLIC_KEY!;
const LIQPAY_PRIVATE_KEY = process.env.LIQPAY_PRIVATE_KEY!;

export function createPaymentData(params: {
  orderId: string;
  amount: number;
  description: string;
  resultUrl: string;
  serverUrl: string;
}) {
  const jsonData = {
    public_key: LIQPAY_PUBLIC_KEY,
    version: "3",
    action: "pay",
    amount: params.amount,
    currency: "UAH",
    description: params.description,
    order_id: params.orderId,
    result_url: params.resultUrl,
    server_url: params.serverUrl,
  };

  const data = Buffer.from(JSON.stringify(jsonData)).toString("base64");
  const signature = crypto
    .createHash("sha1")
    .update(LIQPAY_PRIVATE_KEY + data + LIQPAY_PRIVATE_KEY)
    .digest("base64");

  return { data, signature };
}

export function verifyCallback(
  data: string,
  receivedSignature: string
): boolean {
  const expectedSignature = crypto
    .createHash("sha1")
    .update(LIQPAY_PRIVATE_KEY + data + LIQPAY_PRIVATE_KEY)
    .digest("base64");
  return expectedSignature === receivedSignature;
}

export function decodeData(data: string): Record<string, unknown> {
  return JSON.parse(Buffer.from(data, "base64").toString("utf-8"));
}
