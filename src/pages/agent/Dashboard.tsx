import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Package,
  MapPin,
  Clock,
  CheckCircle,
  Navigation,
  AlertCircle,
  Route,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAppSelector } from "@/hooks/redux";
import { getStatusColor } from "@/lib/utils";
import { useGetAgentDashboardDataQuery } from "@/store/api/parcelApi";
import { useNavigate } from "react-router-dom";


export default function AgentDashboard() {
  const { user } = useAppSelector((state) => state.auth);
  const { data: stats, isLoading } = useGetAgentDashboardDataQuery();

  const navigate = useNavigate();

  const todaysParcels = stats?.assigned_parcel_details.slice(0, 5) || [];

  const agentStats = [
    {
      title: "Today's Deliveries",
      value: stats?.total_assigned_today || "0",
      icon: Package,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Completed",
      value: stats?.delivered_count || "0",
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "In Progress",
      value: stats?.in_transit_count || "0",
      icon: Clock,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
    {
      title: "Failed/Pending",
      value:
        String(
          Number(stats?.pending_count || 0) + Number(stats?.failed_count || 0)
        ) || "0",
      icon: AlertCircle,
      color: "text-red-600",
      bgColor: "bg-red-100",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            Good morning, {user?.name?.split(" ")[0]}!
          </h1>
          <p className="text-gray-600">
            You have {stats?.total_assigned_today || "0"} deliveries scheduled
            for today
          </p>
        </div>
        <div className="flex gap-3">
          <Button asChild>
            <Link to="/agent/routes">
              <Navigation className="mr-2 h-4 w-4" />
              Optimize Route
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/agent/parcels">
              <Package className="mr-2 h-4 w-4" />
              View All Parcels
            </Link>
          </Button>
        </div>
      </div>

      {/* Agent Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {agentStats.map((stat, index) => (
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

      {/* Today's Deliveries and Route Map */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Deliveries */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Today's Deliveries</CardTitle>
            <Badge variant="secondary">{todaysParcels.length} parcels</Badge>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                  </div>
                ))}
              </div>
            ) : todaysParcels.length > 0 ? (
              <div
                className={`space-y-4 ${
                  todaysParcels.length > 3
                    ? "max-h-[400px] overflow-y-auto pr-2"
                    : ""
                }`}
              >
                {todaysParcels.map((parcel, index) => (
                  <div
                    key={parcel.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center w-8 h-8 bg-orange-100 text-orange-600 rounded-full font-semibold text-sm">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium">{parcel.tracking_id}</p>
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded ${getStatusColor(
                              parcel.status
                            )}`}
                          >
                            {parcel.status.replace("_", " ")}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">
                          <MapPin className="inline h-3 w-3 mr-1" />
                          {parcel.delivery_address}
                        </p>
                        <p className="text-xs text-gray-500">
                          {parcel.payment_mode === "cod"
                            ? `COD: ৳${parcel.amount}`
                            : "Prepaid"}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">
                  No deliveries assigned for today
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Route Summary & Quick Actions */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Navigate to Parcels Page */}
              <Button
                variant="outline"
                className="w-full justify-start bg-transparent"
                onClick={() => navigate("/agent/parcels")}
              >
                <Package className="mr-2 h-4 w-4" />
                Manage Parcels
              </Button>

              {/* Navigate to Routes Page */}
              <Button
                variant="outline"
                className="w-full justify-start bg-transparent"
                onClick={() => navigate("/agent/routes")}
              >
                <Route className="mr-2 h-4 w-4" />
                View Delivery Routes
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
