'use client'

const WA = 'https://wa.me/5492665286110?text=Hola%2C%20vi%20la%20p%C3%A1gina%20de%20DIVINIA%20y%20quiero%20info'

export default function WhatsAppFloat() {
  return (
    <>
      <a
        href={WA}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Escribinos por WhatsApp"
        style={{
          position: 'fixed',
          bottom: 28,
          right: 28,
          zIndex: 1000,
          width: 60,
          height: 60,
          borderRadius: '50%',
          background: '#25D366',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 24px rgba(37,211,102,0.4), 0 2px 8px rgba(0,0,0,0.15)',
          transition: 'transform 0.2s, box-shadow 0.2s',
          textDecoration: 'none',
        }}
        onMouseEnter={e => {
          const el = e.currentTarget as HTMLAnchorElement
          el.style.transform = 'scale(1.1)'
          el.style.boxShadow = '0 6px 32px rgba(37,211,102,0.55), 0 2px 12px rgba(0,0,0,0.2)'
        }}
        onMouseLeave={e => {
          const el = e.currentTarget as HTMLAnchorElement
          el.style.transform = 'scale(1)'
          el.style.boxShadow = '0 4px 24px rgba(37,211,102,0.4), 0 2px 8px rgba(0,0,0,0.15)'
        }}
      >
        <svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M15 2C7.82 2 2 7.82 2 15c0 2.28.6 4.42 1.64 6.28L2 28l6.88-1.62A13 13 0 0 0 15 28c7.18 0 13-5.82 13-13S22.18 2 15 2Z"
            fill="white"
          />
          <path
            d="M21.5 18.3c-.3-.15-1.77-.87-2.04-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.47-.89-.79-1.48-1.76-1.66-2.06-.17-.3-.02-.46.13-.6.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.6-.91-2.19-.24-.57-.49-.5-.67-.5h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48 0 1.46 1.07 2.87 1.21 3.07.15.2 2.1 3.2 5.08 4.49.71.31 1.27.49 1.7.63.72.23 1.37.2 1.88.12.57-.08 1.77-.72 2.02-1.42.25-.7.25-1.3.17-1.42-.07-.13-.27-.2-.57-.35Z"
            fill="#25D366"
          />
        </svg>
      </a>

      {/* Tooltip label — aparece en desktop */}
      <style>{`
        @media (hover: hover) {
          .wa-float-label {
            opacity: 0;
            transition: opacity 0.2s;
          }
          .wa-float-wrapper:hover .wa-float-label {
            opacity: 1;
          }
        }
      `}</style>
    </>
  )
}
