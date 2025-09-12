'use client'

import React from 'react'

interface VibeCaaSLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  showText?: boolean
  className?: string
}

export function VibeCaaSLogo({ size = 'md', showText = true, className = '' }: VibeCaaSLogoProps) {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16',
    xl: 'h-20 w-20'
  }

  const textSizeClasses = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl',
    xl: 'text-4xl'
  }

  return (
    <div className={`flex items-center ${className}`}>
      {/* Logo Icon */}
      <div className={`${sizeClasses[size]} relative flex-shrink-0`}>
        {/* Purple Circle Background */}
        <div className="w-full h-full bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
          {/* Curly Brace */}
          <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <svg
              width="20"
              height="24"
              viewBox="0 0 20 24"
              fill="none"
              className="text-black"
            >
              <path
                d="M6 2C4.5 2 3.5 3 3.5 4.5C3.5 5.5 4 6.5 5 7C4 7.5 3.5 8.5 3.5 9.5C3.5 11 4.5 12 6 12"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
              <path
                d="M14 2C15.5 2 16.5 3 16.5 4.5C16.5 5.5 16 6.5 15 7C16 7.5 16.5 8.5 16.5 9.5C16.5 11 15.5 12 14 12"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            </svg>
          </div>
          
          {/* Musical Note */}
          <div className="absolute left-1/2 top-1/2 transform translate-x-1 -translate-y-1">
            <svg
              width="16"
              height="20"
              viewBox="0 0 16 20"
              fill="none"
              className="text-black"
            >
              <path
                d="M8 2V14C8 15.1 7.1 16 6 16C4.9 16 4 15.1 4 14C4 12.9 4.9 12 6 12C6.5 12 6.9 12.1 7.2 12.3V2H8Z"
                fill="currentColor"
              />
              <path
                d="M12 2V14C12 15.1 11.1 16 10 16C8.9 16 8 15.1 8 14C8 12.9 8.9 12 10 12C10.5 12 10.9 12.1 11.2 12.3V2H12Z"
                fill="currentColor"
              />
              <path
                d="M6 16V18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <path
                d="M10 16V18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Text */}
      {showText && (
        <div className="ml-3">
          <div className={`${textSizeClasses[size]} font-bold text-gray-900 dark:text-white`}>
            VibeCaaS.com
          </div>
          <div className={`text-xs text-gray-500 dark:text-gray-400 -mt-1`}>
            Vibe Coding as a Service
          </div>
        </div>
      )}
    </div>
  )
}