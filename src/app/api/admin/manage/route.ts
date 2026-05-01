import { db } from '@/lib/db'
import { authenticateAdmin } from '@/lib/auth'
import { NextRequest, NextResponse } from 'next/server'

// ===== TESTIMONIALS =====

export async function POST(request: NextRequest) {
  try {
    const auth = await authenticateAdmin(request)
    if (!auth.success) {
      return NextResponse.json({ error: auth.error }, { status: 401 })
    }

    const body = await request.json()
    const { type, data } = body

    if (!type || !data) {
      return NextResponse.json(
        { error: 'Missing required fields: type (testimonial|banner), data' },
        { status: 400 }
      )
    }

    if (type === 'testimonial') {
      const { name, text, rating, avatar } = data
      if (!name || !text) {
        return NextResponse.json(
          { error: 'Testimonial requires name and text' },
          { status: 400 }
        )
      }

      const testimonial = await db.testimonial.create({
        data: {
          name,
          text,
          rating: rating || 5,
          avatar: avatar || null,
        },
      })

      return NextResponse.json({ testimonial }, { status: 201 })
    }

    if (type === 'banner') {
      const { imageUrl, title, subtitle, order } = data
      if (!imageUrl || !title) {
        return NextResponse.json(
          { error: 'Banner requires imageUrl and title' },
          { status: 400 }
        )
      }

      const banner = await db.banner.create({
        data: {
          imageUrl,
          title,
          subtitle: subtitle || '',
          order: order || 0,
        },
      })

      return NextResponse.json({ banner }, { status: 201 })
    }

    return NextResponse.json(
      { error: 'Invalid type. Must be "testimonial" or "banner"' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Create manage error:', error)
    return NextResponse.json(
      { error: 'Failed to create resource' },
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
    const { type, id, data } = body

    if (!type || !id || !data) {
      return NextResponse.json(
        { error: 'Missing required fields: type, id, data' },
        { status: 400 }
      )
    }

    if (type === 'testimonial') {
      const existing = await db.testimonial.findUnique({ where: { id } })
      if (!existing) {
        return NextResponse.json(
          { error: 'Testimonial not found' },
          { status: 404 }
        )
      }

      const updateData: Record<string, unknown> = {}
      if (data.name !== undefined) updateData.name = data.name
      if (data.text !== undefined) updateData.text = data.text
      if (data.rating !== undefined) updateData.rating = data.rating
      if (data.avatar !== undefined) updateData.avatar = data.avatar
      if (data.active !== undefined) updateData.active = data.active

      const testimonial = await db.testimonial.update({
        where: { id },
        data: updateData,
      })

      return NextResponse.json({ testimonial })
    }

    if (type === 'banner') {
      const existing = await db.banner.findUnique({ where: { id } })
      if (!existing) {
        return NextResponse.json(
          { error: 'Banner not found' },
          { status: 404 }
        )
      }

      const updateData: Record<string, unknown> = {}
      if (data.imageUrl !== undefined) updateData.imageUrl = data.imageUrl
      if (data.title !== undefined) updateData.title = data.title
      if (data.subtitle !== undefined) updateData.subtitle = data.subtitle
      if (data.order !== undefined) updateData.order = data.order
      if (data.active !== undefined) updateData.active = data.active

      const banner = await db.banner.update({
        where: { id },
        data: updateData,
      })

      return NextResponse.json({ banner })
    }

    return NextResponse.json(
      { error: 'Invalid type. Must be "testimonial" or "banner"' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Update manage error:', error)
    return NextResponse.json(
      { error: 'Failed to update resource' },
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
    const type = searchParams.get('type')
    const id = searchParams.get('id')

    if (!type || !id) {
      return NextResponse.json(
        { error: 'Missing required params: type, id' },
        { status: 400 }
      )
    }

    if (type === 'testimonial') {
      const existing = await db.testimonial.findUnique({ where: { id } })
      if (!existing) {
        return NextResponse.json(
          { error: 'Testimonial not found' },
          { status: 404 }
        )
      }

      // Soft delete
      const testimonial = await db.testimonial.update({
        where: { id },
        data: { active: false },
      })

      return NextResponse.json({ testimonial, message: 'Testimonial deactivated' })
    }

    if (type === 'banner') {
      const existing = await db.banner.findUnique({ where: { id } })
      if (!existing) {
        return NextResponse.json(
          { error: 'Banner not found' },
          { status: 404 }
        )
      }

      // Soft delete
      const banner = await db.banner.update({
        where: { id },
        data: { active: false },
      })

      return NextResponse.json({ banner, message: 'Banner deactivated' })
    }

    return NextResponse.json(
      { error: 'Invalid type. Must be "testimonial" or "banner"' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Delete manage error:', error)
    return NextResponse.json(
      { error: 'Failed to delete resource' },
      { status: 500 }
    )
  }
}
