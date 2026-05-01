import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const featured = searchParams.get('featured')
    const category = searchParams.get('category')
    const q = searchParams.get('q')

    const where: Record<string, unknown> = { active: true }

    if (featured === 'true') {
      where.featured = true
    }

    if (category) {
      where.category = category
    }

    if (q) {
      where.OR = [
        { name: { contains: q } },
        { description: { contains: q } },
        { shortDesc: { contains: q } },
      ]
    }

    const products = await db.product.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ products })
  } catch (error) {
    console.error('Get products error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    )
  }
}
