interface LogoProps {
  className?: string
}

export const Logo = ({ className = '' }: LogoProps) => {
  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
        <span className="text-white font-bold text-lg">F</span>
      </div>
              <span className="text-xl font-bold text-secondary-900">Finviser</span>
    </div>
  )
} 