import fs from 'fs'
import path from 'path'
import bcrypt from 'bcryptjs'

const FILE = path.join(process.cwd(), 'data', 'users.json')

const AVATARS = ['🩺','💊','🔬','🧬','🏥','📋','🩻','💉','🫀','🧠','🦷','🧪','📚','🔭','🩹','🏨','⚕️','👨‍⚕️','👩‍⚕️','🌡️']

export interface StoredUser {
  id:                  string
  name:                string
  email:               string
  passwordHash:        string
  role:                'ADMIN' | 'EDITOR' | 'USER'
  createdAt:           string
  emailVerified:       boolean
  avatarEmoji:         string
  specialty?:          string
  studyYear?:          string
  verificationToken?:  string
  verificationExpires?: string
}

function read(): StoredUser[] {
  if (!fs.existsSync(FILE)) return []
  try { return JSON.parse(fs.readFileSync(FILE, 'utf-8')) } catch { return [] }
}

function write(users: StoredUser[]) {
  fs.mkdirSync(path.dirname(FILE), { recursive: true })
  fs.writeFileSync(FILE, JSON.stringify(users, null, 2), 'utf-8')
}

export function findByEmail(email: string): StoredUser | undefined {
  return read().find((u) => u.email.toLowerCase() === email.toLowerCase())
}

export function findById(id: string): StoredUser | undefined {
  return read().find((u) => u.id === id)
}

export function findByVerificationToken(token: string): StoredUser | undefined {
  return read().find((u) => u.verificationToken === token)
}

export async function createUser(
  name: string,
  email: string,
  password: string,
  extra?: { specialty?: string; studyYear?: string }
): Promise<StoredUser> {
  const users = read()
  if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
    throw new Error('Пользователь с таким email уже существует')
  }
  const token   = crypto.randomUUID().replace(/-/g, '') + crypto.randomUUID().replace(/-/g, '')
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
  const avatar  = AVATARS[Math.floor(Math.random() * AVATARS.length)]

  const user: StoredUser = {
    id:           crypto.randomUUID(),
    name,
    email:        email.toLowerCase(),
    passwordHash: await bcrypt.hash(password, 10),
    role:         'USER',
    createdAt:    new Date().toISOString(),
    emailVerified: true,
    avatarEmoji:  avatar,
    specialty:    extra?.specialty,
    studyYear:    extra?.studyYear,
  }
  users.push(user)
  write(users)
  return user
}

export function verifyEmailToken(token: string): { success: boolean; error?: string } {
  const users = read()
  const idx   = users.findIndex((u) => u.verificationToken === token)
  if (idx === -1) return { success: false, error: 'Недействительная ссылка подтверждения' }
  const user = users[idx]
  if (user.emailVerified) return { success: true }
  if (user.verificationExpires && new Date(user.verificationExpires) < new Date()) {
    return { success: false, error: 'Ссылка истекла. Запросите новое письмо.' }
  }
  users[idx] = { ...user, emailVerified: true, verificationToken: undefined, verificationExpires: undefined }
  write(users)
  return { success: true }
}

export function refreshVerificationToken(email: string): string | null {
  const users = read()
  const idx   = users.findIndex((u) => u.email.toLowerCase() === email.toLowerCase())
  if (idx === -1 || users[idx].emailVerified) return null
  const token   = crypto.randomUUID().replace(/-/g, '') + crypto.randomUUID().replace(/-/g, '')
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
  users[idx] = { ...users[idx], verificationToken: token, verificationExpires: expires }
  write(users)
  return token
}

export async function verifyPassword(user: StoredUser, password: string): Promise<boolean> {
  return bcrypt.compare(password, user.passwordHash)
}

export function allUsers(): Omit<StoredUser, 'passwordHash' | 'verificationToken' | 'verificationExpires'>[] {
  return read().map(({ passwordHash: _, verificationToken: __, verificationExpires: ___, ...u }) => u)
}
