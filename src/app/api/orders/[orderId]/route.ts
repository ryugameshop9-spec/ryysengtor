import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params

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

    // Check if order is paid and token is still valid
    let downloadLink = null
    if (order.status === 'paid') {
      const now = new Date()
      if (order.tokenExpiry > now) {
        downloadLink = order.product.downloadLink
      }
    }

    return NextResponse.json({
      order: {
        id: order.id,
        orderId: order.orderId,
        status: order.status,
        amount: order.amount,
        email: order.email,
        whatsapp: order.whatsapp,
        paymentMethod: order.paymentMethod,
        paymentCode: order.paymentCode,
        checkoutUrl: order.checkoutUrl,
        invoiceId: order.invoiceId,
        downloadToken: order.downloadToken,
        tokenExpiry: order.tokenExpiry,
        createdAt: order.createdAt,
        product: {
          id: order.product.id,
          name: order.product.name,
          image: order.product.image,
          shortDesc: order.product.shortDesc,
          price: order.product.price,
        },
      },
      downloadLink,
      tokenExpired: order.status === 'paid' ? new Date() > order.tokenExpiry : null,
    })
  } catch (error) {
    console.error('Get order error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch order' },
      { status: 500 }
    )
  }
}
