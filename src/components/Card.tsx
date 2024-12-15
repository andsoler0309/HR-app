interface CardProps {
    children: React.ReactNode
    className?: string
  }
  
  export function Card({ children, className = '' }: CardProps) {
    return (
      <div className={`bg-white rounded-lg border-card-border shadow p-6 ${className}`}>
        {children}
      </div>
    )
  }