import React from 'react'

const VARIANTS = {
  primary: 'bg-rose-500 text-white hover:bg-rose-600 shadow-soft disabled:bg-rose-200',
  secondary: 'bg-plum-500 text-white hover:bg-plum-600 shadow-soft disabled:bg-plum-100',
  teal: 'bg-teal-500 text-white hover:bg-teal-600 shadow-soft disabled:bg-teal-100',
  outline: 'bg-transparent border-2 border-ink-800 text-ink-800 hover:bg-ink-800 hover:text-white',
  ghost: 'bg-transparent text-ink-700 hover:bg-ink-100',
  subtle: 'bg-rose-50 text-rose-600 hover:bg-rose-100',
  danger: 'bg-white border-2 border-rose-500 text-rose-600 hover:bg-rose-50',
}

const SIZES = {
  sm: 'px-3.5 py-1.5 text-sm',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-7 py-3.5 text-base',
}

export default function Button({
  as: As = 'button',
  variant = 'primary',
  size = 'md',
  icon: Icon,
  iconPosition = 'left',
  fullWidth = false,
  className = '',
  children,
  ...props
}) {
  return (
    <As
      className={[
        'inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all duration-200',
        'active:scale-[0.97] disabled:cursor-not-allowed disabled:active:scale-100',
        VARIANTS[variant],
        SIZES[size],
        fullWidth ? 'w-full' : '',
        className,
      ].join(' ')}
      {...props}
    >
      {Icon && iconPosition === 'left' && <Icon size={size === 'lg' ? 20 : 16} strokeWidth={2.25} />}
      {children}
      {Icon && iconPosition === 'right' && <Icon size={size === 'lg' ? 20 : 16} strokeWidth={2.25} />}
    </As>
  )
}