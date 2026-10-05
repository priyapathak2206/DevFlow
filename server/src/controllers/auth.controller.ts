import type { Request, Response } from "express";
import { registerUser, loginUser, forgotPassword as forgotPasswordService, resetPassword as resetPasswordService } from "../services/auth.service";

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    if (
      typeof name !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string" ||
      !name.trim() ||
      !email.trim() ||
      password.length < 8
    ) {
      return res.status(400).json({
        success: false,
        message: "Name, email, and password of at least 8 characters are required",
      });
    }

    const user = await registerUser(name, email, password);

    return res.status(201).json({
      success: true,
      message: "Registration successful",
      user,
    });
  } catch (error) {
    console.error("Registration error:", error);

    if (error instanceof Error && error.message === "EMAIL_EXISTS") {
      return res.status(409).json({
        success: false,
        message: "Email is already registered",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Registration failed",
    });
  }
};

export const login = async (req: Request, res: Response) => {
  console.log("LOGIN REQUEST RECEIVED");

  try {
    const { email, password } = req.body;

    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      !email.trim() ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const result = await loginUser(email, password);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      ...result,
    });
  } catch (error) {
    console.error("LOGIN FAILURE DETAILS:", error);

    if (error instanceof Error && error.message === "INVALID_CREDENTIALS") {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Login failed",
    });
  }
};

const resetRequestCache = new Map<string, number>();

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (typeof email !== "string" || !email.trim()) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }
    
    const normalizedEmail = email.trim().toLowerCase();
    
    // Basic protection against excessive reset requests (1 request per minute per email)
    const lastRequestTime = resetRequestCache.get(normalizedEmail);
    if (lastRequestTime && Date.now() - lastRequestTime < 60 * 1000) {
      return res.status(429).json({ success: false, message: "Please wait before requesting another password reset." });
    }
    resetRequestCache.set(normalizedEmail, Date.now());

    // Clean up cache periodically (very naive approach for basic protection)
    if (resetRequestCache.size > 1000) {
      const oneMinuteAgo = Date.now() - 60 * 1000;
      for (const [key, time] of resetRequestCache.entries()) {
        if (time < oneMinuteAgo) {
          resetRequestCache.delete(key);
        }
      }
    }
    
    await forgotPasswordService(email);
    
    // Always return the same response
    return res.status(200).json({ success: true, message: "If that email is registered, a password reset link has been sent." });
  } catch (error) {
    console.error("Forgot password error:", error);
    return res.status(500).json({ success: false, message: "Failed to process request" });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token, password } = req.body;
    if (typeof token !== "string" || typeof password !== "string" || !token.trim() || password.length < 8) {
      return res.status(400).json({ success: false, message: "Token and password of at least 8 characters are required" });
    }
    
    await resetPasswordService(token, password);
    
    return res.status(200).json({ success: true, message: "Password has been successfully reset" });
  } catch (error) {
    console.error("Reset password error:", error);
    if (error instanceof Error && error.message === "INVALID_OR_EXPIRED_TOKEN") {
      return res.status(400).json({ success: false, message: "Invalid or expired reset token" });
    }
    return res.status(500).json({ success: false, message: "Failed to reset password" });
  }
};