export const chatbotKnowledge = [
  {
    keywords: [
      "product",
      "products",
      "cracker",
      "crackers",
      "pattasu",
      "items",
      "porul",
      "enna products",
      "enna pattasu",
    ],
    answer:
      "Namma Japan Pattasu website-la available products-ai Products page-la paakalam. Price, stock, category details ellam ange irukum.",
  },
  {
    keywords: [
      "category",
      "categories",
      "type",
      "types",
      "vagai",
      "enna category",
    ],
    answer:
      "Categories page-la different pattasu types-ai browse pannalam.",
  },
  {
    keywords: [
      "brand",
      "brands",
      "company",
      "entha brand",
    ],
    answer:
      "Brands page-la available pattasu brands-ai paakalam.",
  },
  {
    keywords: [
      "delivery",
      "shipping",
      "delivery charge",
      "delivery evlo",
      "shipping charge",
      "veetuku varuma",
    ],
    answer:
      "Order value base panni delivery charge calculate aagum. Eligible orders-ku free delivery kidaikum.",
  },
  {
    keywords: [
      "cart",
      "add to cart",
      "cart epdi",
      "cart la add",
    ],
    answer:
      "Product page-la Add to Cart click panni, Cart page-la quantity review pannitu checkout-ku pogalam.",
  },
  {
    keywords: [
      "checkout",
      "order place",
      "place order",
      "epdi order",
      "buy",
      "purchase",
    ],
    answer:
      "Cart-la products add pannitu Checkout page-la address fill panni payment complete panna order place aagum.",
  },
  {
    keywords: [
      "payment",
      "razorpay",
      "upi",
      "card",
      "pay",
      "payment epdi",
    ],
    answer:
      "Payment Razorpay moolama secure-ah process aagum. UPI, card and available payment options use pannalam.",
  },
  {
    keywords: [
      "order",
      "orders",
      "my order",
      "order status",
      "track",
      "tracking",
      "order enga",
    ],
    answer:
      "Login pannitu My Orders page-la order status and tracking details paakalam.",
  },
  {
    keywords: [
      "cancel",
      "cancellation",
      "order cancel",
      "cancel epdi",
    ],
    answer:
      "Order current status allow pannina My Orders page-la cancel panna mudiyum.",
  },
  {
    keywords: [
      "refund",
      "money back",
      "refund eppo",
      "amount return",
    ],
    answer:
      "Refund approved aana payment method-ku process aagum. Refund time bank or payment provider base-la vary aagalam.",
  },
  {
    keywords: [
      "login",
      "signin",
      "sign in",
      "login epdi",
    ],
    answer:
      "Email-password, Google, illa mobile OTP use panni login pannalam.",
  },
  {
    keywords: [
      "otp",
      "otp varala",
      "otp not received",
      "sms varala",
      "phone login",
    ],
    answer:
      "Mobile number correct-ah enter pannunga. Konjam wait pannitu Resend OTP use pannunga.",
  },
  {
    keywords: [
      "wishlist",
      "favourite",
      "favorite",
      "save product",
    ],
    answer:
      "Pidicha products-ai Wishlist-la save panni later view pannalam.",
  },
  {
    keywords: [
      "stock",
      "available",
      "availability",
      "iruka",
      "stock iruka",
    ],
    answer:
      "Current stock details product card or product page-la kaatappadum.",
  },
  {
    keywords: [
      "offer",
      "offers",
      "discount",
      "sale",
      "offer iruka",
    ],
    answer:
      "Current offers and discounts product pages or home page-la display aagum.",
  },
  {
    keywords: [
      "contact",
      "support",
      "help",
      "customer care",
      "contact number",
    ],
    answer:
      "Customer support details website contact section-la irukum.",
  },
  {
    keywords: [
      "hello",
      "hi",
      "hey",
      "vanakkam",
      "hai",
    ],
    answer:
      "Vanakkam! Japan Pattasu pathi enna help venum?",
  },
];

export const getChatbotReply = (message) => {
  const normalizedMessage = message
    .toLowerCase()
    .trim();

  const matchedItem =
    chatbotKnowledge.find((item) =>
      item.keywords.some((keyword) =>
        normalizedMessage.includes(
          keyword.toLowerCase()
        )
      )
    );

  if (matchedItem) {
    return matchedItem.answer;
  }

  return "Products, delivery, cart, checkout, payment, orders, refund, login, OTP pathi ketkalam.";
};