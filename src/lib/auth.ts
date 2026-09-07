import { User } from '@/domain/user/user.model'

const ACCOUNTS_KEY = 'ladrimchon_accounts_v1'

interface StoredAccount extends User {
  passwordHash: string
  salt: string
  createdAt: string
}

function toHex(bytes: Uint8Array) {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('')
}

function randomBytes(length: number) {
  const bytes = new Uint8Array(length)
  if (typeof globalThis.crypto?.getRandomValues === 'function') return globalThis.crypto.getRandomValues(bytes)
  return Uint8Array.from({ length }, () => Math.floor(Math.random() * 256))
}

function createAccountId() {
  if (typeof globalThis.crypto?.randomUUID === 'function') return `user-${globalThis.crypto.randomUUID()}`
  return `user-${toHex(randomBytes(16))}`
}

async function hashPassword(password: string, salt: string) {
  const bytes = new TextEncoder().encode(`${salt}:${password}`)
  if (!globalThis.crypto?.subtle) {
    let hash = 2166136261
    for (const byte of bytes) hash = Math.imul(hash ^ byte, 16777619)
    return (hash >>> 0).toString(16)
  }
  const digest = await globalThis.crypto.subtle.digest('SHA-256', bytes)
  return toHex(new Uint8Array(digest))
}

function readAccounts(): StoredAccount[] {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(ACCOUNTS_KEY) || '[]')
    return Array.isArray(value) ? value as StoredAccount[] : []
  } catch {
    return []
  }
}

function publicUser(account: StoredAccount): User {
  return { id: account.id, name: account.name, studentId: account.studentId, email: account.email, phone: account.phone, avatarUrl: account.avatarUrl, points: account.points ?? 0 }
}

export function updateAvatar(userId: string, avatarUrl: string): User {
  const accounts = readAccounts()
  const index = accounts.findIndex((account) => account.id === userId)
  if (index === -1) throw new Error('ไม่พบบัญชีสำหรับบันทึกรูปโปรไฟล์')

  accounts[index] = { ...accounts[index], avatarUrl }
  try { localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts)) } catch { throw new Error('บันทึกรูปโปรไฟล์ไม่สำเร็จ') }
  return publicUser(accounts[index])
}

export function awardPoints(userId: string, points: number): User {
  const accounts = readAccounts()
  const index = accounts.findIndex((account) => account.id === userId)
  if (index === -1) throw new Error('ไม่พบบัญชีสำหรับเพิ่มแต้ม')

  accounts[index] = { ...accounts[index], points: (accounts[index].points ?? 0) + points }
  try { localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts)) } catch { throw new Error('บันทึกแต้มไม่สำเร็จ') }
  return publicUser(accounts[index])
}

export async function registerAccount(input: { studentId: string; email: string; phone: string; password: string }) {
  const studentId = input.studentId.trim()
  const email = input.email.trim().toLowerCase()
  const phone = input.phone.replace(/[-\s]/g, '')
  if (!studentId) throw new Error('กรุณาระบุรหัสนักศึกษา')
  if (!/^\S+@\S+\.\S+$/.test(email)) throw new Error('รูปแบบอีเมลไม่ถูกต้อง')
  if (!/^0\d{8,9}$/.test(phone)) throw new Error('กรุณาระบุเบอร์โทรศัพท์ 9 หรือ 10 หลัก')
  if (input.password.length < 8) throw new Error('รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร')
  const accounts = readAccounts()
  if (accounts.some((account) => account.email === email)) throw new Error('อีเมลนี้ถูกใช้งานแล้ว')
  const salt = toHex(randomBytes(16))
  const account: StoredAccount = {
    id: createAccountId(),
    name: email.split('@')[0],
    studentId,
    email,
    phone,
    points: 0,
    salt,
    passwordHash: await hashPassword(input.password, salt),
    createdAt: new Date().toISOString(),
  }
  try { localStorage.setItem(ACCOUNTS_KEY, JSON.stringify([...accounts, account])) } catch { throw new Error('บันทึกบัญชีไม่สำเร็จ กรุณาตรวจสอบพื้นที่จัดเก็บข้อมูล') }
  return publicUser(account)
}

export async function loginAccount(emailInput: string, password: string) {
  const account = readAccounts().find((item) => item.email === emailInput.trim().toLowerCase())
  if (!account || await hashPassword(password, account.salt) !== account.passwordHash) throw new Error('อีเมลหรือรหัสผ่านไม่ถูกต้อง')
  return publicUser(account)
}
