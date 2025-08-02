import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { Provider } from "react-redux"
import { store,persistor  } from "@/store"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
import { SocketProvider } from "@/contexts/SocketContext"
import { Toaster } from "@/components/ui/sonner"
import { PersistGate } from "redux-persist/integration/react"



// Layouts
import AdminLayout from "@/components/layouts/AdminLayout"
import CustomerLayout from "@/components/layouts/CustomerLayout"
import AgentLayout from "@/components/layouts/AgentLayout"


// Pages
import Login from "@/pages/Login"
import Register from "@/pages/Register"
import AdminDashboard from "@/pages/admin/Dashboard"
import CustomerDashboard from "@/pages/customer/Dashboard"
import AgentDashboard from "@/pages/agent/Dashboard"
import BookParcel from "@/pages/customer/BookParcel"
import TrackParcel from "@/pages/customer/TrackParcel"
import RouteOptimization from "@/pages/agent/RouteOptimization"
import AssignedParcels from "@/pages/agent/AssignedParcels"
import MyBookings from "./pages/customer/MyBookingList"
import AdminParcels from "./pages/admin/Parcel"
import User from "./pages/admin/User"


// Auth guard component
function AuthGuard() {
  const token = localStorage.getItem("token")

  if (!token) {
    return <Navigate to="/login" replace />
  }
  return <Navigate to="/admin" replace />
}


function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
      <SocketProvider>
        <Router>
          <div className="App">
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Root redirect */}
              <Route path="/" element={<AuthGuard />} />

              <Route
                path="/admin"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <AdminLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<AdminDashboard />} />
                <Route path="parcels" element={<AdminParcels />} />
                <Route path="users" element={<div><User/></div>} />
              </Route>

              {/* Customer routes */}
              <Route
                path="/customer"
                element={
                  <ProtectedRoute allowedRoles={["customer"]}>
                    <CustomerLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<CustomerDashboard />} />
                <Route path="book" element={<BookParcel />} />
                <Route path="track/:tracking_id" element={<TrackParcel />} />
                <Route path="track" element={<TrackParcel />} />
                <Route path="bookings" element={<MyBookings />} />
              </Route>

              {/* Agent routes */}
              <Route
                path="/agent"
                element={
                  <ProtectedRoute allowedRoles={["agent"]}>
                    <AgentLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<AgentDashboard />} />
                <Route path="parcels" element={<AssignedParcels />} />
                <Route path="routes" element={<RouteOptimization />} />
              </Route>

              {/* Catch all */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>

            <Toaster />
          </div>
        </Router>
      </SocketProvider>
      </PersistGate>
    </Provider>
  )
}

export default App
