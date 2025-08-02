import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Package,
  MapPin,
  Search,
  MoreVertical,
  Navigation,
  Route,
} from "lucide-react";
import { StatusUpdateModal } from "@/components/parcels/StatusUpdateModal";
import { getStatusColor, formatDate } from "@/lib/utils";
import { useGetAssignedParcelsQuery } from "@/store/api/parcelApi";
import { NavigationService } from "@/lib/navigation";
import { NavigationModal } from "@/components/parcels/NavigationModel";
import ParcelDetailsModal from "@/components/parcels/ParcelDetailsModal";

export interface AssignedParcel {
  id: number;
  tracking_id: string;
  status: "PENDING" | "PICKED UP" | "IN TRANSIT" | "DELIVERED" | "FAILED";
  sender_name: string;
  sender_phone: string;
  receiver_name: string;
  receiver_phone: string;
  pickup_address: string;
  delivery_address: string;
  created_at: string;
  amount: number;
  payment_mode: "cod" | "prepaid";
  pickup_lat?: number | string;
  pickup_lng?: number | string;
  delivery_lat?: number | string;
  delivery_lng?: number | string;
  parcel_type?: "fragile" | "electronics" | "documents" | "clothing" | "food" | "other" | undefined;
  is_paid?: boolean;
  parcel_description?: string;
  parcel_weight?: number;
}

