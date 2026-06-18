import fs from 'fs'
import bcrypt from 'bcryptjs'
import { put, list } from '@vercel/blob'
import { dataPath } from './data-path'

const BLOB_TOKEN = process.env.BLOB_READ_WRITE_TOKEN
const USERS_KEY  = 'data/users.json'
let   _usersUrl: string | undefined

const AVATARS = ['🩺','💊','🔬','🧬','🏥','📋','🩻','💉','🫀','🧠','🦷','🧪','📚','🔭','🩹','🏨','⚕️','👨‍⚕️','👩‍⚕️','🌡️']

export interface StoredUser {
  id:                   string
  name:                 string
  email:                string
  passwordHash:         string
  role:                 'ADMIN' | 'EDITOR' | 'USER'
  createdAt:            string
  emailVerified:        boolean
  avatarEmoji:          string
  specialty?:           string
  studyYear?:           string
  verificationToken?:   string
  verificationExpires?: string
}

async function getBlobUrl(): Promise<string | undefined> {
  if (_usersUrl) return _usersUrl
  try {
    const { blobs } = await list({ prefix: USERS_KEY })
    _usersUrl = blobs[0]?.url
    return _usersUrl
  } catch { return undefined }
}

export async function readUsers(): Promise<StoredUser[]> {
  if (!BLOB_TOKEN) {
    try { return JSON.parse(fs.readFileSync(dataPath('users.json'), 'utf-8')) } catch { return [] }
  }
  try {
    const url = await getBlobUrl()
    if (!url) return []
    const res = await fetch(url, { cache: 'no-store' })
    if (!res.ok) return []
    return res.json()
  } catch { return [] }
}

async function writeUsers(users: StoredUser[]): Promise<void> {
  if (!BLOB_TOKEN) {
    fs.writeFileSync(dataPath('users.json'), JSON.stringify(users, null, 2), 'utf-8')
    return
  }
  const { url } = await put(USERS_KEY, JSON.stringify(users), {
    access: 'public', addRandomSuffix: false,
  })
  _usersUrl = url
}

export async function findByEmail(email: string): Promise<StoredUser | undefined> {
  const users = await readUsers()
  return users.find((u) => u.email.toLowerCase() === email.toLowerCase())
}

export async function findById(id: string): Promise<StoredUser | undefined> {
  const users = await readUsers()
  return users.find((u) => u.id === id)
}

export async function findByVerificationToken(token: string): Promise<StoredUser | undefined> {
  const users = await readUsers()
  return users.find((u) => u.verificationToken === token)
}

export async function createUser(
  name: string,
  email: string,
  password: string,
  extra?: { specialty?: string; studyYear?: string }
): Promise<StoredUser> {
  const users = await readUsers()
  if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
    throw new Error('Пользователь с таким email уже существует')
  }
  const avatar = AVATARS[Math.floor(Math.random() * AVATARS.length)]
  const user: StoredUser = {
    id:            crypto.randomUUID(),
    name,
    email:         email.toLowerCase(),
    passwordHash:  await bcrypt.hash(password, 10),
    role:          'USER',
    createdAt:     new Date().toISOString(),
    emailVerified: true,
    avatarEmoji:   avatar,
    specialty:     extra?.specialty,
    studyYear:     extra?.studyYear,
  }
  users.push(user)
  await writeUsers(users)
  return user
}

export async function verifyPassword(user: StoredUser, password: string): Promise<boolean> {
  return bcrypt.compare(password, user.passwordHash)
}

export async function verifyEmailToken(token: string): Promise<{ success: boolean; error?: string }> {
  const users = await readUsers()
  const idx   = users.findIndex((u) => u.verificationToken === token)
  if (idx === -1) return { success: false, error: 'Недействительная ссылка подтверждения' }
  const user = users[idx]
  if (user.emailVerified) return { success: true }
  if (user.verificationExpires && new Date(user.verificationExpires) < new Date()) {
    return { success: false, error: 'Ссылка истекла. Запросите новое письмо.' }
  }
  users[idx] = { ...user, emailVerified: true, verificationToken: undefined, verificationExpires: undefined }
  await writeUsers(users)
  return { success: true }
}

export async function refreshVerificationToken(email: string): Promise<string | null> {
  const users = await readUsers()
  const idx   = users.findIndex((u) => u.email.toLowerCase() === email.toLowerCase())
  if (idx === -1 || users[idx].emailVerified) return null
  const token   = crypto.randomUUID().replace(/-/g, '') + crypto.randomUUID().replace(/-/g, '')
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
  users[idx] = { ...users[idx], verificationToken: token, verificationExpires: expires }
  await writeUsers(users)
  return token
}

export async function allUsers(): Promise<Omit<StoredUser, 'passwordHash' | 'verificationToken' | 'verificationExpires'>[]> {
  const users = await readUsers()
  return users.map(({ passwordHash: _, verificationToken: __, verificationExpires: ___, ...u }) => u)
}
