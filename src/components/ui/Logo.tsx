import { cn } from '@/lib/utils'

interface LogoIconProps {
  size?: number
  className?: string
}

export function LogoIcon({ size = 36, className }: LogoIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="lg1" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#3b96f7" />
          <stop offset="100%" stopColor="#1558d6" />
        </linearGradient>
        <linearGradient id="lg2" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#60b5fb" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#3b96f7" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Background rounded square */}
      <rect width="40" height="40" rx="10" fill="url(#lg1)" />

      {/* Shine overlay */}
      <rect width="40" height="20" rx="10" fill="url(#lg2)" />

      {/* Book pages — left page */}
      <path
        d="M8 12 C8 11 9 10 10 10 L19 10 L19 30 L10 30 C9 30 8 29 8 28 Z"
        fill="white"
        fillOpacity="0.95"
      />
      {/* Book pages — right page */}
      <path
        d="M21 10 L30 10 C31 10 32 11 32 12 L32 28 C32 29 31 30 30 30 L21 30 Z"
        fill="white"
        fillOpacity="0.75"
      />
      {/* Book spine */}
      <rect x="19" y="10" width="2" height="20" fill="white" fillOpacity="0.5" />

      {/* Medical cross on left page */}
      <rect x="13" y="17" width="2" height="6" rx="1" fill="url(#lg1)" />
      <rect x="11" y="19" width="6" height="2" rx="1" fill="url(#lg1)" />

      {/* Lines on right page */}
      <rect x="23" y="17" width="6" height="1.5" rx="0.75" fill="url(#lg1)" fillOpacity="0.7" />
      <rect x="23" y="20" width="4" height="1.5" rx="0.75" fill="url(#lg1)" fillOpacity="0.5" />
      <rect x="23" y="23" width="5" height="1.5" rx="0.75" fill="url(#lg1)" fillOpacity="0.4" />
    </svg>
  )
}

interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  showText?: boolean
  className?: string
  textClassName?: string
  dark?: boolean
}

export default function Logo({ size = 'md', showText = true, className, textClassName, dark = false }: LogoProps) {
  const sizes = { sm: 28, md: 36, lg: 48 }
  const textSizes = { sm: 'text-base', md: 'text-lg', lg: 'text-2xl' }

  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <LogoIcon size={sizes[size]} />
      {showText && (
        <div className={cn('leading-tight', textClassName)}>
          <span className={cn('font-bold', textSizes[size], dark ? 'text-white' : 'text-gray-900')}>
            Clin
          </span>
          <span className={cn('font-bold', textSizes[size], 'text-medical-500')}>
            Base
          </span>
        </div>
      )}
    </div>
  )
}
