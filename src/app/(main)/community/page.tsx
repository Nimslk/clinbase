'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Heart, Trash2, MessageCircle, Send, ChevronDown, ChevronUp, Lightbulb, HelpCircle, MessageSquare, Sparkles, Lock } from 'lucide-react'
import type { Post, PostCategory } from '@/lib/community'
import Link from 'next/link'

interface Me { userId: string; email: string; role: string; name?: string; avatarEmoji?: string }

const CATEGORIES: { value: PostCategory; label: string; icon: React.ReactNode; color: string; bg: string }[] = [
  { value: 'idea',     label: 'Идея',      icon: <Lightbulb className="w-3.5 h-3.5" />,     color: 'text-amber-700',  bg: 'bg-amber-50 border-amber-200' },
  { value: 'question', label: 'Вопрос',    icon: <HelpCircle className="w-3.5 h-3.5" />,    color: 'text-blue-700',   bg: 'bg-blue-50 border-blue-200' },
  { value: 'feedback', label: 'Пожелание', icon: <MessageSquare className="w-3.5 h-3.5" />, color: 'text-emerald-700',bg: 'bg-emerald-50 border-emerald-200' },
  { value: 'other',    label: 'Другое',    icon: <Sparkles className="w-3.5 h-3.5" />,      color: 'text-purple-700', bg: 'bg-purple-50 border-purple-200' },
]

