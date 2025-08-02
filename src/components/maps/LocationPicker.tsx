import { useState } from "react"
import { GoogleMap, Marker, Autocomplete } from "@react-google-maps/api"

type LocationPickerProps = {
  value: string
  onAddressChange: (address: string) => void
  onCoordinatesChange: (lat: number, lng: number) => void
}

const containerStyle = { width: "100%", height: "300px" }
const defaultCenter = { lat: 23.8103, lng: 90.4125 }

export function LocationPicker({
  value,
  onAddressChange,
  onCoordinatesChange,
}: LocationPickerProps) {
  const [markerPosition, setMarkerPosition] = useState(defaultCenter)
  const [autocomplete, setAutocomplete] = useState<google.maps.places.Autocomplete | null>(null)


  const handlePlaceChanged = () => {
    if (autocomplete) {
      const place = autocomplete.getPlace()
      if (place.geometry?.location) {
        const lat = place.geometry.location.lat()
        const lng = place.geometry.location.lng()
        setMarkerPosition({ lat, lng })
        onCoordinatesChange(lat, lng)
        onAddressChange(place.formatted_address || "")
      }
    }
  }

  const handleMapClick = (e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      const lat = e.latLng.lat()
      const lng = e.latLng.lng()
      setMarkerPosition({ lat, lng })
      onCoordinatesChange(lat, lng)

      const geocoder = new google.maps.Geocoder()
      geocoder.geocode({ location: { lat, lng } }, (results, status) => {
        if (status === "OK" && results && results.length > 0) {
          onAddressChange(results[0].formatted_address)
        }
      })
    }
  }

  return (
    <div className="space-y-2">

      <Autocomplete onLoad={setAutocomplete} onPlaceChanged={handlePlaceChanged}>
        <input
          type="text"
          value={value}
          onChange={(e) => onAddressChange(e.target.value)}
          className="border p-2 w-full rounded"
        />
      </Autocomplete>

 
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={markerPosition}
        zoom={14}
        onClick={handleMapClick}
      >
        <Marker
          position={markerPosition}
          draggable
          onDragEnd={(e) => {
            if (e.latLng) {
              const lat = e.latLng.lat()
              const lng = e.latLng.lng()
              setMarkerPosition({ lat, lng })
              onCoordinatesChange(lat, lng)
            }
          }}
        />
      </GoogleMap>
    </div>
  )
}
