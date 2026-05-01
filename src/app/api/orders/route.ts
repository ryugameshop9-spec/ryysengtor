import { db } from '@/lib/db'
import { authenticateAdmin } from '@/lib/auth'
import { NextRequest, NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'

function generateOrderId(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = 'ORD-'
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { productId, email, whatsapp, paymentMethod } = body

    if (!productId || !email || !whatsapp) {
      return NextResponse.json(
        { error: 'Missing required fields: productId, email, whatsapp' },
        { status: 400 }
      )
    }

    const product = await db.product.findUnique({
      where: { id: productId },
    })

    if (!product || !product.active) {
      return NextResponse.json(
        { error: 'Product not found or unavailable' },
        { status: 404 }
      )
    }

    // Generate unique orderId
    let orderId = generateOrderId()
    let existingOrder = await db.order.findUnique({ where: { orderId } })
    while (existingOrder) {
      orderId = generateOrderId()
      existingOrder = await db.order.findUnique({ where: { orderId } })
    }

    const downloadToken = uuidv4()
    const tokenExpiry = new Date(Date.now() + 72 * 60 * 60 * 1000) // 72 hours

    const order = await db.order.create({
      data: {
        orderId,
        productId,
        email,
        whatsapp,
        status: 'pending',
        downloadToken,
        tokenExpiry,
        amount: product.price,
        paymentMethod: paymentMethod || null,
      },
      include: { product: true },
    })

    // Try to create Tripay transaction if configured
    let paymentInfo = null
    if (paymentMethod) {
      try {
        const apiKey = await db.setting.findUnique({ where: { key: 'tripay_api_key' } })
        const merchantCode = await db.setting.findUnique({ where: { key: 'tripay_merchant_code' } })
        const privateKey = await db.setting.findUnique({ where: { key: 'tripay_private_key' } })

        if (apiKey?.value && merchantCode?.value && privateKey?.value && !apiKey.value.startsWith('DEV-xxx')) {
          const signature = await createTripaySignature(
            merchantCode.value,
            orderId,
            product.price,
            privateKey.value
          )

          const tripayResponse = await fetch('https://tripay.co.id/api-sandbox/transaction/create', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${apiKey.value}`,
            },
            body: JSON.stringify({
              method: paymentMethod,
              merchant_ref: orderId,
              amount: product.price,
              customer_name: email.split('@')[0],
              customer_email: email,
              customer_phone: whatsapp,
              order_items: [
                {
                  name: product.name,
                  price: product.price,
                  quantity: 1,
                },
              ],
              callback_url: `${request.nextUrl.origin}/api/payment/callback`,
              return_url: `${request.nextUrl.origin}/order/${orderId}`,
              signature,
            }),
          })

          const tripayData = await tripayResponse.json()

          if (tripayData.success) {
            await db.order.update({
              where: { id: order.id },
              data: {
                invoiceId: tripayData.data.invoice_id,
                tripayRef: tripayData.data.reference,
                paymentCode: tripayData.data.pay_code || null,
                checkoutUrl: tripayData.data.checkout_url || null,
              },
            })

            paymentInfo = {
              invoiceId: tripayData.data.invoice_id,
              reference: tripayData.data.reference,
              paymentCode: tripayData.data.pay_code,
              checkoutUrl: tripayData.data.checkout_url,
            }
          }
        }
      } catch (tripayError) {
        console.error('Tripay integration error:', tripayError)
        // Continue without Tripay - order still created
      }
    }

    return NextResponse.json({
      order: {
        id: order.id,
        orderId: order.orderId,
        status: order.status,
        amount: order.amount,
        downloadToken: order.downloadToken,
        tokenExpiry: order.tokenExpiry,
        product: {
          id: order.product.id,
          name: order.product.name,
          image: order.product.image,
          shortDesc: order.product.shortDesc,
        },
      },
      payment: paymentInfo,
    }, { status: 201 })
  } catch (error) {
    console.error('Create order error:', error)
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const auth = await authenticateAdmin(request)
    if (!auth.success) {
      return NextResponse.json({ error: auth.error }, { status: 401 })
    }

    const { searchParams } = request.nextUrl
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit

    const where: Record<string, unknown> = {}
    if (status) {
      where.status = status
    }

    const [orders, total] = await Promise.all([
      db.order.findMany({
        where,
        include: { product: true },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      db.order.count({ where }),
    ])

    return NextResponse.json({
      orders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Get orders error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    )
  }
}

async function createTripaySignature(
  merchantCode: string,
  merchantRef: string,
  amount: number,
  privateKey: string
): Promise<string> {
  const crypto = await import('crypto')
  const signatureString = merchantCode + merchantRef + amount.toString()
  return crypto
    .createHmac('sha256', privateKey)
    .update(signatureString)
    .digest('hex')
}
