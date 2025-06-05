import { type NextRequest, NextResponse } from "next/server";

import {
  cancelSubscription,
  getUserSubscriptions,
} from "~/api/payments/service";
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
    const { subscriptionId } = body;

    if (!subscriptionId) {
      return new NextResponse(
        JSON.stringify({ error: "Subscription ID is required" }),
        { status: 400 },
      );
    }

    // 验证该订阅属于当前用户
    const userSubscriptions = await getUserSubscriptions(user.id);
    const subscription = userSubscriptions.find(
      (sub) => sub.subscriptionId === subscriptionId,
    );

    if (!subscription) {
      return new NextResponse(
        JSON.stringify({ error: "Subscription not found" }),
        { status: 404 },
      );
    }

    // 取消订阅
    await cancelSubscription(subscriptionId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error canceling subscription:", error);
    return new NextResponse(
      JSON.stringify({ error: "Failed to cancel subscription" }),
      { status: 500 },
    );
  }
}
