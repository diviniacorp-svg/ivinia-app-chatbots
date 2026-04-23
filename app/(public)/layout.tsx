import WhatsAppFloat from '@/components/public/WhatsAppFloat'

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <WhatsAppFloat />
    </>
  )
}
