import { db } from '@/lib/db'

export interface TokenPayload {
  adminId: string
  exp: number
}

export function generateToken(adminId: string): string {
  const payload: TokenPayload = {
    adminId,
    exp: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
  }
  return Buffer.from(JSON.stringify(payload)).toString('base64')
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    const decoded = JSON.parse(
      Buffer.from(token, 'base64').toString('utf-8')
    ) as TokenPayload
    if (decoded.exp < Date.now()) {
      return null
    }
    return decoded
  } catch {
    return null
  }
}

export async function authenticateAdmin(
  request: Request
): Promise<{ success: true; adminId: string } | { success: false; error: string }> {
  const authHeader = request.headers.get('Authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { success: false, error: 'Missing or invalid Authorization header' }
  }

  const token = authHeader.substring(7)
  const payload = verifyToken(token)

  if (!payload) {
    return { success: false, error: 'Invalid or expired token' }
  }

  const admin = await db.admin.findUnique({ where: { id: payload.adminId } })
  if (!admin) {
    return { success: false, error: 'Admin not found' }
  }

  return { success: true, adminId: payload.adminId }
}
