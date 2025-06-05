import Stripe from "stripe";

import { createClient } from "~/lib/supabase/server";
import {
  createCustomer as createCustomerService,
  createOrUpdateSubscription,
  getCustomerByUserId as getCustomerByUserIdService,
  getUserSubscriptions as getUserSubscriptionsService,
} from "~/lib/supabase/service";

// 创建Stripe客户端实例
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {});

/**
 * 取消订阅
 */
export async function cancelSubscription(subscriptionId: string) {
  try {
    const canceledSubscription =
      await stripe.subscriptions.cancel(subscriptionId);
    return canceledSubscription;
  } catch (error) {
    console.error("Error canceling subscription:", error);
    throw error;
  }
}

/**
 * 在Stripe中创建客户并保存到数据库
 */
export async function createCustomer(
  userId: string,
  name?: string,
  email?: string,
) {
  try {
    // 如果未提供电子邮件，则从用户信息中获取
    let userEmail = email;
    if (!userEmail) {
      const supabase = await createClient();
      const { data } = await supabase.auth.getUser();
      userEmail = data.user?.email || `${userId}@example.com`;
    }

    // 在Stripe创建客户
    const customer = await stripe.customers.create({
      email: userEmail,
      metadata: { userId },
      name,
    });

    // 将客户信息保存到数据库
    await createCustomerService({
      customerId: customer.id,
      userId,
    });

    return customer;
  } catch (error) {
    console.error("Error creating customer:", error);
    throw error;
  }
}

/**
 * 创建一次性支付
 */
export async function createPaymentIntent(
  amount: number,
  currency = "usd",
  customerId?: string,
  metadata?: Record<string, any>,
) {
  try {
    const paymentIntentData: any = {
      amount: Math.round(amount * 100),
      automatic_payment_methods: {
        enabled: true,
      },
      currency,
    };

    if (customerId) {
      paymentIntentData.customer = customerId;
    }

    if (metadata) {
      paymentIntentData.metadata = metadata;
    }

    const paymentIntent = await stripe.paymentIntents.create(paymentIntentData);

    return { clientSecret: paymentIntent.client_secret };
  } catch (error) {
    console.error("Error creating payment intent:", error);
    throw error;
  }
}

/**
 * 为特定产品创建Stripe结账会话
 */
export async function getCheckoutUrl(
  customerId: string,
  priceId: string,
): Promise<null | string> {
  try {
    // 创建Stripe结账会话
    const session = await stripe.checkout.sessions.create({
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3200"}/checkout/cancel`,
      customer: customerId,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3200"}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    });

    return session.url;
  } catch (error) {
    console.error("Error generating checkout URL:", error);
    return null;
  }
}

/**
 * 通过用户ID从数据库获取客户
 */
export async function getCustomerByUserId(userId: string) {
  return await getCustomerByUserIdService(userId);
}

/**
 * 从Stripe获取客户状态
 */
export async function getCustomerState(customerId: string) {
  try {
    const customer = await stripe.customers.retrieve(customerId);
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
    });

    return {
      customer,
      subscriptions: subscriptions.data,
    };
  } catch (error) {
    console.error("Error fetching customer state:", error);
    return null;
  }
}

/**
 * 从数据库获取用户订阅
 */
export async function getUserSubscriptions(userId: string) {
  return await getUserSubscriptionsService(userId);
}

/**
 * 检查用户是否有活跃订阅
 */
export async function hasActiveSubscription(userId: string): Promise<boolean> {
  const subscriptions = await getUserSubscriptions(userId);
  return subscriptions.some((sub) => sub.status === "active");
}

/**
 * 同步Stripe订阅数据到数据库
 */
export async function syncSubscription(
  userId: string,
  customerId: string,
  subscriptionId: string,
  productId: string,
  status: string,
) {
  try {
    await createOrUpdateSubscription({
      customerId,
      productId,
      status,
      subscriptionId,
      userId,
    });
    return true;
  } catch (error) {
    console.error("Error syncing subscription:", error);
    return false;
  }
}
