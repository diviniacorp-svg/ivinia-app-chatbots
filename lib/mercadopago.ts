import { MercadoPagoConfig, Preference, Payment } from 'mercadopago'

let _preference: Preference | null = null
let _payment: Payment | null = null

function getMPPreference(): Preference {
  if (!_preference) {
    const mp = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN || 'placeholder' })
    _preference = new Preference(mp)
  }
  return _preference
}

function getMPPayment(): Payment {
  if (!_payment) {
    const mp = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN || 'placeholder' })
    _payment = new Payment(mp)
  }
  return _payment
}

export interface CreatePreferenceParams {
  title: string
  description: string
  amount: number
  clientEmail?: string
  clientName?: string
  externalReference?: string
  backUrls?: {
    success?: string
    failure?: string
    pending?: string
  }
}

export async function createPaymentPreference(params: CreatePreferenceParams) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  const preference = await getMPPreference().create({
    body: {
      items: [
        {
          id: params.externalReference || 'chatbot-service',
          title: params.title,
          description: params.description,
          quantity: 1,
          unit_price: params.amount,
          currency_id: 'ARS',
        },
      ],
      payer: params.clientEmail
        ? {
            email: params.clientEmail,
            name: params.clientName,
          }
        : undefined,
      back_urls: {
        success: params.backUrls?.success || `${appUrl}/checkout/success`,
        failure: params.backUrls?.failure || `${appUrl}/checkout/failure`,
        pending: params.backUrls?.pending || `${appUrl}/checkout/pending`,
      },
      auto_return: 'approved',
      external_reference: params.externalReference,
      notification_url: `${appUrl}/api/mercadopago/webhook`,
      statement_descriptor: 'DIVINIA IA',
    },
  })

  return preference
}

export async function getPaymentById(paymentId: string) {
  return await getMPPayment().get({ id: paymentId })
}

export function formatARS(amount: number): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
  }).format(amount)
}
