import express from "express";

import {
    deductCredits,
    refundCredits,
 login,
 logout,
 updatePlan
}
from "../controllers/auth.controllers.js";
import { requireInternalSecret } from "../middlewares/internal.middleware.js";

const router =
express.Router();

router.post("/login",login);
router.get("/logout",logout);
router.patch(
    "/internal/update-plan",
    requireInternalSecret,
    updatePlan
);
router.patch(

"/internal/deduct-credits",

requireInternalSecret,

deductCredits

);

router.patch(

"/internal/refund-credits",

requireInternalSecret,

refundCredits

);


export default router;