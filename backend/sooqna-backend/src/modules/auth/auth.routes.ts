import { Router } from "express";
import rateLimit from "express-rate-limit";
import { verifyFirebaseToken } from "../../middleware/verifyFirebaseToken";
import { adminAuth } from "../../config/firebaseAdmin";
import { env } from "../../config/env";
import { sendError, sendSuccess } from "../../shared/contracts/api";

export const authRouter = Router();

const resendVerificationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
});

const recaptchaLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
});

authRouter.get("/session", verifyFirebaseToken, (req, res) => {
  res.json({
    success: true,
    user: {
      uid: req.authUser?.uid ?? null,
      email: req.authUser?.email ?? null,
      emailVerified: req.authUser?.email_verified ?? false,
    },
  });
});

authRouter.post("/resend-verification", verifyFirebaseToken, resendVerificationLimiter, async (req, res) => {
  try {
    const email = req.authUser?.email;
    if (!email) {
      sendError(res, 400, "INVALID_EMAIL", "Email is missing from authenticated user.");
      return;
    }

    const user = await adminAuth.getUser(req.authUser!.uid);
    if (user.emailVerified) {
      sendSuccess(res, { allowed: false, alreadyVerified: true });
      return;
    }

    sendSuccess(res, { allowed: true, alreadyVerified: false });
  } catch (error) {
    sendError(
      res,
      500,
      "VERIFICATION_RESEND_POLICY_FAILED",
      "Failed to validate verification resend policy.",
      error instanceof Error ? error.message : String(error)
    );
  }
});

authRouter.post("/recaptcha/verify", recaptchaLimiter, async (req, res) => {
  try {
    if (!env.recaptchaEnabled) {
      sendSuccess(res, { verified: true, bypassed: true });
      return;
    }

    if (!env.recaptchaSecretKey) {
      sendError(res, 500, "RECAPTCHA_NOT_CONFIGURED", "reCAPTCHA secret is not configured.");
      return;
    }

    const token = typeof req.body?.token === "string" ? req.body.token.trim() : "";
    if (!token) {
      sendError(res, 400, "RECAPTCHA_TOKEN_REQUIRED", "reCAPTCHA token is required.");
      return;
    }

    const response = await fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        secret: env.recaptchaSecretKey,
        response: token,
      }),
    });
    const result = (await response.json()) as {
      success?: boolean;
      score?: number;
      action?: string;
      "error-codes"?: string[];
    };

    if (!result.success) {
      sendError(res, 403, "RECAPTCHA_FAILED", "reCAPTCHA verification failed.", result["error-codes"]);
      return;
    }

    sendSuccess(res, {
      verified: true,
      score: result.score ?? null,
      action: result.action ?? null,
    });
  } catch (error) {
    sendError(
      res,
      500,
      "RECAPTCHA_VERIFY_FAILED",
      "reCAPTCHA verification failed unexpectedly.",
      error instanceof Error ? error.message : String(error)
    );
  }
});

