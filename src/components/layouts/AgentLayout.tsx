import { useState } from "react"
import { Outlet, Link, useLocation } from "react-router-dom"
import { Truck, MapPin, Package, LogOut, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAppSelector, useAppDispatch } from "@/hooks/redux"
import { logout } from "@/store/slices/authSlice"
import { FILE_LOCATION } from "@/miscellaneous/constants"
import AgentLocationBroadcaster from "../location/AgentLocationBroadcaster"

const navigation = [
  { name: "Dashboard", href: "/agent", icon: Truck },
  { name: "Assigned Parcels", href: "/agent/parcels", icon: Package },
  { name: "Route Optimization", href: "/agent/routes", icon: MapPin }
]

export default function AgentLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()
  const { user } = useAppSelector((state) => state.auth)
  const dispatch = useAppDispatch()

  const handleLogout = () => {
    dispatch(logout())
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform lg:translate-x-0 lg:static lg:inset-0 transition duration-200 ease-in-out lg:transition-none`}
      >
        <div className="flex items-center justify-center h-16 bg-orange-600">
          <span className="ml-2 text-xl font-bold text-white">Agent Panel</span>
        </div>

        <nav className="mt-8">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center px-6 py-3 text-sm font-medium ${
                  isActive
                    ? "bg-orange-50 border-r-4 border-orange-600 text-orange-600"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.name}
              </Link>
            )
          })}
        </nav>
          <AgentLocationBroadcaster/>
        <div className="absolute bottom-0 w-full p-4">
          <div className="mb-4">
          </div>
          <div className="mb-4 p-3 bg-green-50 rounded-lg">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-green-700">Online</span>
            </div>
            <p className="text-xs text-green-600 mt-1">Ready for deliveries</p>
          </div>
          <Button
            variant="ghost"
            className="w-full justify-start text-gray-600 hover:text-gray-900"
            onClick={handleLogout}
          >
            <LogOut className="mr-3 h-5 w-5" />
            Logout
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
        {/* Top navigation */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between px-4 py-4">
            <div className="flex items-center">
              <Button variant="ghost" size="sm" className="lg:hidden" onClick={() => setSidebarOpen(!sidebarOpen)}>
                <Menu className="h-6 w-6" />
              </Button>

              <div className="ml-4">
                <h1 className="text-xl font-semibold text-gray-900">Agent Panel</h1>
                <p className="text-sm text-gray-500">Manage your deliveries efficiently</p>
              </div>
            </div>

            <div className="flex items-center gap-4">

              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={`${FILE_LOCATION}/${user?.photo}`} />
                  <AvatarFallback>
                    {user?.name
                      ?.split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden md:block">
                  <p className="text-sm font-medium">{user?.name}</p>
                  <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
          <Outlet />
        </main>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black bg-opacity-25 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}
    </div>
  )
}
