interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost'
  size?: 'default' | 'icon'
}

export function Button({ 
  children, 
  variant = 'primary', 
  size = 'default',
  className = '',
  ...props 
}: ButtonProps) {
  const baseStyles = "inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 rounded-md"
  
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700",
    ghost: "hover:bg-gray-100 text-gray-600 hover:text-gray-900"
  }
  
  const sizes = {
    default: "h-10 px-4 py-2",
    icon: "h-10 w-10"
  }
  
  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}