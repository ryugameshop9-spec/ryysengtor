import { db } from '@/lib/db'
import { authenticateAdmin } from '@/lib/auth'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const auth = await authenticateAdmin(request)
    if (!auth.success) {
      return NextResponse.json({ error: auth.error }, { status: 401 })
    }

    const settings = await db.setting.findMany({
      orderBy: { key: 'asc' },
    })

    return NextResponse.json({ settings })
  } catch (error) {
    console.error('Get settings error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
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
    const { settings } = body

    if (!settings || !Array.isArray(settings)) {
      return NextResponse.json(
        { error: 'Settings must be an array of {key, value} objects' },
        { status: 400 }
      )
    }

    // Update each setting
    const updatedSettings = []
    for (const setting of settings) {
      if (!setting.key || setting.value === undefined) {
        continue
      }

      const updated = await db.setting.upsert({
        where: { key: setting.key },
        update: { value: String(setting.value) },
        create: { key: setting.key, value: String(setting.value) },
      })

      updatedSettings.push(updated)
    }

    return NextResponse.json({ settings: updatedSettings })
  } catch (error) {
    console.error('Update settings error:', error)
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    )
  }
}
