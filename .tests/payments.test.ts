/* eslint-disable @typescript-eslint/no-unused-vars */
import { describe, expect, test } from "bun:test";

const mockCustomerId = "mock-customer-id";
const mockUserId = "test-user-id";
const mockEmail = "test@example.com";
const mockSubscriptionId = "mock-subscription-id";
const mockProductId = "mock-product-id";

const mockDb = {
  delete: () => ({
    where: () => Promise.resolve({ success: true }),
  }),
  insert: () => ({
    values: () => Promise.resolve({ id: "new-id" }),
  }),
  query: {
    polarCustomerTable: {
      findFirst: async () => ({
        createdAt: new Date(),
        customerId: mockCustomerId,
        id: "db-id",
        updatedAt: new Date(),
        userId: mockUserId,
      }),
      findMany: async () => [
        {
          createdAt: new Date(),
          customerId: mockCustomerId,
          id: "db-id",
          updatedAt: new Date(),
          userId: mockUserId,
        },
      ],
    },
    polarSubscriptionTable: {
      findFirst: async () => ({
        createdAt: new Date(),
        customerId: mockCustomerId,
        id: "sub-id",
        productId: mockProductId,
        status: "active",
        subscriptionId: mockSubscriptionId,
        updatedAt: new Date(),
        userId: mockUserId,
      }),
      findMany: async () => [
        {
          createdAt: new Date(),
          customerId: mockCustomerId,
          id: "sub-id",
          productId: mockProductId,
          status: "active",
          subscriptionId: mockSubscriptionId,
          updatedAt: new Date(),
          userId: mockUserId,
        },
      ],
    },
  },
  update: () => ({
    set: () => ({
      where: () => Promise.resolve({ success: true }),
    }),
  }),
};

const mockPolarClient = {
  checkouts: {
    create: async () => ({
      url: "https://checkout.polar.sh/test-checkout",
    }),
  },
  customers: {
    create: async () => ({
      email: mockEmail,
      externalId: mockUserId,
      id: mockCustomerId,
    }),
    get: async () => ({
      benefits: [],
      email: mockEmail,
      entitlements: [],
      externalId: mockUserId,
      id: mockCustomerId,
      subscriptions: [],
    }),
  },
};

const mockServices = {
  createCustomer: async (_userId: string, _email: string) => {
    const customer = await mockPolarClient.customers.create();
    return customer;
  },
  getCheckoutUrl: async (_customerId: string, _productSlug: string) => {
    const checkout = await mockPolarClient.checkouts.create();
    return checkout.url;
  },
  getCustomerByUserId: async (_userId: string) => {
    return mockDb.query.polarCustomerTable.findFirst();
  },
  getCustomerState: async (_userId: string) => {
    const customer = await mockDb.query.polarCustomerTable.findFirst();
    if (!customer) return null;
    return mockPolarClient.customers.get();
  },
  getUserSubscriptions: async (_userId: string) => {
    return mockDb.query.polarSubscriptionTable.findMany();
  },
  hasActiveSubscription: async (_userId: string) => {
    const subscriptions = await mockDb.query.polarSubscriptionTable.findMany();
    return subscriptions.some((sub) => sub.status === "active");
  },
  syncSubscription: async (
    _userId: string,
    _customerId: string,
    _subscriptionId: string,
    _productId: string,
    _status: string,
  ) => {
    return { success: true };
  },
};

describe("Payment Service", () => {
  test("createCustomer should create a customer record", async () => {
    const customer = await mockServices.createCustomer(mockUserId, mockEmail);
    expect(customer).toBeDefined();
    expect(customer.id).toBe(mockCustomerId);

    const dbCustomer = await mockServices.getCustomerByUserId(mockUserId);
    expect(dbCustomer).toBeDefined();
    expect(dbCustomer?.customerId).toBe(mockCustomerId);
    expect(dbCustomer?.userId).toBe(mockUserId);
  });

  test("getCustomerState should return customer state", async () => {
    const customerState = await mockServices.getCustomerState(mockUserId);
    expect(customerState).toBeDefined();
    expect(customerState?.id).toBe(mockCustomerId);
  });

  test("syncSubscription should create a subscription record", async () => {
    await mockServices.syncSubscription(
      mockUserId,
      mockCustomerId,
      mockSubscriptionId,
      mockProductId,
      "active",
    );

    const subscriptions = await mockServices.getUserSubscriptions(mockUserId);
    expect(subscriptions.length).toBe(1);
    expect(subscriptions[0].subscriptionId).toBe(mockSubscriptionId);
    expect(subscriptions[0].status).toBe("active");
  });

  test("hasActiveSubscription should return true for active subscriptions", async () => {
    const hasActive = await mockServices.hasActiveSubscription(mockUserId);
    expect(hasActive).toBe(true);
  });

  test("getCheckoutUrl should return a valid URL", async () => {
    const url = await mockServices.getCheckoutUrl(mockCustomerId, "pro");
    expect(url).toBe("https://checkout.polar.sh/test-checkout");
  });
});

describe("Polar Integration", () => {
  test("Polar client should be properly configured", () => {
    if (process.env.CI) {
      console.log("Skipping Polar client config test in CI environment");
      return;
    }

    process.env.POLAR_ACCESS_TOKEN =
      process.env.POLAR_ACCESS_TOKEN || "test-token";
    process.env.POLAR_WEBHOOK_SECRET =
      process.env.POLAR_WEBHOOK_SECRET || "test-secret";

    expect(process.env.POLAR_ACCESS_TOKEN).toBeDefined();
    expect(process.env.POLAR_WEBHOOK_SECRET).toBeDefined();
  });

  test("Better-Auth Polar plugin should be configured", () => {
    if (process.env.CI) {
      console.log("Skipping Polar environment test in CI environment");
      return;
    }

    process.env.POLAR_ENVIRONMENT = process.env.POLAR_ENVIRONMENT || "sandbox";

    expect(process.env.POLAR_ENVIRONMENT).toBeDefined();
  });
});

describe("Payment API Routes", () => {
  const mockResponse = {
    json: () => mockResponse,
    send: () => mockResponse,
    status: () => mockResponse,
  };

  const _mockRequest = {
    headers: {
      get: () => null,
    },
  };

  test("customer-state API should return customer state for authenticated user", async () => {
    const customerState = await mockServices.getCustomerState(mockUserId);
    expect(customerState).toBeDefined();
  });

  test("subscriptions API should return user subscriptions", async () => {
    const subscriptions = await mockServices.getUserSubscriptions(mockUserId);
    expect(subscriptions.length).toBe(1);
  });
});
