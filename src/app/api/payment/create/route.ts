import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { orderId, paymentMethod } = body

    if (!orderId || !paymentMethod) {
      return NextResponse.json(
        { error: 'Missing required fields: orderId, paymentMethod' },
        { status: 400 }
      )
    }

    const order = await db.order.findUnique({
      where: { orderId },
      include: { product: true },
    })

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    if (order.status === 'paid') {
      return NextResponse.json(
        { error: 'Order is already paid' },
        { status: 400 }
      )
    }

    // Get Tripay settings
    const apiKeySetting = await db.setting.findUnique({ where: { key: 'tripay_api_key' } })
    const merchantCodeSetting = await db.setting.findUnique({ where: { key: 'tripay_merchant_code' } })
    const privateKeySetting = await db.setting.findUnique({ where: { key: 'tripay_private_key' } })

    if (!apiKeySetting?.value || !merchantCodeSetting?.value || !privateKeySetting?.value) {
      return NextResponse.json(
        { error: 'Tripay is not configured. Please set API key, merchant code, and private key in settings.' },
        { status: 500 }
      )
    }

    const apiKey = apiKeySetting.value
    const merchantCode = merchantCodeSetting.value
    const privateKey = privateKeySetting.value

    // Create signature
    const crypto = await import('crypto')
    const signatureString = merchantCode + order.orderId + order.amount.toString()
    const signature = crypto
      .createHmac('sha256', privateKey)
      .update(signatureString)
      .digest('hex')

    // Create Tripay transaction
    const tripayResponse = await fetch('https://tripay.co.id/api-sandbox/transaction/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        method: paymentMethod,
        merchant_ref: order.orderId,
        amount: order.amount,
        customer_name: order.email.split('@')[0],
        customer_email: order.email,
        customer_phone: order.whatsapp,
        order_items: [
          {
            name: order.product.name,
            price: order.amount,
            quantity: 1,
          },
        ],
        callback_url: `${request.nextUrl.origin}/api/payment/callback`,
        return_url: `${request.nextUrl.origin}/order/${order.orderId}`,
        signature,
      }),
    })

    const tripayData = await tripayResponse.json()

    if (!tripayData.success) {
      return NextResponse.json(
        { error: 'Tripay transaction failed', details: tripayData.message },
        { status: 400 }
      )
    }

    // Update order with Tripay data
    await db.order.update({
      where: { id: order.id },
      data: {
        invoiceId: tripayData.data.invoice_id,
        tripayRef: tripayData.data.reference,
        paymentMethod,
        paymentCode: tripayData.data.pay_code || null,
        checkoutUrl: tripayData.data.checkout_url || null,
      },
    })

    return NextResponse.json({
      payment: {
        invoiceId: tripayData.data.invoice_id,
        reference: tripayData.data.reference,
        paymentCode: tripayData.data.pay_code,
        checkoutUrl: tripayData.data.checkout_url,
        instructions: tripayData.data.instructions || null,
      },
    })
  } catch (error) {
    console.error('Create payment error:', error)
    return NextResponse.json(
      { error: 'Failed to create payment' },
      { status: 500 }
    )
  }
}
