import { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
}

export const Card = ({ children, className = '' }: CardProps) => {
  return (
    <div className={`card ${className}`}>
      {children}
    </div>
  )
}

interface CardHeaderProps {
  children: ReactNode
  className?: string
}

export const CardHeader = ({ children, className = '' }: CardHeaderProps) => {
  return (
    <div className={`card-header ${className}`}>
      {children}
    </div>
  )
}

interface CardTitleProps {
  children: ReactNode
  className?: string
}

export const CardTitle = ({ children, className = '' }: CardTitleProps) => {
  return (
    <h3 className={`card-title ${className}`}>
      {children}
    </h3>
  )
}

interface CardContentProps {
  children: ReactNode
  className?: string
}

export const CardContent = ({ children, className = '' }: CardContentProps) => {
  return (
    <div className={`card-content ${className}`}>
      {children}
    </div>
  )
}

interface CardFooterProps {
  children: ReactNode
  className?: string
}

export const CardFooter = ({ children, className = '' }: CardFooterProps) => {
  return (
    <div className={`card-footer ${className}`}>
      {children}
    </div>
  )
} 