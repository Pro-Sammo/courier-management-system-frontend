import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Navigation } from "lucide-react";
import { getStatusColor } from "@/lib/utils";
import OptimizedRouteMap from "@/components/maps/OptimizeRouteMap";
import { useEffect, useState } from "react";
import { useGetAssignedParcelsQuery } from "@/store/api/parcelApi";
import { StatusUpdateModal } from "@/components/parcels/StatusUpdateModal";

interface LatLng {
  lat: number;
  lng: number;
}

export default function RouteOptimization() {
  const { data: parcels, isLoading,refetch } = useGetAssignedParcelsQuery();
  const [agentLocation, setAgentLocation] = useState<LatLng | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [permissionAsked, setPermissionAsked] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [mapKey, setMapKey] = useState(0);

  const modifiedParcel = parcels?.data.map((parcel) => {
    if(!["DELIVERED","FAILED"].includes(parcel.status)){
      return {
        ...parcel
      };
    }
  }).filter(Boolean)  

  console.log("modifiedParcel", modifiedParcel)

  useEffect(() => {
    if (!navigator.geolocation) {
      setPermissionDenied(true);
      setPermissionAsked(true);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setAgentLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        setPermissionAsked(true);
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          setPermissionDenied(true);
          setPermissionAsked(true);
        } else {
          setPermissionDenied(true);
          setPermissionAsked(true);
        }
      }
    );
  }, [isRefreshing]);

  if (!permissionAsked) {
    return <p>Requesting location permission...</p>;
  }

  if (permissionDenied) {
    return (
      <div className="p-4 bg-red-100 text-red-800 rounded">
        <h2>Location Permission Required</h2>
        <p>
          You must allow location access to see the optimized delivery route.
          Please enable location permissions in your browser settings and
          refresh the page.
        </p>
      </div>
    );
  }

  if (!agentLocation && !isLoading) return <p>Loading your location...</p>;

  const deliveryStops = parcels?.data.flatMap((parcel) => {
    if (parcel.status === "PENDING") {
      return [{ lat:Number(parcel.pickup_lat), lng: Number(parcel.pickup_lng) }];
    }
    if (parcel.status === "PICKED UP" || parcel.status === "IN TRANSIT") {
      return [{ lat: Number(parcel.delivery_lat), lng: Number(parcel.delivery_lng) }];
      
    }
    return [];
  });


  const handleStartNavigation = () => {

    const origin = `${agentLocation?.lat },${agentLocation?.lng}`;
    const waypoints = deliveryStops
      ?.map((stop:any) => `${stop.lat},${stop.lng}`)
      .join("/")

    const googleMapsUrl = `https://www.google.com/maps/dir/${origin}/${waypoints}`;

    window.open(googleMapsUrl, "_blank");
  };

  const handleRefreshRoute = async () => {
    setIsRefreshing(true);
    await refetch();
     setMapKey((prev) => prev + 1);
    setIsRefreshing(false);
   
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Route Optimization</h1>
          <p className="text-gray-600">Plan your delivery route efficiently</p>
        </div>
        <div className="flex gap-3">
          <Button onClick={handleStartNavigation}>
            <Navigation className="mr-2 h-4 w-4" />
            Start Navigation
          </Button>
          <Button
            variant="outline"
            onClick={handleRefreshRoute}
            disabled={isRefreshing}
          >
            {isRefreshing ? "Refreshing..." : "Refresh Route"}
          </Button>
        </div>
      </div>

      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Optimized Delivery Route</span>
            <Badge variant="outline">{parcels?.data.length} Stops</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="h-[600px]">
            <OptimizedRouteMap
              key={mapKey}
              pickupLocation={agentLocation}
              deliveryStops={deliveryStops}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <div className="space-y-4">
            {modifiedParcel && modifiedParcel?.map((delivery, index) => (
              <div
                key={delivery?.id}
                className="flex items-center gap-4 rounded-lg border p-4"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 text-orange-600 font-semibold">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{delivery?.tracking_id }</p>
                    <Badge className={getStatusColor(delivery?.status ?? "" )}>
                      {delivery?.status.replace("_", " ")}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">
                    <MapPin className="inline h-3 w-3 mr-1" />
                    {delivery?.delivery_address}
                  </p>
                  <div className="flex items-center gap-4 mt-1">
                    <p className="text-xs text-gray-500">
                      Recipient: {delivery?.receiver_name} | {delivery?.receiver_phone}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <StatusUpdateModal parcel={delivery as any} handleRefreshRoute={handleRefreshRoute} >
                  <Button size="sm" variant="outline">
                    Update
                  </Button>
                   </StatusUpdateModal>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
