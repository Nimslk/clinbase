import fs from 'fs'
import path from 'path'

const FILE = path.join(process.cwd(), 'data', 'community.json')

export type PostCategory = 'idea' | 'question' | 'feedback' | 'other'

export interface Reply {
  id:          string
  userId:      string
  userName:    string
  avatarEmoji: string
  specialty?:  string
  content:     string
  createdAt:   string
}

export interface Post {
  id:          string
  userId:      string
  userName:    string
  avatarEmoji: string
  specialty?:  string
  category:    PostCategory
  content:     string
  createdAt:   string
  likes:       string[]
  replies:     Reply[]
}

function read(): Post[] {
  if (!fs.existsSync(FILE)) return []
  try { return JSON.parse(fs.readFileSync(FILE, 'utf-8')) } catch { return [] }
}

function write(posts: Post[]) {
  fs.mkdirSync(path.dirname(FILE), { recursive: true })
  fs.writeFileSync(FILE, JSON.stringify(posts, null, 2), 'utf-8')
}

export function getPosts(): Post[] {
  return read().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

export function createPost(data: Omit<Post, 'id' | 'createdAt' | 'likes' | 'replies'>): Post {
  const posts = read()
  const post: Post = {
    ...data,
    id:        crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    likes:     [],
    replies:   [],
  }
  posts.unshift(post)
  write(posts.slice(0, 500))
  return post
}

export function deletePost(id: string, userId: string, isAdmin: boolean): boolean {
  const posts = read()
  const idx   = posts.findIndex((p) => p.id === id)
  if (idx === -1) return false
  if (!isAdmin && posts[idx].userId !== userId) return false
  posts.splice(idx, 1)
  write(posts)
  return true
}

export function toggleLike(postId: string, userId: string): Post | null {
  const posts = read()
  const post  = posts.find((p) => p.id === postId)
  if (!post) return null
  const idx = post.likes.indexOf(userId)
  if (idx === -1) post.likes.push(userId)
  else            post.likes.splice(idx, 1)
  write(posts)
  return post
}

export function addReply(
  postId: string,
  data: Omit<Reply, 'id' | 'createdAt'>
): Reply | null {
  const posts = read()
  const post  = posts.find((p) => p.id === postId)
  if (!post) return null
  const reply: Reply = { ...data, id: crypto.randomUUID(), createdAt: new Date().toISOString() }
  post.replies.push(reply)
  write(posts)
  return reply
}

export function deleteReply(postId: string, replyId: string, userId: string, isAdmin: boolean): boolean {
  const posts = read()
  const post  = posts.find((p) => p.id === postId)
  if (!post) return false
  const idx = post.replies.findIndex((r) => r.id === replyId)
  if (idx === -1) return false
  if (!isAdmin && post.replies[idx].userId !== userId) return false
  post.replies.splice(idx, 1)
  write(posts)
  return true
}
