import {
  GoogleMap,
  Marker,
  DirectionsRenderer,
  useJsApiLoader,
} from "@react-google-maps/api";
import { useEffect, useRef, useState } from "react";

interface Props {
  pickupLocation: { lat: number; lng: number } | null;
  deliveryLocation: { lat: number; lng: number } | null;
  currentLocation: { lat: number; lng: number } | null;
  showDirections?: boolean;
  className?: string;
}

const containerStyle = {
  width: "100%",
  height: "100%",
};

const GoogleMapComponent = ({
  pickupLocation,
  deliveryLocation,
  currentLocation,
  showDirections = true,
}: Props) => {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey:import.meta.env.VITE_GOOGLE_API_KEY,
    libraries: ["places"],
  });

  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);

  useEffect(() => {
    if (!pickupLocation || !deliveryLocation || !isLoaded || !showDirections) return;

    const directionsService = new google.maps.DirectionsService();
    directionsService.route(
      {
        origin: pickupLocation,
        destination: deliveryLocation,
        travelMode: google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === google.maps.DirectionsStatus.OK && result) {
          setDirections(result);
        } else {
          console.error("Error fetching directions", status);
        }
      }
    );
  }, [pickupLocation, deliveryLocation, isLoaded, showDirections]);


  if (!isLoaded) return <div className="flex justify-center items-center h-full">Loading map...</div>;

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      zoom={13}
      onLoad={(map) =>  void(mapRef.current = map)}
    >
      {pickupLocation && (
        <Marker
          position={pickupLocation}
          label="P"
          title="Pickup Location"
          icon="http://maps.google.com/mapfiles/ms/icons/green-dot.png"
        />
      )}

      {deliveryLocation && (
        <Marker
          position={deliveryLocation}
          label="D"
          title="Delivery Location"
          icon="http://maps.google.com/mapfiles/ms/icons/red-dot.png"
        />
      )}

      {currentLocation && (
        <Marker
          position={currentLocation}
          label="A"
          title="Agent Location"
          icon={{
            url: "https://maps.google.com/mapfiles/kml/shapes/motorcycling.png",
            scaledSize: new google.maps.Size(32, 32),
          }}
        />
      )}

      {directions && <DirectionsRenderer directions={directions} />}
    </GoogleMap>
  );
};

export default GoogleMapComponent;
