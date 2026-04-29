import { MercadoPagoConfig, Preference, Payment, PreApproval, PreApprovalPlan } from 'mercadopago'

let _preference: Preference | null = null
let _payment: Payment | null = null
let _preApproval: PreApproval | null = null
let _preApprovalPlan: PreApprovalPlan | null = null

function getMPConfig() {
  return new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN || 'placeholder' })
}

function getMPPreference(): Preference {
  if (!_preference) _preference = new Preference(getMPConfig())
  return _preference
}

function getMPPayment(): Payment {
  if (!_payment) _payment = new Payment(getMPConfig())
  return _payment
}

function getMPPreApproval(): PreApproval {
  if (!_preApproval) _preApproval = new PreApproval(getMPConfig())
  return _preApproval
}

function getMPPreApprovalPlan(): PreApprovalPlan {
  if (!_preApprovalPlan) _preApprovalPlan = new PreApprovalPlan(getMPConfig())
  return _preApprovalPlan
}

export interface CreatePreferenceParams {
  title: string
  description: string
  amount: number
  clientEmail?: string
  clientName?: string
  externalReference?: string
  accessToken?: string   // si se provee, usa la cuenta MP del negocio en lugar de DIVINIA
  backUrls?: {
    success?: string
    failure?: string
    pending?: string
  }
}

export async function createPaymentPreference(params: CreatePreferenceParams) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  // Usar token del negocio si fue provisto, sino el de DIVINIA
  const mpPreference = params.accessToken
    ? new Preference(new MercadoPagoConfig({ accessToken: params.accessToken }))
    : getMPPreference()

  const preference = await mpPreference.create({
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

// ── SUBSCRIPTIONS ────────────────────────────────────────────────────────────

export interface CreateSubscriptionParams {
  plan_id: string       // ID del plan creado previamente en MP
  client_email: string
  client_name?: string
  external_reference?: string  // ej: client_id de Supabase
  back_url?: string
}

export interface CreatePlanParams {
  reason: string        // Ej: "Turnero DIVINIA — Plan Mensual"
  amount: number        // Precio en ARS
  frequency: number     // 1
  frequency_type: 'months' | 'days'
  external_reference?: string
}

export async function createSubscriptionPlan(params: CreatePlanParams) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://divinia.vercel.app'
  return await getMPPreApprovalPlan().create({
    body: {
      reason: params.reason,
      auto_recurring: {
        frequency: params.frequency,
        frequency_type: params.frequency_type,
        transaction_amount: params.amount,
        currency_id: 'ARS',
      },
      back_url: `${appUrl}/checkout/success`,
    },
  })
}

export async function createSubscription(params: CreateSubscriptionParams) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://divinia.vercel.app'
  return await getMPPreApproval().create({
    body: {
      preapproval_plan_id: params.plan_id,
      payer_email: params.client_email,
      reason: 'DIVINIA — Suscripción mensual',
      auto_recurring: {
        frequency: 1,
        frequency_type: 'months',
        currency_id: 'ARS',
      },
      back_url: params.back_url || `${appUrl}/checkout/success`,
      external_reference: params.external_reference,
      status: 'pending',
    },
  })
}

// Suscripción directa sin plan template — para cobro recurrente mensual
export async function createDirectSubscription(params: {
  reason: string
  amount: number
  clientEmail: string
  clientName?: string
  externalReference?: string
  backUrl?: string
  startDaysFromNow?: number  // default 30 (mes siguiente)
}) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://divinia.vercel.app'
  const startDate = new Date()
  startDate.setDate(startDate.getDate() + (params.startDaysFromNow ?? 30))
  const endDate = new Date(startDate)
  endDate.setFullYear(endDate.getFullYear() + 2)

  return await getMPPreApproval().create({
    body: {
      reason: params.reason,
      payer_email: params.clientEmail,
      auto_recurring: {
        frequency: 1,
        frequency_type: 'months',
        transaction_amount: params.amount,
        currency_id: 'ARS',
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
      },
      back_url: params.backUrl || `${appUrl}/checkout/success`,
      external_reference: params.externalReference,
      status: 'pending',
    },
  })
}

export async function cancelSubscription(preapproval_id: string) {
  return await getMPPreApproval().update({
    id: preapproval_id,
    body: { status: 'cancelled' },
  })
}

export async function getSubscription(preapproval_id: string) {
  return await getMPPreApproval().get({ id: preapproval_id })
}

export function formatARS(amount: number): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
  }).format(amount)
}
