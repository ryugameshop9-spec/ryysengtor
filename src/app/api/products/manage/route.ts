import { db } from '@/lib/db'
import { authenticateAdmin } from '@/lib/auth'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const auth = await authenticateAdmin(request)
    if (!auth.success) {
      return NextResponse.json({ error: auth.error }, { status: 401 })
    }

    const body = await request.json()
    const { name, description, shortDesc, price, image, downloadLink, category, featured } = body

    if (!name || !description || !shortDesc || !price || !image || !downloadLink) {
      return NextResponse.json(
        { error: 'Missing required fields: name, description, shortDesc, price, image, downloadLink' },
        { status: 400 }
      )
    }

    const product = await db.product.create({
      data: {
        name,
        description,
        shortDesc,
        price: parseFloat(price),
        image,
        downloadLink,
        category: category || 'action',
        featured: featured || false,
      },
    })

    return NextResponse.json({ product }, { status: 201 })
  } catch (error) {
    console.error('Create product error:', error)
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const auth = await authenticateAdmin(request)
    if (!auth.success) {
      return NextResponse.json({ error: auth.error }, { status: 401 })
    }

    const body = await request.json()
    const { id, name, description, shortDesc, price, image, downloadLink, category, featured, active } = body

    if (!id) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      )
    }

    const existing = await db.product.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    const updateData: Record<string, unknown> = {}
    if (name !== undefined) updateData.name = name
    if (description !== undefined) updateData.description = description
    if (shortDesc !== undefined) updateData.shortDesc = shortDesc
    if (price !== undefined) updateData.price = parseFloat(price)
    if (image !== undefined) updateData.image = image
    if (downloadLink !== undefined) updateData.downloadLink = downloadLink
    if (category !== undefined) updateData.category = category
    if (featured !== undefined) updateData.featured = featured
    if (active !== undefined) updateData.active = active

    const product = await db.product.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json({ product })
  } catch (error) {
    console.error('Update product error:', error)
    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const auth = await authenticateAdmin(request)
    if (!auth.success) {
      return NextResponse.json({ error: auth.error }, { status: 401 })
    }

    const { searchParams } = request.nextUrl
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      )
    }

    const existing = await db.product.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    // Soft delete by setting active to false
    const product = await db.product.update({
      where: { id },
      data: { active: false },
    })

    return NextResponse.json({ product, message: 'Product deactivated successfully' })
  } catch (error) {
    console.error('Delete product error:', error)
    return NextResponse.json(
      { error: 'Failed to delete product' },
      { status: 500 }
    )
  }
}
