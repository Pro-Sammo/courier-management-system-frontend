import { useState, useEffect, useCallback, useMemo } from "react";
import {
  GoogleMap,
  DirectionsService,
  DirectionsRenderer,
  Marker,
} from "@react-google-maps/api";
import { useSelector } from "react-redux";

const containerStyle = { width: "100%", height: "600px" };

export default function OptimizedRouteMap({
  pickupLocation,
  deliveryStops,
  onRouteCalculated,
}: any) {
  const [directions, setDirections] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userLocation, setUserLocation] =
    useState<google.maps.LatLngLiteral | null>(null);

  const user = useSelector((state: any) => state.auth.user);

  const userMarkerUrl = `https://courier-parcel-media.s3.ap-south-1.amazonaws.com/cpms-storage/${user.photo}`;

  const waypoints = useMemo(() => {
    if (!deliveryStops || deliveryStops.length <= 1) return [];
    return deliveryStops.slice(0, -1).map((stop: any) => ({
      location: stop,
      stopover: true,
    }));
  }, [deliveryStops]);

  const handleCallback = useCallback((result: any, status: any) => {
    setIsLoading(false);
    if (status === "OK") {
      setDirections(result);
      setError(null);

      const route = result.routes[0];
      if (route && route.legs) {
        const totalDistance = route.legs.reduce((sum: number, leg: any) => {
          return sum + leg.distance.value;
        }, 0);

        const totalDuration = route.legs.reduce((sum: number, leg: any) => {
          return sum + leg.duration.value;
        }, 0);

        onRouteCalculated({
          distance: (totalDistance / 1000).toFixed(2),
          duration: (totalDuration / 3600).toFixed(2),
        });
      }
    } else {
      setError("Failed to calculate route");
      console.error("Directions request failed:", status);
    }
  }, [onRouteCalculated]);

 
  useEffect(() => {
    if (!navigator.geolocation) return;

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ lat: latitude, lng: longitude });
      },
      (err) => {
        console.error("Error getting location:", err);
        setError("Unable to fetch real-time location");
      },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  useEffect(() => {
    if (pickupLocation && deliveryStops?.length > 1) {
      setIsLoading(true);
    }
  }, [pickupLocation, deliveryStops]);

  const shouldRenderService =
    pickupLocation && deliveryStops?.length >= 1 && !directions && !error;


  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={userLocation || pickupLocation}
      zoom={14}
      options={{
        disableDefaultUI: true,
        zoomControl: true,
      }}
    >
      {isLoading && (
        <div className="map-loading-overlay">Calculating optimal route...</div>
      )}
      {error && <div className="map-error-overlay">{error}</div>}

      {/* Real-time user location marker */}
      {userLocation && (
        <Marker
          position={userLocation}
          icon={{
            url: userMarkerUrl,
            scaledSize: new window.google.maps.Size(40, 40),
            origin: new window.google.maps.Point(0, 0),
            anchor: new window.google.maps.Point(20, 40),
          }}
          title="You are here"
        />
      )}

      {shouldRenderService && (
        <DirectionsService
          options={{
            origin: pickupLocation,
            destination: deliveryStops[deliveryStops.length - 1],
            waypoints,
            optimizeWaypoints: true,
            travelMode: "DRIVING" as any,
          }}
          callback={handleCallback}
        />
      )}
      {directions && <DirectionsRenderer directions={directions} />}
    </GoogleMap>
  );
}
