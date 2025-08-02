import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Package,
  MapPin,
  Clock,
  CheckCircle,
  Plus,
  Search,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useGetCustomerDashboardDataQuery } from "@/store/api/parcelApi";
import { useAppSelector } from "@/hooks/redux";
import { getStatusColor, formatDate } from "@/lib/utils";

export default function CustomerDashboard() {
  const { user } = useAppSelector((state) => state.auth);
  const { data: parcels, isLoading } = useGetCustomerDashboardDataQuery();
  const recentParcels = parcels?.recentBooking || [];

  const quickStats = [
    {
      title: "Active Shipments",
      value:
        (parcels?.["IN TRANSIT"] ?? 0) +
        (parcels?.["PENDING"] ?? 0) +
        (parcels?.["PICKED UP"] ?? 0),
      icon: Package,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Pending",
      value: parcels?.PENDING ?? 0,
      icon: Clock,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100",
    },
    {
      title: "Picked Up",
      value: parcels?.["PICKED UP"] ?? 0,
      icon: Package,
      color: "text-indigo-600",
      bgColor: "bg-indigo-100",
    },
    {
      title: "In Transit",
      value: parcels?.["IN TRANSIT"] ?? 0,
      icon: MapPin,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
    {
      title: "Delivered",
      value: parcels?.DELIVERED ?? 0,
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Failed",
      value: parcels?.FAILED ?? 0,
      icon: Package,
      color: "text-red-600",
      bgColor: "bg-red-100",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold">
            Welcome back, {user?.name?.split(" ")[0]}!
          </h1>
          <p className="text-gray-600">
            Track your parcels and manage your shipments
          </p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <Button asChild>
            <Link to="/customer/book">
              <Plus className="mr-2 h-4 w-4" />
              Book New Parcel
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/customer/track">
              <Search className="mr-2 h-4 w-4" />
              Track Parcel
            </Link>
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-6">
        {quickStats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-full ${stat.bgColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions & Recent Parcels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button className="w-full justify-start" asChild>
              <Link to="/customer/book">
                <Plus className="mr-2 h-4 w-4" />
                Book New Parcel
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link to="/customer/track">
                <Search className="mr-2 h-4 w-4" />
                Track Existing Parcel
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link to="/customer/bookings">
                <Package className="mr-2 h-4 w-4" />
                View All Bookings
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Recent Parcels */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Parcels</CardTitle>
            <Button variant="outline" size="sm" asChild>
              <Link to="/customer/bookings">View All</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/4" />
                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                    <div className="h-3 bg-gray-200 rounded w-1/3" />
                  </div>
                ))}
              </div>
            ) : recentParcels.length > 0 ? (
              <div className="space-y-4">
                {recentParcels.map((parcel) => (
                  <div
                    key={parcel.id}
                    className="flex items-start justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium">{parcel.tracking_id}</p>
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded ${getStatusColor(
                            parcel.status
                          )}`}
                        >
                          {parcel.status.replace(/_/g, " ")}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        From: {parcel.pickup_address}
                      </p>
                      <p className="text-sm text-gray-600">
                        To: {parcel.delivery_address}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDate(parcel.created_at)}
                      </p>
                    </div>
                    <Button variant="ghost" size="sm" asChild>
                      <Link
                        to={`/customer/track?tracking=${parcel.tracking_id}`}
                      >
                        Track
                      </Link>
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No parcels yet</p>
                <Button className="mt-4" asChild>
                  <Link to="/customer/book">Book Your First Parcel</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
