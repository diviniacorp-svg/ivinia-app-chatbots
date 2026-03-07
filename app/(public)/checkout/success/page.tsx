import Link from 'next/link'
import Navbar from '@/components/public/Navbar'

export default function CheckoutSuccessPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-b from-green-50 to-white pt-24 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-10 max-w-md w-full text-center shadow-xl border border-green-100">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">✅</span>
          </div>
          <h1 className="text-3xl font-black text-gray-900 mb-3">¡Pago aprobado!</h1>
          <p className="text-gray-500 mb-8 leading-relaxed">
            Tu chatbot está activado. En las próximas horas te enviamos por WhatsApp el código para instalarlo en tu web.
          </p>
          <a
            href="https://wa.me/5492665286110?text=Hola%20Joaco%2C%20acabo%20de%20pagar%20y%20quiero%20mi%20c%C3%B3digo%20de%20instalaci%C3%B3n"
            target="_blank"
            rel="noopener noreferrer"
            className="block bg-green-500 hover:bg-green-600 text-white font-bold px-8 py-4 rounded-xl text-lg transition-all mb-4"
          >
            💬 Escribir por WhatsApp
          </a>
          <Link href="/" className="text-gray-400 text-sm hover:text-gray-600">
            Volver al inicio
          </Link>
        </div>
      </main>
    </>
  )
}
