export type Role = 'ADMIN' | 'EDITOR' | 'USER'
export type Category =
  | 'THERAPY' | 'SURGERY' | 'CARDIOLOGY' | 'NEUROLOGY'
  | 'PEDIATRICS' | 'GYNECOLOGY' | 'ANESTHESIOLOGY'
  | 'PHARMACOLOGY' | 'OTHER'
export type FileType = 'PDF' | 'DOCX' | 'PPTX'

export interface User {
  id: string
  email: string
  name: string
  role: Role
  avatar?: string
  createdAt: string
}

export interface Material {
  id: string
  title: string
  description: string
  author: string
  year: number
  category: Category
  fileType: FileType
  fileUrl: string
  previewUrl?: string
  fileSize: number
  pageCount?: number
  tags: string[]
  isPublished: boolean
  viewCount: number
  downloadCount: number
  createdAt: string
  updatedAt: string
  avgRating?: number
  userRating?: number
  isFavorite?: boolean
  commentsCount?: number
}

export interface Comment {
  id: string
  content: string
  userId: string
  materialId: string
  createdAt: string
  user: { name: string; avatar?: string }
}

export interface ViewHistory {
  id: string
  materialId: string
  viewedAt: string
  material: Material
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  perPage: number
  totalPages: number
}

export interface SearchFilters {
  query?: string
  category?: Category
  year?: number
  fileType?: FileType
  page?: number
  perPage?: number
  sortBy?: 'createdAt' | 'viewCount' | 'downloadCount' | 'title' | 'year'
  sortOrder?: 'asc' | 'desc'
}

export interface AdminStats {
  totalMaterials: number
  totalUsers: number
  totalDownloads: number
  totalViews: number
  byCategory: Record<string, number>
  recentMaterials: Material[]
  topMaterials: Material[]
}

export interface AuthPayload {
  userId: string
  email: string
  role: Role
}

export const CATEGORY_LABELS: Record<Category, string> = {
  THERAPY:        'Терапия',
  SURGERY:        'Хирургия',
  CARDIOLOGY:     'Кардиология',
  NEUROLOGY:      'Неврология',
  PEDIATRICS:     'Педиатрия',
  GYNECOLOGY:     'Гинекология',
  ANESTHESIOLOGY: 'Анестезиология',
  PHARMACOLOGY:   'Фармакология',
  OTHER:          'Другие специальности',
}

export const CATEGORY_ICONS: Record<Category, string> = {
  THERAPY:        '🫀',
  SURGERY:        '🔬',
  CARDIOLOGY:     '❤️',
  NEUROLOGY:      '🧠',
  PEDIATRICS:     '👶',
  GYNECOLOGY:     '🌸',
  ANESTHESIOLOGY: '💉',
  PHARMACOLOGY:   '💊',
  OTHER:          '📋',
}

export const FILE_TYPE_COLORS: Record<FileType, string> = {
  PDF:  'bg-red-100 text-red-700',
  DOCX: 'bg-blue-100 text-blue-700',
  PPTX: 'bg-orange-100 text-orange-700',
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024)        return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
