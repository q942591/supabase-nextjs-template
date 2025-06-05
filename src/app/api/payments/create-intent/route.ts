import { type NextRequest, NextResponse } from "next/server";

import { createPaymentIntent } from "~/api/payments/service";
import { getCurrentUser } from "~/lib/auth";

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();

  if (!user) {
    return new NextResponse(
      JSON.stringify({ error: "Authentication required" }),
      { status: 401 },
    );
  }

  try {
    const body = await request.json();
    const { amount, currency = "usd", metadata = {} } = body;

    if (!amount || isNaN(amount)) {
      return new NextResponse(
        JSON.stringify({ error: "Valid amount is required" }),
        { status: 400 },
      );
    }

    // 添加用户ID到元数据
    const enhancedMetadata = {
      ...metadata,
      userId: user.id,
    };

    const paymentIntent = await createPaymentIntent(
      amount,
      currency,
      undefined, // 可以选择性地添加customerId
      enhancedMetadata,
    );

    return NextResponse.json(paymentIntent);
  } catch (error) {
    console.error("Error creating payment intent:", error);
    return new NextResponse(
      JSON.stringify({ error: "Failed to create payment intent" }),
      { status: 500 },
    );
  }
}
