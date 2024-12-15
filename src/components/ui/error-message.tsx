interface ErrorMessageProps {
  message: string
  className?: string
}

export function ErrorMessage({ message, className }: ErrorMessageProps) {
  return (
    <div className={`p-4 text-sm text-red-700 bg-red-100 rounded-lg ${className}`}>
      {message}
    </div>
  )
} 