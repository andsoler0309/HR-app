import React from "react"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background py-16 px-6 sm:px-8 lg:px-10">
      <div className="max-w-lg w-full space-y-10"> {/* Changed from max-w-md to max-w-lg */}
        {children}
      </div>
    </div>
  )
}
