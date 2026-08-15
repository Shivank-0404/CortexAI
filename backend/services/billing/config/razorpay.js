import Razorpay from "razorpay";
import dotenv from "dotenv";

dotenv.config();

const keyId = process.env.RAZORPAY_KEY_ID;
const keySecret = process.env.RAZORPAY_KEY_SECRET;

const isMockRazorpay = !keyId || keyId.startsWith("add ") || !keySecret || keySecret.startsWith("add ");

let razorpayInstance;
if (isMockRazorpay) {
  razorpayInstance = {
    orders: {
      create: async (options) => {
        console.log("[Mock Mode] Mocking Razorpay order creation", options);
        return {
          id: `order_mock_${Math.random().toString(36).substring(7)}`,
          amount: options.amount,
          currency: options.currency || "INR",
          receipt: options.receipt,
          status: "created"
        };
      }
    }
  };
} else {
  razorpayInstance = new Razorpay({
    key_id: keyId,
    key_secret: keySecret
  });
}

export default razorpayInstance;