"use client";

import {
  CardElement,
  Elements,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "~/ui/primitives/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/ui/primitives/card";
import { Input } from "~/ui/primitives/input";
import { Label } from "~/ui/primitives/label";

// 初始化Stripe - 使用正确的环境变量名称
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ""
);

// 商品数据
const products = [
  {
    description: "100%纯棉基础款T恤",
    id: 1,
    image: "https://placehold.co/300x200/e2e8f0/1e293b?text=T恤",
    name: "基础T恤",
    price: 25,
  },
  {
    description: "舒适保暖的连帽衫",
    id: 2,
    image: "https://placehold.co/300x200/e2e8f0/1e293b?text=连帽衫",
    name: "高级连帽衫",
    price: 45,
  },
  {
    description: "经典款牛仔裤",
    id: 3,
    image: "https://placehold.co/300x200/e2e8f0/1e293b?text=牛仔裤",
    name: "牛仔裤",
    price: 60,
  },
];

// 购物车项类型
interface CartItem {
  product: (typeof products)[0];
  quantity: number;
}

export default function PaymentTestPage() {
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState(10);
  const [currency, setCurrency] = useState("usd");
  const [priceId, setPriceId] = useState(""); // 清空默认价格ID，因为每个账户的价格ID都不同

  // 购物车状态
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  // 支付状态
  const [clientSecret, setClientSecret] = useState<null | string>(null);
  const [showPaymentForm, setShowPaymentForm] = useState(false);

  // 测试401未授权状态
  const testUnauthorized = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/payments/test");

      const data = (await response.json()) as { error?: string };
      toast.error(`状态码: ${response.status} - ${data.error || "未授权"}`);
    } catch (error) {
      console.error("测试错误:", error);
      toast.error(
        `测试失败: ${error instanceof Error ? error.message : String(error)}`
      );
    } finally {
      setLoading(false);
    }
  };

  // 处理一次性支付
  const handlePayment = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/payments/create-intent", {
        body: JSON.stringify({
          amount,
          currency,
        }),
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      });

      const data = (await response.json()) as {
        clientSecret?: string;
        error?: string;
      };
      if (!response.ok) {
        throw new Error(data.error || "支付创建失败");
      }

      // 设置客户端密钥并显示支付表单
      setClientSecret(data.clientSecret || "");
      setShowPaymentForm(true);
    } catch (error) {
      console.error("支付错误:", error);
      toast.error(
        `支付创建失败: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  // 处理订阅结账
  const handleSubscription = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/payments/create-checkout", {
        body: JSON.stringify({
          priceId,
        }),
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      });

      const data = (await response.json()) as {
        details?: string;
        error?: string;
        url?: string;
      };

      if (!response.ok) {
        const errorMsg = data.error || "结账会话创建失败";
        const detailsMsg = data.details ? `\n${data.details}` : "";
        throw new Error(`${errorMsg}${detailsMsg}`);
      }

      // 重定向到Stripe结账页面
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("未获取到结账URL");
      }
    } catch (error) {
      console.error("订阅错误:", error);
      toast.error(
        `订阅创建失败: ${
          error instanceof Error ? error.message : String(error)
        }`,
        {
          duration: 6000, // 显示更长时间以便阅读详细错误
        }
      );
    } finally {
      setLoading(false);
    }
  };

  // 添加商品到购物车
  const addToCart = (product: (typeof products)[0]) => {
    setCart((currentCart) => {
      // 检查商品是否已在购物车中
      const existingItem = currentCart.find(
        (item) => item.product.id === product.id
      );

      if (existingItem) {
        // 增加已有商品的数量
        return currentCart.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      // 添加新商品到购物车
      return [...currentCart, { product, quantity: 1 }];
    });

    toast.success(`已添加 ${product.name} 到购物车`);
  };

  // 从购物车移除商品
  const removeFromCart = (productId: number) => {
    setCart((currentCart) =>
      currentCart.filter((item) => item.product.id !== productId)
    );
    toast.info("已从购物车移除商品");
  };

  // 更新购物车中商品数量
  const updateQuantity = (productId: number, newQuantity: number) => {
    if (newQuantity < 1) return;

    setCart((currentCart) =>
      currentCart.map((item) =>
        item.product.id === productId
          ? { ...item, quantity: newQuantity }
          : item
      )
    );
  };

  // 计算购物车总价
  const calculateTotal = () => {
    return cart.reduce(
      (total, item) => total + item.product.price * item.quantity,
      0
    );
  };

  // 处理购物车结账
  const handleCartCheckout = async () => {
    if (cart.length === 0) {
      toast.error("购物车为空");
      return;
    }

    try {
      setIsCheckingOut(true);
      const response = await fetch("/api/payments/create-intent", {
        body: JSON.stringify({
          amount: calculateTotal(),
          currency,
          metadata: {
            cartItems: JSON.stringify(
              cart.map((item) => ({
                name: item.product.name,
                price: item.product.price,
                productId: item.product.id,
                quantity: item.quantity,
              }))
            ),
          },
        }),
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      });

      const data = (await response.json()) as {
        clientSecret?: string;
        error?: string;
      };

      if (!response.ok) {
        throw new Error(data.error || "支付创建失败");
      }

      if (!data.clientSecret) {
        throw new Error("未获取到客户端密钥");
      }

      // 设置客户端密钥并显示支付表单
      setClientSecret(data.clientSecret);
      setShowPaymentForm(true);
    } catch (error) {
      console.error("结账错误:", error);
      toast.error(
        `结账失败: ${error instanceof Error ? error.message : String(error)}`
      );
    } finally {
      setIsCheckingOut(false);
    }
  };

  // 支付成功处理
  const handlePaymentSuccess = () => {
    setClientSecret(null);
    setShowPaymentForm(false);
    setCart([]);
  };

  // 取消支付
  const handleCancelPayment = () => {
    setClientSecret(null);
    setShowPaymentForm(false);
  };

  return (
    <div className="container mx-auto py-10">
      <h1 className="mb-10 text-center text-3xl font-bold">支付测试</h1>

      {/* 支付表单模态框 */}
      {showPaymentForm && clientSecret && (
        <div
          className={`
          fixed inset-0 z-50 flex items-center justify-center bg-black/50
        `}
        >
          <div className="w-full max-w-md rounded-lg bg-white p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xl font-semibold">完成支付</h3>
              <button
                className={`
                  rounded-full p-1
                  hover:bg-gray-100
                `}
                onClick={handleCancelPayment}
                type="button"
              >
                ×
              </button>
            </div>

            {/* 注意：刷新Elements组件 */}
            <Elements
              options={{
                appearance: {
                  theme: "stripe",
                  variables: {
                    borderRadius: "4px",
                    colorBackground: "#ffffff",
                    colorDanger: "#df1b41",
                    colorPrimary: "#0570de",
                    colorText: "#30313d",
                    fontFamily: "Arial, sans-serif",
                    spacingUnit: "4px",
                  },
                },
                clientSecret,
              }}
              stripe={stripePromise}
            >
              <CheckoutForm
                clientSecret={clientSecret}
                onCancel={handleCancelPayment}
                onSuccess={handlePaymentSuccess}
              />
            </Elements>

            <div
              className={`
              mt-4 space-y-1 rounded-md bg-gray-50 p-3 text-sm text-gray-500
            `}
            >
              <p className="font-medium">测试卡信息:</p>
              <p>卡号: 4242 4242 4242 4242</p>
              <p>到期日: 任何未来日期 (例如 12/34)</p>
              <p>CVC: 任意三位数 (例如 123)</p>
            </div>
          </div>
        </div>
      )}

      {/* 商品购买部分 */}
      <div className="mb-16">
        <h2 className="mb-6 text-2xl font-semibold">商品购买</h2>

        <div className="flex flex-wrap gap-8">
          <div className="flex-1">
            <h3 className="mb-4 text-xl font-medium">商品列表</h3>
            <div
              className={`
                grid gap-6
                md:grid-cols-2
                lg:grid-cols-3
              `}
            >
              {products.map((product) => (
                <Card className="overflow-hidden" key={product.id}>
                  <img
                    alt={product.name}
                    className="h-48 w-full object-cover"
                    src={product.image}
                  />
                  <CardHeader className="p-4">
                    <CardTitle className="text-lg">{product.name}</CardTitle>
                    <CardDescription>{product.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <p className="text-lg font-bold">${product.price}</p>
                  </CardContent>
                  <CardFooter className="p-4 pt-0">
                    <Button
                      className="w-full"
                      onClick={() => addToCart(product)}
                    >
                      添加到购物车
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>

          <div
            className={`
              w-full
              md:w-1/3
            `}
          >
            <Card>
              <CardHeader>
                <CardTitle>购物车</CardTitle>
                <CardDescription>
                  {cart.length
                    ? `${cart.length}件商品，总计$${calculateTotal()}`
                    : "购物车为空"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {cart.length === 0 ? (
                  <p className="text-center text-muted-foreground">
                    购物车中没有商品
                  </p>
                ) : (
                  <div className="space-y-4">
                    {cart.map((item) => (
                      <div
                        className={`
                          flex items-center justify-between border-b pb-2
                        `}
                        key={item.product.id}
                      >
                        <div>
                          <h4 className="font-medium">{item.product.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            ${item.product.price} x {item.quantity}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            className="h-8 w-8"
                            onClick={() =>
                              updateQuantity(item.product.id, item.quantity - 1)
                            }
                            size="icon"
                            variant="outline"
                          >
                            -
                          </Button>
                          <span className="w-8 text-center">
                            {item.quantity}
                          </span>
                          <Button
                            className="h-8 w-8"
                            onClick={() =>
                              updateQuantity(item.product.id, item.quantity + 1)
                            }
                            size="icon"
                            variant="outline"
                          >
                            +
                          </Button>
                          <Button
                            className="h-8 w-8 text-red-500"
                            onClick={() => removeFromCart(item.product.id)}
                            size="icon"
                            variant="ghost"
                          >
                            ×
                          </Button>
                        </div>
                      </div>
                    ))}

                    <div className="border-t pt-4">
                      <div className="flex justify-between">
                        <span className="font-medium">总计</span>
                        <span className="font-bold">
                          ${calculateTotal().toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full"
                  disabled={cart.length === 0 || isCheckingOut}
                  onClick={handleCartCheckout}
                >
                  {isCheckingOut ? "处理中..." : "结账"}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>

      <div
        className={`
          grid gap-8
          md:grid-cols-2
        `}
      >
        {/* 测试401响应卡片 */}
        <Card>
          <CardHeader>
            <CardTitle>测试401响应</CardTitle>
            <CardDescription>测试API返回401未授权状态</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>点击下方按钮将触发一个返回401未授权状态的API请求</p>
          </CardContent>
          <CardFooter>
            <Button
              className="w-full"
              disabled={loading}
              onClick={testUnauthorized}
            >
              {loading ? "处理中..." : "测试401响应"}
            </Button>
          </CardFooter>
        </Card>

        {/* 一次性支付卡片 */}
        <Card>
          <CardHeader>
            <CardTitle>一次性支付</CardTitle>
            <CardDescription>测试Stripe单次支付功能</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="amount">金额</Label>
              <Input
                id="amount"
                min={1}
                onChange={(e) => setAmount(Number(e.target.value))}
                type="number"
                value={amount}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currency">货币</Label>
              <select
                className="w-full rounded-md border px-3 py-2"
                id="currency"
                onChange={(e) => setCurrency(e.target.value)}
                value={currency}
              >
                <option value="usd">美元 (USD)</option>
                <option value="eur">欧元 (EUR)</option>
                <option value="gbp">英镑 (GBP)</option>
                <option value="cny">人民币 (CNY)</option>
              </select>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              className="w-full"
              disabled={loading}
              onClick={handlePayment}
            >
              {loading ? "处理中..." : "支付"}
            </Button>
          </CardFooter>
        </Card>

        {/* 订阅卡片 */}
        <Card>
          <CardHeader>
            <CardTitle>订阅支付</CardTitle>
            <CardDescription>测试Stripe订阅功能</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="priceId">价格ID</Label>
              <Input
                id="priceId"
                onChange={(e) => setPriceId(e.target.value)}
                placeholder="Stripe价格ID"
                value={priceId}
              />
              <p className="text-sm text-muted-foreground">
                在Stripe仪表板创建产品和价格后，输入价格ID（以price_开头）
              </p>
              <div
                className={`
                  mt-2 rounded-md bg-yellow-50 p-3 text-sm text-yellow-800
                `}
              >
                <strong>注意：</strong>{" "}
                您必须在Stripe仪表板中创建自己的产品和价格，然后使用您自己的价格ID。每个Stripe账户的价格ID都是唯一的。
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              className="w-full"
              disabled={loading}
              onClick={handleSubscription}
            >
              {loading ? "处理中..." : "订阅"}
            </Button>
          </CardFooter>
        </Card>
      </div>

      <div className="mt-10 rounded-lg bg-muted p-6">
        <h2 className="mb-4 text-xl font-semibold">使用说明</h2>
        <ul className="list-disc space-y-2 pl-5">
          <li>确保已在Stripe仪表板中设置了产品和价格</li>
          <li>配置了正确的Stripe API密钥和Webhook密钥</li>
          <li>测试模式下使用Stripe测试卡号: 4242 4242 4242 4242</li>
          <li>过期日期可使用任何未来日期，CVC任意3位数</li>
          <li>订阅测试会创建实际的测试订阅，可在Stripe仪表板查看</li>
          <li>商品购买功能仅为演示，实际支付通过Stripe处理</li>
        </ul>
      </div>
    </div>
  );
}

// 支付表单组件
function CheckoutForm({
  clientSecret,
  onCancel,
  onSuccess,
}: {
  clientSecret: string;
  onCancel: () => void;
  onSuccess: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState<null | string>(null);
  const [cardholderName, setCardholderName] = useState("");
  const [email, setEmail] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!stripe || !elements) {
      setPaymentError("Stripe尚未加载完成，请稍后再试");
      return;
    }

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      setPaymentError("卡元素未找到");
      return;
    }

    if (!cardholderName) {
      setPaymentError("请输入持卡人姓名");
      return;
    }

    setIsProcessing(true);
    setPaymentError(null);

    try {
      const { error, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: {
            billing_details: {
              email: email || undefined,
              name: cardholderName,
            },
            card: cardElement,
          },
        }
      );

      if (error) {
        setPaymentError(error.message || "支付失败");
        toast.error(`支付失败: ${error.message}`);
      } else if (paymentIntent.status === "succeeded") {
        toast.success("支付成功！", { duration: 5000 });
        onSuccess();
      } else {
        setPaymentError(`支付状态: ${paymentIntent.status}`);
        toast.error(`支付未完成: ${paymentIntent.status}`);
      }
    } catch (err) {
      console.error("支付处理错误:", err);
      setPaymentError("支付处理过程中发生错误");
      toast.error("支付处理过程中发生错误");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <Label htmlFor="name">持卡人姓名</Label>
        <Input
          id="name"
          onChange={(e) => setCardholderName(e.target.value)}
          placeholder="请输入持卡人姓名"
          required
          value={cardholderName}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">电子邮箱 (可选)</Label>
        <Input
          id="email"
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          type="email"
          value={email}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="card-element">卡信息</Label>
        <div className="rounded-md border p-3" style={{ minHeight: "40px" }}>
          <CardElement
            id="card-element"
            options={{
              hidePostalCode: true,
              style: {
                base: {
                  "::placeholder": {
                    color: "#aab7c4",
                  },
                  color: "#424770",
                  fontFamily: "Arial, sans-serif",
                  fontSize: "16px",
                  iconColor: "#666EE8",
                },
                empty: {
                  color: "#aab7c4",
                },
                invalid: {
                  color: "#9e2146",
                  iconColor: "#fa755a",
                },
              },
            }}
          />
        </div>
        <p className="text-xs text-muted-foreground">
          输入信用卡信息，所有字段都是必填的
        </p>
      </div>

      {!stripe && (
        <div className="rounded-md bg-yellow-50 p-3 text-sm text-yellow-800">
          正在加载支付组件，请稍候...
        </div>
      )}

      {paymentError && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">
          {paymentError}
        </div>
      )}

      <div className="flex gap-2">
        <Button
          className="flex-1"
          disabled={isProcessing}
          onClick={onCancel}
          type="button"
          variant="outline"
        >
          取消
        </Button>
        <Button
          className="flex-1"
          disabled={!stripe || isProcessing}
          type="submit"
        >
          {isProcessing ? "处理中..." : "确认支付"}
        </Button>
      </div>
    </form>
  );
}
