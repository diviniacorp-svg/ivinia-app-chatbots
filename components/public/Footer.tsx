import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          <div className="sm:col-span-2 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">D</span>
              </div>
              <span className="font-bold text-xl">DIVINIA</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed mb-4 max-w-xs">
              Chatbots con IA para PYMEs argentinas. Hecho en San Luis, Argentina.
            </p>
            <div className="flex gap-4">
              <a href="https://wa.me/5492665286110" target="_blank" rel="noopener noreferrer"
                className="text-green-400 hover:text-green-300 text-sm font-medium transition-colors">
                💬 WhatsApp
              </a>
              <a href="mailto:hola@divinia.ar" className="text-gray-400 hover:text-white text-sm transition-colors">
                hola@divinia.ar
              </a>
            </div>
          </div>
          <div>
            <h4 className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-4">Producto</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="#rubros" className="hover:text-white transition-colors">Rubros</a></li>
              <li><a href="#precios" className="hover:text-white transition-colors">Precios</a></li>
              <li><Link href="/trial" className="hover:text-white transition-colors">Prueba gratis</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-4">Empresa</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><span>San Luis, Argentina</span></li>
              <li><a href="mailto:hola@divinia.ar" className="hover:text-white transition-colors">Contacto</a></li>
              <li><a href="https://wa.me/5492665286110" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">WhatsApp directo</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 pt-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-gray-500">
          <span>© 2026 DIVINIA. Todos los derechos reservados.</span>
          <span className="text-xs text-gray-600">Powered by Claude (Anthropic) · Hecho con ❤️ en Argentina</span>
        </div>
      </div>
    </footer>
  )
}
