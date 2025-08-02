import type React from "react";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  Search,
  Package,
  MapPin,
  CheckCircle,
  Truck,
  AlertCircle,
  Clock,
} from "lucide-react";
import GoogleMapComponent from "@/components/maps/GoogleMapComponent";
import { useTrackParcelQuery } from "@/store/api/parcelApi";
import { formatDate } from "@/lib/utils";
import { useSocket } from "@/contexts/SocketContext";
import { useParams } from "react-router-dom";

const statusMapping = {
  PENDING: { label: "Order Placed", icon: Package },
  "PICKED UP": { label: "Picked Up", icon: MapPin },
  "IN TRANSIT": { label: "In Transit", icon: Truck },
  DELIVERED: { label: "Delivered", icon: CheckCircle },
  FAILED: { label: "Delivery Failed", icon: AlertCircle },
};

export default function TrackParcel() {
  const { tracking_id } = useParams();
  const [trackingNumber, setTrackingNumber] = useState(tracking_id || "");
  const [agentLocation, setAgentLocation] = useState({ lat: 0, lng: 0 });
  const [searchTrackingNumber, setSearchTrackingNumber] = useState(
    trackingNumber
  );
  const { on, off } = useSocket();

  const {
    data: response,
    isLoading,
    error,
  } = useTrackParcelQuery(searchTrackingNumber, {
    skip: !searchTrackingNumber,
  });

  const parcel = response;


  

  useEffect(() => {

    const handleLocation = (location: { location: { lat: number; lng: number } }) => {
      setAgentLocation(location.location);
    };

    on(`agent-location:${parcel?.agent_id}`, handleLocation);

    return () => {
      off(`agent-location:${parcel?.agent_id}`, handleLocation);
    };
  }, [parcel?.agent_id]);

  const handleSearch = () => {
    setSearchTrackingNumber(trackingNumber);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

const pickupLocation =
  parcel?.pickup_lat !== undefined && parcel?.pickup_lng !== undefined
    ? { lat: Number(parcel.pickup_lat), lng: Number(parcel.pickup_lng) }
    : null;

const deliveryLocation =
  parcel?.delivery_lat !== undefined && parcel?.delivery_lng !== undefined
    ? { lat: Number(parcel.delivery_lat), lng: Number(parcel.delivery_lng )}
    : null;

const currentLocation =
  agentLocation?.lat !== undefined && agentLocation?.lng !== undefined
    ? { lat: agentLocation.lat, lng: agentLocation.lng }
    : null;

  // Get status color based on status
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "DELIVERED":
        return "bg-green-100 text-green-800 border-green-200";
      case "FAILED":
        return "bg-red-100 text-red-800 border-red-200";
      case "IN TRANSIT":
      case "OUT FOR DELIVERY":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "PICKED UP":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  // Format status for display
  const formatStatus = (status: string) => {
    return status.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Track Your Parcel</h1>
        <p className="text-gray-600">
          Enter your tracking number to get real-time updates on your parcel
        </p>
      </div>

      {/* Search Box */}
      <Card>
        <CardContent className="p-6">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
              <Input
                type="text"
                placeholder="Enter tracking number (e.g., CT2025073103507)"
                className="pl-10"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                onKeyDown={handleKeyDown}
              />
            </div>
            <Button
              onClick={handleSearch}
              disabled={isLoading || !trackingNumber}
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Track Parcel
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center py-12">
          <div className="flex flex-col items-center">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
            <p className="mt-4 text-lg text-gray-600">
              Tracking your parcel...
            </p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <div className="flex flex-col items-center text-center">
              <div className="rounded-full bg-red-100 p-3">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="mt-2 text-lg font-semibold text-red-700">
                Tracking Failed
              </h3>
              <p className="text-red-600">
                We couldn't find a parcel with tracking number:{" "}
                {searchTrackingNumber}. Please check and try again.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tracking Result */}
      {searchTrackingNumber && !isLoading && !error && parcel && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Tracking Info */}
          <div className="space-y-6 lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Tracking Details</span>
                  <Badge className={getStatusBadgeColor(parcel.status)}>
                    {formatStatus(parcel.status)}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Tracking Number</p>
                  <p className="font-semibold">{parcel.tracking_id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Order Date</p>
                  <p className="font-semibold">
                    {formatDate(parcel.created_at)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Sender</p>
                  <p className="font-semibold">{parcel.sender_name}</p>
                  <p className="text-sm text-gray-600">{parcel.sender_phone}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Recipient</p>
                  <p className="font-semibold">{parcel.receiver_name}</p>
                  <p className="text-sm text-gray-600">
                    {parcel.receiver_phone}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Agent</p>
                  <p className="font-semibold">{parcel.agent_name}</p>
                  <p className="text-sm text-gray-600">{parcel.agent_phone}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Payment Method</p>
                  <p className="font-semibold">
                    {parcel.payment_mode.toUpperCase()}
                  </p>
                  {parcel.payment_mode === "cod" && (
                    <p className="text-sm text-gray-600">
                      Amount: ৳{Number(parcel.amount)}
                    </p>
                  )}
                </div>
                <div>
                  <p className="text-sm text-gray-500">Pickup Address</p>
                  <p className="text-sm text-gray-700">
                    {parcel.pickup_address}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Delivery Address</p>
                  <p className="text-sm text-gray-700">
                    {parcel.delivery_address}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Tracking Timeline */}
            <Card>
              <CardHeader>
                <CardTitle>Tracking Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative space-y-6 py-2">
                  {/* Vertical line */}
                  <div className="absolute left-3.5 top-0 h-full w-0.5 bg-gray-200"></div>

                  {parcel.tracking && parcel.tracking.length > 0 ? (
                    // Show actual tracking data (reverse to show latest first)
                    [...parcel.tracking]
                      .reverse()
                      .map((trackingItem, index) => {
                        const StatusIcon =
                          statusMapping[trackingItem.status]?.icon || Clock;
                        const isLatest = index === 0;
                        const isFailed = trackingItem.status === "FAILED";

                        return (
                          <div
                            key={trackingItem.id}
                            className="relative flex items-start gap-3"
                          >
                            <div
                              className={`z-10 flex h-7 w-7 items-center justify-center rounded-full ${
                                isFailed
                                  ? "bg-red-600 text-white"
                                  : isLatest
                                  ? "bg-blue-600 text-white"
                                  : "bg-green-600 text-white"
                              }`}
                            >
                              <StatusIcon className="h-4 w-4" />
                            </div>
                            <div className="flex-1">
                              <p className="font-medium">
                                {statusMapping[trackingItem.status]?.label ||
                                  formatStatus(trackingItem.status)}
                              </p>
                              <p className="text-sm text-gray-500">
                                {formatDate(trackingItem.updated_at)}
                              </p>
                              {trackingItem.note && (
                                <p className="text-sm text-gray-600 mt-1">
                                  {trackingItem.note}
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      })
                  ) : (
                    <div className="text-center text-gray-500">
                      <Clock className="h-8 w-8 mx-auto mb-2" />
                      <p>No tracking updates available</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Map */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Delivery Route</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="h-[500px]">
                <GoogleMapComponent
                  pickupLocation={pickupLocation}
                  deliveryLocation={deliveryLocation}
                  currentLocation={currentLocation}
                  showDirections={true}
                  className="h-full"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
