import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Get Tripay private key for signature verification
    const privateKeySetting = await db.setting.findUnique({
      where: { key: 'tripay_private_key' },
    })

    if (!privateKeySetting?.value) {
      return NextResponse.json(
        { error: 'Tripay private key not configured' },
        { status: 500 }
      )
    }

    // Verify Tripay callback signature
    const callbackSignature = request.headers.get('X-Callback-Signature')
    if (callbackSignature) {
      const crypto = await import('crypto')
      const jsonString = JSON.stringify(body)
      const expectedSignature = crypto
        .createHmac('sha256', privateKeySetting.value)
        .update(jsonString)
        .digest('hex')

      if (callbackSignature !== expectedSignature) {
        return NextResponse.json(
          { error: 'Invalid signature' },
          { status: 403 }
        )
      }
    }

    const { reference, status, merchant_ref } = body

    if (!reference || !status) {
      return NextResponse.json(
        { error: 'Missing required callback data' },
        { status: 400 }
      )
    }

    // Find order by merchant_ref (orderId) or tripayRef
    let order = null
    if (merchant_ref) {
      order = await db.order.findUnique({
        where: { orderId: merchant_ref },
      })
    }

    if (!order && reference) {
      order = await db.order.findFirst({
        where: { tripayRef: reference },
      })
    }

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    // Update order status based on Tripay callback
    let newStatus = order.status
    switch (status) {
      case 'PAID':
        newStatus = 'paid'
        break
      case 'EXPIRED':
        newStatus = 'expired'
        break
      case 'FAILED':
        newStatus = 'failed'
        break
      case 'REFUND':
        newStatus = 'refunded'
        break
      default:
        newStatus = order.status
    }

    if (newStatus !== order.status) {
      await db.order.update({
        where: { id: order.id },
        data: { status: newStatus },
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Payment callback error:', error)
    return NextResponse.json(
      { error: 'Callback processing failed' },
      { status: 500 }
    )
  }
}
