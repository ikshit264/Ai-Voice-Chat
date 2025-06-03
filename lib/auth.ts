import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs"
import { prisma } from "./prisma"

const JWT_SECRET = process.env.JWT_SECRET!
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!

export interface JWTPayload {
  userId: string
  email: string
}

export function generateTokens(payload: JWTPayload) {
  const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: "15m" })
  const refreshToken = jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: "7d" })

  return { accessToken, refreshToken }
}

export function verifyAccessToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload
  } catch {
    return null
  }
}

export function verifyRefreshToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET) as JWTPayload
  } catch {
    return null
  }
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export async function storeRefreshToken(userId: string, token: string) {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days

  await prisma.refreshToken.create({
    data: {
      token,
      userId,
      expiresAt,
    },
  })
}

export async function removeRefreshToken(token: string) {
  await prisma.refreshToken.delete({
    where: { token },
  })
}

export async function findValidRefreshToken(token: string) {
  return prisma.refreshToken.findFirst({
    where: {
      token,
      expiresAt: {
        gt: new Date(),
      },
    },
  })
}
