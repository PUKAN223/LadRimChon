import Link from 'next/link'
import { WifiOff } from 'lucide-react'

export default function OfflinePage() {
  return (
    <main className="offline-page">
      <div className="offline-content">
        <div className="offline-icon" aria-hidden="true">
          <WifiOff size={30} strokeWidth={2.4} />
        </div>
        <h1>ยังไม่มีการเชื่อมต่ออินเทอร์เน็ต</h1>
        <p>หน้าที่เคยเปิดไว้ยังใช้งานได้บางส่วน ลองเชื่อมต่ออินเทอร์เน็ตแล้วกลับมาใหม่</p>
        <Link href="/" className="offline-action">กลับหน้าหลัก</Link>
      </div>
    </main>
  )
}
