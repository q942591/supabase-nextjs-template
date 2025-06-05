import { createClient, createServiceClient } from "./server";

// Upload related types
export interface MediaUpload {
  createdAt: string;
  id: string;
  key: string;
  type: string;
  updatedAt: string;
  url: string;
  userId: string;
}

// Payment related types
export interface StripeCustomer {
  createdAt: string;
  customerId: string;
  id: string;
  updatedAt: string;
  userId: string;
}

export interface StripeSubscription {
  createdAt: string;
  customerId: string;
  id: string;
  productId: string;
  status: string;
  subscriptionId: string;
  updatedAt: string;
  userId: string;
}

export async function createCustomer(
  customer: Omit<StripeCustomer, "createdAt" | "id" | "updatedAt">,
): Promise<StripeCustomer> {
  const supabase = await createServiceClient();

  const customerData = {
    ...customer,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("stripe_customers")
    .insert(customerData)
    .select()
    .single();

  if (error) {
    console.error("Error creating customer:", error);
    throw error;
  }

  return data;
}

export async function createOrUpdateSubscription(
  subscription: Omit<StripeSubscription, "createdAt" | "id" | "updatedAt">,
): Promise<StripeSubscription> {
  const supabase = await createServiceClient();

  // Check if subscription exists
  const { data: existing } = await supabase
    .from("stripe_subscriptions")
    .select("*")
    .eq("subscriptionId", subscription.subscriptionId)
    .single();
  if (existing) {
    // Update existing subscription
    const { data, error } = await supabase
      .from("stripe_subscriptions")
      .update({
        ...subscription,
        updatedAt: new Date().toISOString(),
      })
      .eq("subscriptionId", subscription.subscriptionId)
      .select()
      .single();

    if (error) {
      console.error("Error updating subscription:", error);
      throw error;
    }

    return data;
  }
  // Create new subscription
  const subscriptionData = {
    ...subscription,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("stripe_subscriptions")
    .insert(subscriptionData)
    .select()
    .single();

  if (error) {
    console.error("Error creating subscription:", error);
    throw error;
  }

  return data;
}

// Upload service functions
export async function createUpload(
  upload: Omit<MediaUpload, "createdAt" | "id" | "updatedAt">,
): Promise<MediaUpload> {
  const supabase = await createClient();

  const uploadData = {
    ...upload,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("uploads")
    .insert(uploadData)
    .select()
    .single();
  if (error) {
    console.error("Error creating upload:", error);
    throw error;
  }

  return data;
}

// Delete file from Supabase Storage
export async function deleteFile(
  key: string,
  bucket = "uploads",
): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase.storage.from(bucket).remove([key]);

  if (error) {
    console.error("Error deleting file:", error);
    throw error;
  }
}

export async function deleteUpload(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("uploads").delete().eq("id", id);

  if (error) {
    console.error("Error deleting upload:", error);
    throw error;
  }
}

// Payment service functions
export async function getCustomerByUserId(
  userId: string,
): Promise<null | StripeCustomer> {
  const supabase = await createServiceClient();
  const { data, error } = await supabase
    .from("stripe_customers")
    .select("*")
    .eq("userId", userId)
    .single();

  if (error) {
    if (error.code !== "PGRST116") {
      console.error("Error getting customer:", error);
      throw error;
    }
    return null;
  }

  return data;
}

export async function getUserSubscriptions(
  userId: string,
): Promise<StripeSubscription[]> {
  const supabase = await createServiceClient();

  const { data, error } = await supabase
    .from("stripe_subscriptions")
    .select("*")
    .eq("userId", userId)
    .order("createdAt", { ascending: false });

  if (error) {
    console.error("Error getting user subscriptions:", error);
    throw error;
  }

  return data || [];
}

export async function getUserUploads(userId: string): Promise<MediaUpload[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("uploads")
    .select("*")
    .eq("userId", userId)
    .order("createdAt", { ascending: false });

  if (error) {
    console.error("Error getting user uploads:", error);
    throw error;
  }

  return data || [];
}

// Upload file to Supabase Storage
export async function uploadFile(
  file: File,
  bucket = "uploads",
): Promise<{ key: string; url: string }> {
  const supabase = await createClient();

  const fileExt = file.name.split(".").pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(fileName, file);

  if (uploadError) {
    console.error("Error uploading file:", uploadError);
    throw uploadError;
  }

  const { data: publicUrlData } = await supabase.storage
    .from(bucket)
    .getPublicUrl(fileName);

  return {
    key: fileName,
    url: publicUrlData.publicUrl,
  };
}
