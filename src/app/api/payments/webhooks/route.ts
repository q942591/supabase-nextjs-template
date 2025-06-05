import { type NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

import { syncSubscription } from "~/api/payments/service";

// 创建Stripe客户端实例
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2025-05-28.basil" as any,
});

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return new NextResponse(
      JSON.stringify({ error: "Missing stripe-signature header" }),
      { status: 400 },
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET || "",
    );
  } catch (err: any) {
    return new NextResponse(
      JSON.stringify({ error: `Webhook Error: ${err.message}` }),
      { status: 400 },
    );
  }

  // 处理事件
  try {
    switch (event.type) {
      // 订阅相关事件
      case "customer.subscription.created":
        await handleSubscriptionCreated(
          event.data.object as Stripe.Subscription,
        );
        break;

      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(
          event.data.object as Stripe.Subscription,
        );
        break;

      case "customer.subscription.updated":
        await handleSubscriptionUpdated(
          event.data.object as Stripe.Subscription,
        );
        break;

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return new NextResponse(
      JSON.stringify({ error: "Webhook processing failed" }),
      { status: 500 },
    );
  }
}

// 处理订阅创建事件
async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  try {
    // 获取相关数据
    const customerId = subscription.customer as string;
    const customer = await stripe.customers.retrieve(customerId);

    if (!customer.deleted && "metadata" in customer) {
      const userId = customer.metadata?.userId;
      const productId = subscription.items.data[0]?.price.product as string;
      const status = subscription.status;
      const subscriptionId = subscription.id;

      if (userId) {
        await syncSubscription(
          userId,
          customerId,
          subscriptionId,
          productId,
          status,
        );
      } else {
        console.error("User ID not found in customer metadata");
      }
    }
  } catch (error) {
    console.error("Error handling subscription created:", error);
    throw error;
  }
}

// 处理订阅删除事件
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  try {
    // 获取相关数据
    const customerId = subscription.customer as string;
    const customer = await stripe.customers.retrieve(customerId);

    if (!customer.deleted && "metadata" in customer) {
      const userId = customer.metadata?.userId;
      const productId = subscription.items.data[0]?.price.product as string;
      const status = "canceled";
      const subscriptionId = subscription.id;

      if (userId) {
        await syncSubscription(
          userId,
          customerId,
          subscriptionId,
          productId,
          status,
        );
      } else {
        console.error("User ID not found in customer metadata");
      }
    }
  } catch (error) {
    console.error("Error handling subscription deleted:", error);
    throw error;
  }
}

// 处理订阅更新事件"aceled"
async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  try {
    // 获取相关数据
    const customerId = subscription.customer as string;
    const customer = await stripe.customers.retrieve(customerId);

    if (!customer.deleted && "metadata" in customer) {
      const userId = customer.metadata?.userId;
      const productId = subscription.items.data[0]?.price.product as string;
      const status = subscription.status;
      const subscriptionId = subscription.id;

      if (userId) {
        await syncSubscription(
          userId,
          customerId,
          subscriptionId,
          productId,
          status,
        );
      } else {
        console.error("User ID not found in customer metadata");
      }
    }
  } catch (error) {
    console.error("Error handling subscription updated:", error);
    throw error;
  }
}
