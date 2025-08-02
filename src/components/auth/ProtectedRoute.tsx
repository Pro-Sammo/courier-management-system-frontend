import type React from "react"
import { Navigate, useLocation } from "react-router-dom"
import { useAppSelector } from "@/hooks/redux"
import type { User } from "@/types"

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles?: Array<User["role"]>
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth)
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    // Redirect to appropriate dashboard based on user role
    const dashboardRoutes = {
      admin: "/admin",
      customer: "/customer",
      agent: "/agent",
    }
    return <Navigate to={dashboardRoutes[user.role]} replace />
  }

  return <>{children}</>
}
