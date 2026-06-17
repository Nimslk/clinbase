export default function TeamBanner() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900">
        {/* Decorative blur blobs */}
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-medical-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative flex flex-col sm:flex-row items-center gap-6 p-6 sm:p-8">
          {/* Photo */}
          <div className="shrink-0">
            <img
              src="/team-photo.jpg"
              alt="Команда MedGuide"
              className="w-32 h-32 sm:w-40 sm:h-40 rounded-2xl object-cover border-2 border-white/15 shadow-2xl"
            />
          </div>

          {/* Text */}
          <div className="flex-1 text-center sm:text-left">
            <p className="text-white/40 text-xs uppercase tracking-widest font-semibold mb-2">
              Девиз команды
            </p>
            <blockquote className="text-white text-xl sm:text-2xl lg:text-3xl font-bold leading-snug tracking-tight">
              «Нет никакой причины<br className="hidden sm:block" />
              не прилагать максимум усилий»
            </blockquote>
            <div className="mt-4 flex items-center justify-center sm:justify-start gap-3">
              <div className="h-px w-8 bg-medical-400/60" />
              <p className="text-white/40 text-sm">MedGuide Library · СПбГПМУ × ТГМУ</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
