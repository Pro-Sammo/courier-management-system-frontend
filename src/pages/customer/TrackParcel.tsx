import type React from "react";
import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  const [searchTrackingNumber, setSearchTrackingNumber] = useState(tracking_id || "");
  const [agentLocation, setAgentLocation] = useState({ lat: 0, lng: 0 });
  const { on, off } = useSocket();

  const { data: parcel, isLoading, error } = useTrackParcelQuery(searchTrackingNumber, {
    skip: !searchTrackingNumber,
  });

  useEffect(() => {
    if (!parcel?.agent_id) return;

    const handleLocation = (location: { location: { lat: number; lng: number } }) => {
      setAgentLocation(location.location);
    };

    on(`agent-location:${parcel.agent_id}`, handleLocation);
    return () => off(`agent-location:${parcel.agent_id}`, handleLocation);
  }, [parcel?.agent_id]);

  const handleSearch = () => setSearchTrackingNumber(trackingNumber);
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSearch();
  };

  const pickupLocation =
    parcel?.pickup_lat && parcel?.pickup_lng
      ? { lat: +parcel.pickup_lat, lng: +parcel.pickup_lng }
      : null;
  const deliveryLocation =
    parcel?.delivery_lat && parcel?.delivery_lng
      ? { lat: +parcel.delivery_lat, lng: +parcel.delivery_lng }
      : null;
  const currentLocation =
    agentLocation.lat && agentLocation.lng ? agentLocation : null;

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

  const formatStatus = (status: string) =>
    status.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());

  return (
    <div className="space-y-8">
      <div className="text-center md:text-left">
        <h1 className="text-3xl font-bold">Track Your Parcel</h1>
        <p className="text-gray-600">
          Enter your tracking number to get real-time updates on your parcel
        </p>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative w-full">
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
              className="w-full sm:w-auto"
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Track Parcel
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Loading State */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
          <p className="mt-4 text-lg text-gray-600">Tracking your parcel...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <Card className="border border-red-200 bg-red-50">
          <CardContent className="p-6 text-center">
            <div className="flex flex-col items-center">
              <AlertCircle className="h-8 w-8 text-red-600 mb-2" />
              <h3 className="text-lg font-semibold text-red-700">
                Tracking Failed
              </h3>
              <p className="text-red-600">
                Couldn’t find parcel with tracking number:{" "}
                <strong>{searchTrackingNumber}</strong>. Please check and try again.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Parcel Info */}
      {parcel && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left Panel */}
          <div className="space-y-6 lg:col-span-1">
            {/* Parcel Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Tracking Details
                  <Badge className={getStatusBadgeColor(parcel.status)}>
                    {formatStatus(parcel.status)}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                {[
                  { label: "Tracking Number", value: parcel.tracking_id },
                  { label: "Order Date", value: formatDate(parcel.created_at) },
                  { label: "Sender", value: `${parcel.sender_name} (${parcel.sender_phone})` },
                  { label: "Recipient", value: `${parcel.receiver_name} (${parcel.receiver_phone})` },
                  { label: "Agent", value: `${parcel.agent_name} (${parcel.agent_phone})` },
                  { label: "Payment Method", value: parcel.payment_mode.toUpperCase() },
                  ...(parcel.payment_mode === "cod"
                    ? [{ label: "Amount", value: `৳${Number(parcel.amount)}` }]
                    : []),
                  { label: "Pickup Address", value: parcel.pickup_address },
                  { label: "Delivery Address", value: parcel.delivery_address },
                ].map((item, idx) => (
                  <div key={idx}>
                    <p className="text-gray-500">{item.label}</p>
                    <p className="font-medium text-gray-900">{item.value}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Timeline */}
            <Card>
              <CardHeader>
                <CardTitle>Tracking Timeline</CardTitle>
              </CardHeader>
              <CardContent className="py-4">
                <div className="relative space-y-6">
                  <div className="absolute left-4 top-0 h-full w-0.5 bg-gray-200" />
                  {parcel.tracking?.length > 0 ? (
                    [...parcel.tracking].reverse().map((track, i) => {
                      const StatusIcon = statusMapping[track.status]?.icon || Clock;
                      const isLatest = i === 0;
                      const isFailed = track.status === "FAILED";
                      return (
                        <div key={track.id} className="relative flex gap-4 pl-4">
                          <div
                            className={`z-10 flex h-8 w-8 items-center justify-center rounded-full ${
                              isFailed
                                ? "bg-red-600 text-white"
                                : isLatest
                                ? "bg-blue-600 text-white"
                                : "bg-green-600 text-white"
                            }`}
                          >
                            <StatusIcon className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="font-semibold">
                              {statusMapping[track.status]?.label || formatStatus(track.status)}
                            </p>
                            <p className="text-sm text-gray-500">{formatDate(track.updated_at)}</p>
                            {track.note && (
                              <p className="mt-1 text-sm text-gray-600">{track.note}</p>
                            )}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center text-gray-500 py-6">
                      <Clock className="h-8 w-8 mx-auto mb-2" />
                      <p>No tracking updates available</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Panel: Map */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Delivery Route</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="h-[500px] rounded-b-xl overflow-hidden">
                <GoogleMapComponent
                  pickupLocation={pickupLocation}
                  deliveryLocation={deliveryLocation}
                  currentLocation={currentLocation}
                  showDirections
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
