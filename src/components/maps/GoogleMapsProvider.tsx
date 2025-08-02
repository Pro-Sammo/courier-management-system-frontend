
import { useJsApiLoader } from "@react-google-maps/api";
import type { ReactNode } from "react";

const libraries = ["places", "geometry"];

export default function GoogleMapsProvider({
  children,
}: {
  children: ReactNode;
}) {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_API_KEY,
    libraries: libraries as any,
  });

  if (loadError) return <div>Error loading Google Maps</div>;
  if (!isLoaded) return <div>Loading Google Maps...</div>;

  return <>{children}</>;
}