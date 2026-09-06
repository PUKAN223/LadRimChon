'use client'

import { FormEvent, Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Eye, EyeOff, LockKeyhole, Mail, Phone, ShieldCheck } from 'lucide-react'
import { loginAccount, registerAccount } from '@/lib/auth'
import { useAppDispatch } from '@/lib/hooks'
import { setUser } from '@/store/slices/session.slice'

export default function AuthPage() {
  return <Suspense fallback={<main className="min-h-screen bg-market-cream" />}><AuthForm /></Suspense>
}

function AuthForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const dispatch = useAppDispatch()
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [studentId, setStudentId] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (submitting) return
    setSubmitting(true)
    setError('')
    try {
      const user = mode === 'login' ? await loginAccount(email, password) : await registerAccount({ studentId, email, phone, password })
      dispatch(setUser(user))
      router.replace(searchParams.get('next') || '/')
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'ดำเนินการไม่สำเร็จ กรุณาลองใหม่')
    } finally { setSubmitting(false) }
  }

  return (
    <main className="relative isolate min-h-screen overflow-hidden bg-white">
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-80 overflow-hidden">
        <div className="auth-color-wash" />
        <img src="/background-drop.png" alt="" className="absolute inset-0 h-full w-full object-cover object-center opacity-[0.13]" />
        <div className="absolute inset-0 bg-market-cream/55" />
      </div>
      <div className="w-full">
        <section className="relative min-h-72 overflow-hidden px-6 pb-7 pt-[max(2.5rem,env(safe-area-inset-top,0px))]">
          <img src={mode === 'register' ? '/images/empty-cart-student.png' : '/images/auth-student.png'} alt="" className="pointer-events-none absolute -right-15 -bottom-5 h-72 w-72 object-contain" />
          <div className="relative z-10 max-w-50">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-market-brown"><ShieldCheck size={16} /> หลาดริมชล</div>
            <h1 className="mt-4 whitespace-pre-line text-[27px] leading-tight font-black tracking-normal text-market-dark">{mode === 'login' ? 'มื้ออร่อยของคุณ\nรออยู่ที่นี่' : 'สั่งล่วงหน้า\nรับอาหารได้ไว'}</h1>
            <p className="mt-3 text-sm leading-relaxed text-market-muted">{mode === 'login' ? 'กลับมาดูออเดอร์และร้านโปรดของคุณ' : 'สมัครครั้งเดียว เพื่อจัดการออเดอร์ได้สะดวกขึ้น'}</p>
          </div>
        </section>

        <section className="relative -mt-4 min-h-[calc(100dvh-16rem)] w-full rounded-t-3xl bg-white px-6 pt-6 pb-8 shadow-[0_-8px_24px_rgba(46,35,24,0.08)]">
          <div className="grid grid-cols-2 gap-1 rounded-xl bg-[#F7F3E8] p-1">
            <button type="button" onClick={() => { setMode('login'); setError('') }} className={`h-10 rounded-lg text-sm font-bold transition-colors ${mode === 'login' ? 'bg-white text-market-dark shadow-warm-xs' : 'text-market-muted'}`}>เข้าสู่ระบบ</button>
            <button type="button" onClick={() => { setMode('register'); setError('') }} className={`h-10 rounded-lg text-sm font-bold transition-colors ${mode === 'register' ? 'bg-white text-market-dark shadow-warm-xs' : 'text-market-muted'}`}>สมัครสมาชิก</button>
          </div>
          <form onSubmit={submit} className="mt-5 space-y-3">
          {mode === 'register' && <><label className="block"><span className="sr-only">รหัสนักศึกษา</span><input required value={studentId} onChange={(event) => setStudentId(event.target.value)} placeholder="รหัสนักศึกษา" className="w-full h-12 px-4 bg-white rounded-xl border border-market-beige/70 text-sm focus:outline-none focus:border-market-brown" /></label><label className="block"><span className="sr-only">เบอร์โทรศัพท์</span><div className="relative"><Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-market-muted" /><input required type="tel" inputMode="tel" autoComplete="tel" value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="เบอร์โทรศัพท์" className="w-full h-12 pl-11 pr-4 bg-white rounded-xl border border-market-beige/70 text-sm focus:outline-none focus:border-market-brown" /></div></label></>}
          <label className="block"><span className="sr-only">อีเมล</span><div className="relative"><Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-market-muted" /><input required type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="อีเมล" className="w-full h-12 pl-11 pr-4 bg-white rounded-xl border border-market-beige/70 text-sm focus:outline-none focus:border-market-brown" /></div></label>
          <label className="block"><span className="sr-only">รหัสผ่าน</span><div className="relative"><LockKeyhole size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-market-muted" /><input required type={showPassword ? 'text' : 'password'} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="รหัสผ่าน" className="w-full h-12 pl-11 pr-11 bg-white rounded-xl border border-market-beige/70 text-sm focus:outline-none focus:border-market-brown" /><button type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'} className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 text-market-muted flex items-center justify-center">{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></div></label>
          {error && <p role="alert" className="text-sm text-red-700 bg-red-50 border border-red-100 rounded-xl px-3 py-2.5">{error}</p>}
          <button disabled={submitting} className="w-full h-12 mt-2 rounded-xl bg-market-dark text-white font-bold text-sm shadow-warm hover:bg-market-brown active:scale-[0.99] transition-all disabled:opacity-60">{submitting ? 'กำลังดำเนินการ...' : mode === 'login' ? 'เข้าสู่ระบบ' : 'สร้างบัญชี'}</button>
          </form>
          <p className="mt-5 px-5 text-center text-[11px] leading-relaxed text-market-muted">บัญชีและประวัติการสั่งซื้อจะเก็บไว้บนอุปกรณ์นี้</p>
        </section>
      </div>
    </main>
  )
}
