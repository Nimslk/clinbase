import fs from 'fs'
import path from 'path'

import { dataPath } from './data-path'

export type NotifType = 'NEW_USER' | 'NEW_MATERIAL'
export type NotifAudience = 'ADMINS' | 'USERS' | 'ALL'

export interface Notification {
  id:         string
  type:       NotifType
  audience:   NotifAudience
  title:      string
  body:       string
  link?:      string
  materialId?: string
  createdAt:  string
  readBy:     string[]
}

function read(): Notification[] {
  const file = dataPath('notifications.json')
  try { return JSON.parse(fs.readFileSync(file, 'utf-8')) } catch { return [] }
}

function write(list: Notification[]) {
  fs.writeFileSync(dataPath('notifications.json'), JSON.stringify(list, null, 2), 'utf-8')
}

export function createNotification(
  data: Omit<Notification, 'id' | 'createdAt' | 'readBy'>
): Notification {
  const list  = read()
  const notif: Notification = { id: crypto.randomUUID(), ...data, createdAt: new Date().toISOString(), readBy: [] }
  list.unshift(notif)
  write(list.slice(0, 200))
  return notif
}

export function removeByMaterialId(materialId: string) {
  // match by explicit materialId OR by the document link (handles legacy notifications)
  const list = read().filter(
    (n) => n.materialId !== materialId && n.link !== `/document/${materialId}`
  )
  write(list)
}

export function getForRole(role: string, userId: string): Notification[] {
  const isAdmin = role === 'ADMIN' || role === 'EDITOR'
  return read().filter((n) => {
    if (n.audience === 'ALL')    return true
    if (n.audience === 'ADMINS') return isAdmin
    if (n.audience === 'USERS')  return !isAdmin
    return false
  })
}

export function countUnread(role: string, userId: string): number {
  return getForRole(role, userId).filter((n) => !n.readBy.includes(userId)).length
}

export function markRead(notifId: string, userId: string) {
  const list = read()
  const n = list.find((x) => x.id === notifId)
  if (n && !n.readBy.includes(userId)) { n.readBy.push(userId); write(list) }
}

export function markAllRead(role: string, userId: string) {
  const list    = read()
  const isAdmin = role === 'ADMIN' || role === 'EDITOR'
  list.forEach((n) => {
    const visible =
      n.audience === 'ALL' ||
      (n.audience === 'ADMINS' && isAdmin) ||
      (n.audience === 'USERS' && !isAdmin)
    if (visible && !n.readBy.includes(userId)) n.readBy.push(userId)
  })
  write(list)
}
