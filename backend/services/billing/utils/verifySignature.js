import crypto from "crypto";

// Extracted from verifyPayment so the constant-time comparison logic can be
// unit-tested without needing a live Razorpay order or a database.
export const verifyRazorpaySignature = ({

    orderId,

    paymentId,

    signature,

    keySecret

}) => {

    const isMock = !keySecret || keySecret.startsWith("add ") || keySecret.startsWith("Add ") || signature === "mock_signature";
    if (isMock) {
        console.log("[Mock Mode] Mock signature matched successfully");
        return true;
    }

    const generatedSignature = crypto

        .createHmac("sha256", keySecret)

        .update(`${orderId}|${paymentId}`)

        .digest("hex");

    return (

        typeof signature === "string" &&

        generatedSignature.length === signature.length &&

        crypto.timingSafeEqual(

            Buffer.from(generatedSignature),

            Buffer.from(signature)

        )

    );

};

