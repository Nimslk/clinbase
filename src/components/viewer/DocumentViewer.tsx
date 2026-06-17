'use client'
import { useState, useRef } from 'react'
import { Maximize2, Minimize2, Download, RefreshCw, ExternalLink, Loader2 } from 'lucide-react'
import type { Material } from '@/types'

interface DocumentViewerProps {
  material: Material
}

export default function DocumentViewer({ material }: DocumentViewerProps) {
  const [fullscreen, setFullscreen] = useState(false)
  const [loading, setLoading]       = useState(true)
  const [reloadKey, setReloadKey]   = useState(0)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  const isLocal  = material.fileUrl.startsWith('/uploads/')
  const isPDF    = material.fileType === 'PDF'

  // Local PDFs → native browser viewer
  // External or non-PDF → Google Docs Viewer
  const viewerSrc = isLocal && isPDF
    ? material.fileUrl
    : `https://docs.google.com/viewer?url=${encodeURIComponent(
        isLocal
          ? `${typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'}${material.fileUrl}`
          : material.fileUrl
      )}&embedded=true`

  const canPreview = isPDF || !isLocal

  return (
    <div className={`flex flex-col bg-gray-100 ${fullscreen ? 'fixed inset-0 z-50' : 'h-full'}`}>
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-white border-b border-gray-200 shrink-0 gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold
            ${material.fileType === 'PDF' ? 'bg-red-100 text-red-600' :
              material.fileType === 'DOCX' ? 'bg-blue-100 text-blue-600' :
              'bg-orange-100 text-orange-600'}`}>
            {material.fileType}
          </div>
          <span className="text-sm font-medium text-gray-700 truncate max-w-xs lg:max-w-md">
            {material.title}
          </span>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {canPreview && (
            <button
              onClick={() => { setLoading(true); setReloadKey((k) => k + 1) }}
              title="Перезагрузить"
              className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          )}
          <a
            href={viewerSrc}
            target="_blank"
            rel="noopener noreferrer"
            title="Открыть в новой вкладке"
            className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
          <a
            href={material.fileUrl}
            download
            title="Скачать"
            className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-colors"
          >
            <Download className="w-4 h-4" />
          </a>
          <div className="w-px h-5 bg-gray-200 mx-0.5" />
          <button
            onClick={() => setFullscreen((f) => !f)}
            title={fullscreen ? 'Свернуть' : 'Полный экран'}
            className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-colors"
          >
            {fullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Viewer */}
      <div className="flex-1 relative overflow-hidden">
        {/* Loading overlay */}
        {loading && canPreview && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-gray-50 gap-3">
            <Loader2 className="w-8 h-8 text-medical-500 animate-spin" />
            <p className="text-sm text-gray-500">Загрузка документа…</p>
          </div>
        )}

        {canPreview ? (
          <iframe
            key={reloadKey}
            ref={iframeRef}
            src={viewerSrc}
            className="w-full h-full border-0"
            title={material.title}
            onLoad={() => setLoading(false)}
            allow="fullscreen"
          />
        ) : (
          /* DOCX/PPTX local files — offer download */
          <div className="h-full flex flex-col items-center justify-center gap-5 p-8 text-center">
            <div className="w-20 h-20 bg-blue-50 rounded-2xl flex items-center justify-center">
              <span className="text-4xl">{material.fileType === 'DOCX' ? '📝' : '📊'}</span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">{material.title}</h3>
              <p className="text-sm text-gray-500 max-w-sm">
                Файлы {material.fileType} можно открыть через Microsoft Office или Google Docs.
                Нажмите «Скачать» или откройте напрямую.
              </p>
            </div>
            <div className="flex gap-3">
              <a
                href={material.fileUrl}
                download
                className="flex items-center gap-2 px-5 py-2.5 bg-medical-600 text-white text-sm font-medium rounded-xl hover:bg-medical-700 transition-colors shadow-sm"
              >
                <Download className="w-4 h-4" />
                Скачать {material.fileType}
              </a>
              <a
                href={`https://docs.google.com/viewer?url=${encodeURIComponent(
                  typeof window !== 'undefined'
                    ? `${window.location.origin}${material.fileUrl}`
                    : `http://localhost:3000${material.fileUrl}`
                )}&embedded=true`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-50 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                Google Viewer
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
