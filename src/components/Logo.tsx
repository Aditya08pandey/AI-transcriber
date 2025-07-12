import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ size = 'md', showText = true, className = '' }) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const textSizes = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-2xl',
    xl: 'text-3xl'
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Logo Icon */}
      <div className={`relative ${sizeClasses[size]} flex-shrink-0`}>
        {/* Background Circle */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full animate-pulse"></div>
        
        {/* Wave Lines */}
        <div className="absolute inset-1 flex items-center justify-center">
          <div className="relative w-full h-full">
            {/* Wave 1 */}
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 24 24" fill="none">
              <path
                d="M2 12C2 12 4 8 8 8C12 8 14 12 18 12C22 12 24 8 24 8"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                className="animate-wave"
              />
            </svg>
            
            {/* Wave 2 */}
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 24 24" fill="none">
              <path
                d="M2 16C2 16 4 12 8 12C12 12 14 16 18 16C22 16 24 12 24 12"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                className="animate-wave-delayed"
              />
            </svg>
            
            {/* AI Dot */}
            <div className="absolute top-1 right-1 w-2 h-2 bg-yellow-400 rounded-full animate-ping"></div>
          </div>
        </div>
        
        {/* Glow Effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-purple-500/20 rounded-full blur-sm"></div>
      </div>

      {/* Text */}
      {showText && (
        <div className="flex items-center">
          <span className={`font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent ${textSizes[size]}`}>
            Transcribe
          </span>
          <span className={`font-bold text-gray-600 ${textSizes[size]}`}>
            .ai
          </span>
        </div>
      )}
    </div>
  );
};

export default Logo; 