import { NextRequest, NextResponse } from "next/server";
import { z } from "zod/v4";
import { prisma } from "@/lib/prisma";
import { createPaymentData } from "@/lib/liqpay";

const createPaymentBodySchema = z.object({
  documentRequestId: z.string().min(1),
});

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const parsed = createPaymentBodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Невірні дані", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const { documentRequestId } = parsed.data;

    const documentRequest = await prisma.documentRequest.findUnique({
      where: { id: documentRequestId },
      include: { template: true },
    });

    if (!documentRequest) {
      return NextResponse.json(
        { error: "Запит на документ не знайдено" },
        { status: 404 }
      );
    }

    const liqpayOrderId = `pay_${documentRequestId}_${Date.now()}`;

    const payment = await prisma.payment.create({
      data: {
        documentRequestId,
        userId: documentRequest.userId,
        amount: documentRequest.template.price,
        status: "PENDING",
        liqpayOrderId,
      },
    });

    const { data, signature } = createPaymentData({
      orderId: liqpayOrderId,
      amount: documentRequest.template.price,
      description: `Оплата документу: ${documentRequest.template.title}`,
      resultUrl: `${BASE_URL}/payment/success?requestId=${documentRequestId}`,
      serverUrl: `${BASE_URL}/api/payment/callback`,
    });

    await prisma.documentRequest.update({
      where: { id: documentRequestId },
      data: { status: "PENDING_PAYMENT" },
    });

    return NextResponse.json({
      data,
      signature,
      orderId: payment.liqpayOrderId,
    });
  } catch (error) {
    console.error("Failed to create payment:", error);
    return NextResponse.json(
      { error: "Не вдалося створити платіж" },
      { status: 500 }
    );
  }
}
