import { type NextRequest, NextResponse } from "next/server";

import { getCheckoutUrl, getCustomerByUserId } from "~/api/payments/service";
import { createCustomer } from "~/api/payments/service";
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
    const body = (await request.json()) as { priceId?: string };
    const { priceId } = body;

    if (!priceId) {
      return new NextResponse(
        JSON.stringify({ error: "Price ID is required" }),
        { status: 400 },
      );
    }

    // 获取或创建客户
    let customer = await getCustomerByUserId(user.id);

    if (!customer) {
      // 如果用户没有关联的客户，创建一个
      await createCustomer(
        user.id,
        user.user_metadata?.name || user.email?.split("@")[0],
        user.email,
      );

      // 获取新创建的客户记录
      customer = await getCustomerByUserId(user.id);

      if (!customer) {
        throw new Error("Failed to create customer");
      }
    }

    // 创建结账会话URL
    try {
      const checkoutUrl = await getCheckoutUrl(customer.customerId, priceId);

      if (!checkoutUrl) {
        return new NextResponse(
          JSON.stringify({ error: "Failed to create checkout session" }),
          { status: 500 },
        );
      }

      return NextResponse.json({ url: checkoutUrl });
    } catch (checkoutError: any) {
      console.error("Error creating checkout session:", checkoutError);

      // 提供更详细的错误信息
      const errorMessage =
        checkoutError.message || "Failed to create checkout session";
      const errorDetails = checkoutError.code
        ? `Error code: ${checkoutError.code}. ${checkoutError.type === "StripeInvalidRequestError" ? "Please check your Stripe price ID is correct and belongs to an active product." : ""}`
        : "";

      return new NextResponse(
        JSON.stringify({
          details: errorDetails,
          error: errorMessage,
        }),
        { status: 400 },
      );
    }
  } catch (error) {
    console.error("Error processing checkout request:", error);
    return new NextResponse(
      JSON.stringify({ error: "Failed to process checkout request" }),
      { status: 500 },
    );
  }
}
