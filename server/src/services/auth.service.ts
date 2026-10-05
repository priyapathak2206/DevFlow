import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../config/prisma";
import crypto from "crypto";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY || "fallback");

const getJwtSecret = (): string => {
const secret = process.env.JWT_SECRET;

if (!secret || secret.length < 32) {
throw new Error("JWT_SECRET must be set to a secret of at least 32 characters");
}

return secret;
};

export const registerUser = async (
name: string,
email: string,
password: string
) => {
const normalizedEmail = email.trim().toLowerCase();

const existingUser = await prisma.user.findUnique({
where: { email: normalizedEmail },
});

if (existingUser) {
throw new Error("EMAIL_EXISTS");
}

const passwordHash = await bcrypt.hash(password, 12);

const user = await prisma.user.create({
data: {
name: name.trim(),
email: normalizedEmail,
passwordHash,
},
select: {
id: true,
name: true,
email: true,
role: true,
createdAt: true,
},
});

return user;
};

export const loginUser = async (email: string, password: string) => {
const normalizedEmail = email.trim().toLowerCase();

const user = await prisma.user.findUnique({
where: { email: normalizedEmail },
});

if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
throw new Error("INVALID_CREDENTIALS");
}

const token = jwt.sign(
{ userId: user.id, role: user.role },
getJwtSecret(),
{ expiresIn: "1h" }
);

return {
token,
user: {
id: user.id,
name: user.name,
email: user.email,
role: user.role,
},
};
};

export const forgotPassword = async (email: string) => {
  const normalizedEmail = email.trim().toLowerCase();

  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (!user) {
    // Return early to prevent user enumeration
    return;
  }

  const resetToken = crypto.randomBytes(32).toString("hex");
  const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");
  
  // Set expiration to 20 minutes from now
  const resetPasswordExpires = new Date(Date.now() + 20 * 60 * 1000);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      resetPasswordToken: hashedToken,
      resetPasswordExpires,
    },
  });

  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
  // The frontend needs to handle this query parameter.
  const resetLink = `${frontendUrl}?token=${resetToken}`;

  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev",
    to: user.email,
    subject: "Password Reset Request",
    html: `<p>You requested a password reset for DevFlow.</p>
           <p>Click <a href="${resetLink}">here</a> to reset your password.</p>
           <p>This link is valid for 20 minutes. If you did not request this, please ignore this email.</p>`,
  });
};

export const resetPassword = async (token: string, newPassword: string) => {
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await prisma.user.findFirst({
    where: {
      resetPasswordToken: hashedToken,
      resetPasswordExpires: {
        gt: new Date(),
      },
    },
  });

  if (!user) {
    throw new Error("INVALID_OR_EXPIRED_TOKEN");
  }

  const passwordHash = await bcrypt.hash(newPassword, 12);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordHash,
      resetPasswordToken: null,
      resetPasswordExpires: null,
    },
  });
};