export default function AssignedParcels() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [optimizingRoute, setOptimizingRoute] = useState(false);
  const { data, isLoading } = useGetAssignedParcelsQuery();
  const parcels = data?.data || [];

  const [selectedParcel, setSelectedParcel] = useState<AssignedParcel | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  const handleOpenDetails = (parcel: AssignedParcel) => {
    setSelectedParcel(parcel);
    setShowDetails(true);
  };

  const filteredParcels = parcels.filter(
    (parcel: AssignedParcel) =>
      parcel.tracking_id.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (statusFilter === "all" || parcel.status === statusFilter)
  );

  const statusCounts = {
    all: parcels.length,
    pending: parcels.filter((p: AssignedParcel) => p.status === "PENDING")
      .length,
    picked_up: parcels.filter((p: AssignedParcel) => p.status === "PICKED UP")
      .length,
    in_transit: parcels.filter((p: AssignedParcel) => p.status === "IN TRANSIT")
      .length,
    delivered: parcels.filter((p: AssignedParcel) => p.status === "DELIVERED")
      .length,
    failed: parcels.filter((p: AssignedParcel) => p.status === "FAILED").length,
  };

  const handleOptimizeRoute = async () => {
    setOptimizingRoute(true);
    try {
      const navigationService = NavigationService.getInstance();

      // Get current location
      const currentLocation = await navigationService.getCurrentLocation();

      // Filter parcels that have coordinates and are not delivered
      const activeDeliveries = filteredParcels.filter(
        (parcel: AssignedParcel) =>
          parcel.status !== "DELIVERED" &&
          parcel.status !== "FAILED" &&
          ((parcel.pickup_lat && parcel.pickup_lng) ||
            (parcel.delivery_lat && parcel.delivery_lng))
      );

      if (activeDeliveries.length === 0) {
        alert(
          "No active deliveries with coordinates found for route optimization."
        );
        return;
      }

      const waypoints = activeDeliveries
        .map((parcel: AssignedParcel) => {
          if (
            parcel.status === "PENDING" &&
            parcel.pickup_lat &&
            parcel.pickup_lng
          ) {
            return {
              lat: Number.parseFloat(parcel.pickup_lat.toString()),
              lng: Number.parseFloat(parcel.pickup_lng.toString()),
              parcel_id: parcel.id,
              type: "pickup",
              address: parcel.pickup_address,
            };
          } else if (parcel.delivery_lat && parcel.delivery_lng) {
            return {
              lat: Number.parseFloat(parcel.delivery_lat.toString()),
              lng: Number.parseFloat(parcel.delivery_lng.toString()),
              parcel_id: parcel.id,
              type: "delivery",
              address: parcel.delivery_address,
            };
          }
          return null;
        })
        .filter(Boolean);

      let url = "https://www.google.com/maps/dir/";
      url += `${currentLocation.lat},${currentLocation.lng}/`;

      waypoints.forEach((waypoint) => {
        if (waypoint) {
          url += `${waypoint.lat},${waypoint.lng}/`;
        }
      });

      // Add parameters for driving directions
      url += `@${currentLocation.lat},${currentLocation.lng},12z/data=!3m1!4b1!4m2!4m1!3e0`;

      window.open(url, "_blank");
    } catch (error) {
      console.error("Route optimization failed:", error);
      alert(
        "Failed to optimize route. Please check your location permissions."
      );
    } finally {
      setOptimizingRoute(false);
    }
  };

  const hasNavigableParcel = (parcel: AssignedParcel) => {
    return (
      (parcel.pickup_lat && parcel.pickup_lng) ||
      (parcel.delivery_lat && parcel.delivery_lng)
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Assigned Parcels</h1>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-gray-600">Manage your delivery assignments</p>
          </div>
        </div>
        <Button onClick={handleOptimizeRoute} disabled={optimizingRoute}>
          <Route className="mr-2 h-4 w-4" />
          {optimizingRoute ? "Optimizing..." : "Optimize Route"}
        </Button>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
              <Input
                placeholder="Search by tracking number..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status Tabs */}
      <Tabs
        defaultValue="all"
        value={statusFilter}
        onValueChange={setStatusFilter}
      >
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="all" className="flex items-center gap-2">
            All <Badge variant="secondary">{statusCounts.all}</Badge>
          </TabsTrigger>
          <TabsTrigger value="PENDING" className="flex items-center gap-2">
            Pending <Badge variant="secondary">{statusCounts.pending}</Badge>
          </TabsTrigger>
          <TabsTrigger value="PICKED UP" className="flex items-center gap-2">
            Picked Up{" "}
            <Badge variant="secondary">{statusCounts.picked_up}</Badge>
          </TabsTrigger>
          <TabsTrigger value="IN TRANSIT" className="flex items-center gap-2">
            In Transit{" "}
            <Badge variant="secondary">{statusCounts.in_transit}</Badge>
          </TabsTrigger>
          <TabsTrigger value="DELIVERED" className="flex items-center gap-2">
            Delivered{" "}
            <Badge variant="secondary">{statusCounts.delivered}</Badge>
          </TabsTrigger>
          <TabsTrigger value="FAILED" className="flex items-center gap-2">
            Failed <Badge variant="secondary">{statusCounts.failed}</Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value={statusFilter} className="mt-6">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-4">
                    <div className="animate-pulse space-y-3">
                      <div className="h-4 bg-gray-200 rounded w-1/2" />
                      <div className="h-3 bg-gray-200 rounded w-3/4" />
                      <div className="h-3 bg-gray-200 rounded w-1/2" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredParcels.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No parcels found</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredParcels.map((parcel: AssignedParcel) => (
                <Card
                  key={parcel.id}
                  className="hover:shadow-md transition-shadow"
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-semibold">{parcel.tracking_id}</p>
                        <Badge
                          className={`${getStatusColor(parcel.status)} mt-1`}
                        >
                          {parcel.status.replaceAll("_", " ")}
                        </Badge>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenDetails(parcel)}
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3 w-3 text-green-600" />
                        <span className="text-gray-600">From:</span>
                        <span className="truncate">
                          {parcel.pickup_address}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3 w-3 text-red-600" />
                        <span className="text-gray-600">To:</span>
                        <span className="truncate">
                          {parcel.delivery_address}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-600">Created:</span>
                        <span>{formatDate(parcel.created_at)}</span>
                      </div>
                    </div>

                    <div className="flex gap-2 mt-4">
                      <StatusUpdateModal parcel={parcel}>
                        <Button size="sm" className="flex-1">
                          Update Status
                        </Button>
                      </StatusUpdateModal>

                      {hasNavigableParcel(parcel) ? (
                        <NavigationModal parcel={parcel}>
                          <Button size="sm" variant="outline">
                            <Navigation className="mr-1 h-3 w-3" />
                            Navigate
                          </Button>
                        </NavigationModal>
                      ) : (
                        <Button size="sm" variant="outline" disabled>
                          <Navigation className="mr-1 h-3 w-3" />
                          Navigate
                        </Button>
                      )}
                    </div>
                    <ParcelDetailsModal
                      open={showDetails}
                      onClose={() => setShowDetails(false)}
                      parcel={selectedParcel}
                    />
                    {parcel.payment_mode === "cod" && (
                      <div className="mt-3 p-2 bg-yellow-50 rounded text-sm">
                        <span className="font-medium text-yellow-800">
                          COD: ৳{parcel.amount}
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
