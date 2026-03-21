import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyCallback, decodeData } from "@/lib/liqpay";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const data = formData.get("data") as string;
    const signature = formData.get("signature") as string;

    if (!data || !signature) {
      return NextResponse.json(
        { error: "Відсутні дані платежу" },
        { status: 400 }
      );
    }

    if (!verifyCallback(data, signature)) {
      console.error("LiqPay callback: invalid signature");
      return NextResponse.json(
        { error: "Невірний підпис" },
        { status: 403 }
      );
    }

    const decoded = decodeData(data);
    const liqpayStatus = decoded.status as string;
    const liqpayOrderId = decoded.order_id as string;
    const liqpayPaymentId = (decoded.payment_id as string) ?? null;

    const payment = await prisma.payment.findUnique({
      where: { liqpayOrderId },
      include: { documentRequest: true },
    });

    if (!payment) {
      console.error(
        `LiqPay callback: payment not found for order ${liqpayOrderId}`
      );
      return NextResponse.json(
        { error: "Платіж не знайдено" },
        { status: 404 }
      );
    }

    if (liqpayStatus === "success" || liqpayStatus === "sandbox") {
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: "SUCCESS",
          liqpayPaymentId: liqpayPaymentId
            ? String(liqpayPaymentId)
            : undefined,
          liqpayStatus,
        },
      });

      await prisma.documentRequest.update({
        where: { id: payment.documentRequestId },
        data: { status: "PAID" },
      });

      // Trigger document generation pipeline
      triggerGenerationPipeline(payment.documentRequestId).catch((err) => {
        console.error("Generation pipeline failed:", err);
      });
    } else {
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: "FAILURE",
          liqpayStatus,
        },
      });

      await prisma.documentRequest.update({
        where: { id: payment.documentRequestId },
        data: { status: "FAILED" },
      });
    }

    return NextResponse.json({ status: "ok" });
  } catch (error) {
    console.error("Payment callback error:", error);
    return NextResponse.json(
      { error: "Помилка обробки callback" },
      { status: 500 }
    );
  }
}

async function triggerGenerationPipeline(documentRequestId: string) {
  const payload = JSON.stringify({ documentRequestId });
  const headers = { "Content-Type": "application/json" };

  // Step 1: Generate AI text
  const genRes = await fetch(`${BASE_URL}/api/generate`, {
    method: "POST",
    headers,
    body: payload,
  });
  if (!genRes.ok) {
    throw new Error(`AI generation failed: ${genRes.status}`);
  }

  // Step 2: Set status to PENDING_REVIEW (lawyer will review, edit, approve)
  await prisma.documentRequest.update({
    where: { id: documentRequestId },
    data: { status: "PENDING_REVIEW" },
  });

  // Step 3: Notify lawyer (non-critical)
  try {
    const docReq = await prisma.documentRequest.findUnique({
      where: { id: documentRequestId },
      include: { template: true },
    });
    if (docReq) {
      const { notifyLawyerNewRequest } = await import(
        "@/lib/email/notify-lawyer"
      );
      const partyData = docReq.partyData as Record<string, any>;
      const plaintiffData = partyData?.plaintiff as
        | Record<string, string>
        | undefined;
      await notifyLawyerNewRequest({
        requestId: documentRequestId,
        documentTitle: docReq.template.title,
        clientEmail: docReq.contactEmail,
        clientName: plaintiffData?.fullName ?? "Клієнт",
      });
    }
  } catch (notifyError) {
    console.error("Lawyer notification failed (non-critical):", notifyError);
  }
}