function catMeta(cat: PostCategory) {
  return CATEGORIES.find((c) => c.value === cat) ?? CATEGORIES[3]
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1)  return 'только что'
  if (m < 60) return `${m} мин. назад`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h} ч. назад`
  const d = Math.floor(h / 24)
  if (d < 7)  return `${d} дн. назад`
  return new Date(iso).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })
}

export default function CommunityPage() {
  const [me, setMe]             = useState<Me | null | 'loading'>('loading')
  const [posts, setPosts]       = useState<Post[]>([])
  const [loading, setLoading]   = useState(true)
  const [content, setContent]   = useState('')
  const [category, setCategory] = useState<PostCategory>('idea')
  const [posting, setPosting]   = useState(false)
  const [filter, setFilter]     = useState<PostCategory | 'all'>('all')
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const [replyOf, setReplyOf]   = useState<string | null>(null)
  const [replyText, setReplyText] = useState('')
  const [replying, setReplying]   = useState(false)
  const textRef = useRef<HTMLTextAreaElement>(null)
  const router  = useRouter()

  useEffect(() => {
    fetch('/api/auth/me').then((r) => r.json()).then(setMe).catch(() => setMe(null))
  }, [])

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/community')
      if (res.status === 401) { setLoading(false); return }
      const data = await res.json()
      setPosts(data)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (me && me !== 'loading') load()
  }, [me, load])

  // Redirect if not logged in after loading
  if (me === null) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-10 max-w-sm w-full text-center">
          <div className="w-16 h-16 bg-medical-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <Lock className="w-8 h-8 text-medical-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Только для участников</h2>
          <p className="text-sm text-gray-500 mb-6 leading-relaxed">
            Сообщество доступно только зарегистрированным пользователям платформы
          </p>
          <div className="flex gap-3">
            <Link href="/auth/login"
              className="flex-1 py-2.5 text-sm font-medium border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors text-center">
              Войти
            </Link>
            <Link href="/auth/register"
              className="flex-1 py-2.5 text-sm font-medium bg-medical-600 text-white rounded-xl hover:bg-medical-700 transition-colors text-center">
              Регистрация
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim()) return
    setPosting(true)
    try {
      const res  = await fetch('/api/community', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ content, category }),
      })
      if (res.ok) {
        const post = await res.json()
        setPosts((p) => [post, ...p])
        setContent('')
        textRef.current?.focus()
      }
    } finally {
      setPosting(false)
    }
  }

  const handleLike = async (id: string) => {
    const res = await fetch(`/api/community/${id}`, { method: 'PATCH' })
    if (res.ok) {
      const updated = await res.json()
      setPosts((p) => p.map((post) => post.id === id ? updated : post))
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Удалить сообщение?')) return
    const res = await fetch(`/api/community/${id}`, { method: 'DELETE' })
    if (res.ok) setPosts((p) => p.filter((post) => post.id !== id))
  }

  const handleReply = async (postId: string) => {
    if (!replyText.trim()) return
    setReplying(true)
    try {
      const res = await fetch(`/api/community/${postId}/reply`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ content: replyText }),
      })
      if (res.ok) {
        const reply = await res.json()
        setPosts((p) => p.map((post) =>
          post.id === postId ? { ...post, replies: [...post.replies, reply] } : post
        ))
        setReplyText('')
        setReplyOf(null)
        setExpanded((s) => new Set(Array.from(s).concat(postId)))
      }
    } finally {
      setReplying(false)
    }
  }

  const handleDeleteReply = async (postId: string, replyId: string) => {
    if (!confirm('Удалить ответ?')) return
    await fetch(`/api/community/${postId}/reply`, {
      method:  'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ replyId }),
    })
    setPosts((p) => p.map((post) =>
      post.id === postId
        ? { ...post, replies: post.replies.filter((r) => r.id !== replyId) }
        : post
    ))
  }

  const isAdmin = me !== 'loading' && me && (me.role === 'ADMIN' || me.role === 'EDITOR')
  const filtered = filter === 'all' ? posts : posts.filter((p) => p.category === filter)

  return (
    <div className="min-h-screen bg-gray-50/60">
      {/* Hero */}
      <div className="bg-gradient-to-br from-medical-600 to-medical-800 text-white py-12 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/15 border border-white/20 px-4 py-1.5 rounded-full text-sm mb-4">
            <MessageCircle className="w-4 h-4" />
            Только для участников
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-2">Сообщество</h1>
          <p className="text-white/70 text-base">
            Делитесь идеями, задавайте вопросы, предлагайте улучшения
          </p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">

        {/* Compose */}
        {me && me !== 'loading' && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-xl shrink-0">
                {me.avatarEmoji ?? '👤'}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">{me.name ?? me.email.split('@')[0]}</p>
                <p className="text-xs text-gray-400">Написать сообщение</p>
              </div>
            </div>

            {/* Category tabs */}
            <div className="flex gap-2 mb-3 flex-wrap">
              {CATEGORIES.map((c) => (
                <button key={c.value} onClick={() => setCategory(c.value)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full border transition-all ${
                    category === c.value ? `${c.bg} ${c.color} border-current` : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100'
                  }`}>
                  {c.icon}{c.label}
                </button>
              ))}
            </div>

            <form onSubmit={handlePost}>
              <textarea
                ref={textRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handlePost(e) }}
                placeholder={
                  category === 'idea'     ? 'Предложите идею для платформы...' :
                  category === 'question' ? 'Задайте вопрос сообществу...' :
                  category === 'feedback' ? 'Поделитесь пожеланием...' :
                  'Напишите что-нибудь...'
                }
                rows={3}
                maxLength={2000}
                className="w-full text-sm text-gray-900 placeholder-gray-400 border border-gray-200 rounded-xl px-4 py-3 resize-none focus:outline-none focus:border-medical-400 focus:ring-2 focus:ring-medical-100 transition-all"
              />
              <div className="flex items-center justify-between mt-3">
                <span className="text-xs text-gray-400">{content.length}/2000 · Ctrl+Enter для отправки</span>
                <button type="submit" disabled={posting || !content.trim()}
                  className="flex items-center gap-2 px-4 py-2 bg-medical-600 text-white text-sm font-medium rounded-xl hover:bg-medical-700 disabled:opacity-50 transition-colors">
                  <Send className="w-3.5 h-3.5" />
                  {posting ? 'Публикую...' : 'Опубликовать'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Filter */}
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => setFilter('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-all ${filter === 'all' ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}>
            Все {posts.length > 0 && `(${posts.length})`}
          </button>
          {CATEGORIES.map((c) => {
            const cnt = posts.filter((p) => p.category === c.value).length
            return (
              <button key={c.value} onClick={() => setFilter(c.value)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full border transition-all ${
                  filter === c.value ? `${c.bg} ${c.color}` : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                }`}>
                {c.icon}{c.label} {cnt > 0 && `(${cnt})`}
              </button>
            )
          })}
        </div>

        {/* Posts */}
        {loading ? (
          <div className="space-y-4">
            {[0,1,2].map((i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse">
                <div className="flex gap-3 mb-3">
                  <div className="w-9 h-9 bg-gray-100 rounded-full" />
                  <div className="flex-1">
                    <div className="h-3 bg-gray-100 rounded w-1/4 mb-2" />
                    <div className="h-3 bg-gray-100 rounded w-1/6" />
                  </div>
                </div>
                <div className="h-4 bg-gray-100 rounded w-3/4 mb-2" />
                <div className="h-4 bg-gray-100 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <MessageCircle className="w-12 h-12 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">Пока тут пусто</p>
            <p className="text-sm text-gray-400 mt-1">Будьте первым — напишите идею или вопрос</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((post) => {
              const cat     = catMeta(post.category)
              const liked   = me && me !== 'loading' && post.likes.includes(me.userId)
              const isOwner = me && me !== 'loading' && post.userId === me.userId
              const showReplies = expanded.has(post.id)

              return (
                <div key={post.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="p-5">
                    {/* Header */}
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-xl shrink-0 mt-0.5">
                        {post.avatarEmoji}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-semibold text-gray-900">{post.userName}</span>
                          {post.specialty && (
                            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{post.specialty}</span>
                          )}
                          <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border ${cat.bg} ${cat.color}`}>
                            {cat.icon}{cat.label}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 mt-0.5">{timeAgo(post.createdAt)}</p>
                      </div>
                      {(isOwner || isAdmin) && (
                        <button onClick={() => handleDelete(post.id)}
                          className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors shrink-0">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    {/* Content */}
                    <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">{post.content}</p>

                    {/* Actions */}
                    <div className="flex items-center gap-4 mt-4 pt-3 border-t border-gray-50">
                      <button onClick={() => handleLike(post.id)}
                        className={`flex items-center gap-1.5 text-sm transition-colors ${liked ? 'text-red-500' : 'text-gray-400 hover:text-red-400'}`}>
                        <Heart className={`w-4 h-4 ${liked ? 'fill-red-500' : ''}`} />
                        <span className="text-xs font-medium">{post.likes.length || ''}</span>
                      </button>
                      <button
                        onClick={() => { setReplyOf(replyOf === post.id ? null : post.id); setReplyText('') }}
                        className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-medical-600 transition-colors">
                        <MessageCircle className="w-4 h-4" />
                        {post.replies.length > 0 ? `${post.replies.length} ответов` : 'Ответить'}
                      </button>
                      {post.replies.length > 0 && (
                        <button
                          onClick={() => setExpanded((s) => {
                            const n = new Set(s)
                            n.has(post.id) ? n.delete(post.id) : n.add(post.id)
                            return n
                          })}
                          className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 ml-auto transition-colors">
                          {showReplies ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                          {showReplies ? 'Скрыть' : 'Показать ответы'}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Reply input */}
                  {replyOf === post.id && (
                    <div className="px-5 pb-4 border-t border-gray-50 pt-3">
                      <div className="flex gap-2">
                        <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-sm shrink-0 mt-0.5">
                          {me && me !== 'loading' ? (me.avatarEmoji ?? '👤') : '👤'}
                        </div>
                        <div className="flex-1">
                          <textarea
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleReply(post.id) }}
                            placeholder="Ваш ответ..."
                            rows={2}
                            maxLength={1000}
                            autoFocus
                            className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 resize-none focus:outline-none focus:border-medical-400 focus:ring-2 focus:ring-medical-100 transition-all"
                          />
                          <div className="flex justify-end gap-2 mt-2">
                            <button onClick={() => { setReplyOf(null); setReplyText('') }}
                              className="text-xs text-gray-400 hover:text-gray-600 px-3 py-1.5 rounded-lg transition-colors">
                              Отмена
                            </button>
                            <button onClick={() => handleReply(post.id)} disabled={replying || !replyText.trim()}
                              className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 bg-medical-600 text-white rounded-lg hover:bg-medical-700 disabled:opacity-50 transition-colors">
                              <Send className="w-3 h-3" />
                              {replying ? 'Отправка...' : 'Ответить'}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Replies */}
                  {showReplies && post.replies.length > 0 && (
                    <div className="border-t border-gray-50 divide-y divide-gray-50">
                      {post.replies.map((reply) => {
                        const isReplyOwner = me && me !== 'loading' && reply.userId === me.userId
                        return (
                          <div key={reply.id} className="flex gap-3 px-5 py-3">
                            <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-sm shrink-0 mt-0.5">
                              {reply.avatarEmoji}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-semibold text-gray-900">{reply.userName}</span>
                                {reply.specialty && <span className="text-[10px] text-gray-400">{reply.specialty}</span>}
                                <span className="text-[10px] text-gray-400 ml-auto">{timeAgo(reply.createdAt)}</span>
                                {(isReplyOwner || isAdmin) && (
                                  <button onClick={() => handleDeleteReply(post.id, reply.id)}
                                    className="text-gray-300 hover:text-red-500 transition-colors">
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                )}
                              </div>
                              <p className="text-xs text-gray-700 leading-relaxed whitespace-pre-wrap">{reply.content}</p>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
