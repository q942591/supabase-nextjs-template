import { Polar } from "@polar-sh/sdk";
import { v4 as uuidv4 } from "uuid";

import { createClient } from "~/lib/supabase/server";
import {
  createCustomer as createCustomerService,
  createOrUpdateSubscription,
  getCustomerByUserId as getCustomerByUserIdService,
  getUserSubscriptions as getUserSubscriptionsService
} from "~/lib/supabase/service";

const polarClient = new Polar({
  accessToken: process.env.POLAR_ACCESS_TOKEN,
  server: (process.env.POLAR_ENVIRONMENT as "production" | "sandbox") || "production",
});

/**
 * Create a new customer in Polar and save to database
 */
export async function createCustomer(userId: string, name?: string, email?: string) {
  try {
    // Get user to retrieve email if not provided
    if (!email) {
      const supabase = await createClient();
      const { data } = await supabase.auth.getUser();
      email = data.user?.email || userId + '@example.com'; // 使用默认邮箱作为后备
    }

    const customer = await polarClient.customers.create({
      email,
      externalId: userId,
      name,
    });

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
 * Get checkout URL for a specific product
 */
export async function getCheckoutUrl(customerId: string, productSlug: string): Promise<null | string> {
  try {
    const checkout = await polarClient.checkouts.create({
      customerId,
      products: [productSlug],
    });
    return checkout.url;
  } catch (error) {
    console.error("Error generating checkout URL:", error);
    return null;
  }
}

/**
 * Get a Polar customer by user ID from the database
 */
export async function getCustomerByUserId(userId: string) {
  return await getCustomerByUserIdService(userId);
}

/**
 * Get customer state from Polar API
 */
export async function getCustomerState(userId: string) {
  const customer = await getCustomerByUserId(userId);

  if (!customer) {
    return null;
  }

  try {
    const customerState = await polarClient.customers.get({ id: customer.customerId });
    return customerState;
  } catch (error) {
    console.error("Error fetching customer state:", error);
    return null;
  }
}

/**
 * Get user subscriptions from the database
 */
export async function getUserSubscriptions(userId: string) {
  return await getUserSubscriptionsService(userId);
}

/**
 * Check if a user has an active subscription
 */
export async function hasActiveSubscription(userId: string): Promise<boolean> {
  const subscriptions = await getUserSubscriptions(userId);
  return subscriptions.some(sub => sub.status === "active");
}

/**
 * Sync subscription data between Polar and our database
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
  } catch (error) {
    console.error("Error syncing subscription:", error);
    throw error;
  }
}
