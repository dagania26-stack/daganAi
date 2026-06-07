import { prisma } from "@/lib/prisma"

const OTP_TTL_MS = 10 * 60 * 1000 // 10 minutes

export function generateOtp(): string {
  return String(Math.floor(100_000 + Math.random() * 900_000))
}

export async function createOtp(email: string, type: "REGISTER" | "RESET_PASSWORD"): Promise<string> {
  // Invalider les anciens OTPs du même type
  await prisma.otpCode.updateMany({
    where:  { email, type, used: false },
    data:   { used: true },
  })

  const code = generateOtp()
  await prisma.otpCode.create({
    data: {
      email,
      code,
      type,
      expiresAt: new Date(Date.now() + OTP_TTL_MS),
    },
  })
  return code
}

export async function verifyOtp(
  email: string,
  code:  string,
  type:  "REGISTER" | "RESET_PASSWORD",
): Promise<boolean> {
  const otp = await prisma.otpCode.findFirst({
    where: {
      email,
      code,
      type,
      used:      false,
      expiresAt: { gt: new Date() },
    },
  })

  if (!otp) return false

  await prisma.otpCode.update({ where: { id: otp.id }, data: { used: true } })
  return true
}
