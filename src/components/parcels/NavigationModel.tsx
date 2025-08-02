import type React from "react"
import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Navigation, MapPin, Clock, Route, Car, Navigation2 } from "lucide-react"
import { NavigationService } from "@/lib/navigation"
import type { AssignedParcel } from "@/types"

interface NavigationModalProps {
  parcel: AssignedParcel
  children: React.ReactNode
}

interface LocationInfo {
  distance: string
  duration: string
  coordinates: { lat: number; lng: number }
  address: string
  type: "pickup" | "delivery"
}

export function NavigationModal({ parcel, children }: NavigationModalProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [locationInfo, setLocationInfo] = useState<LocationInfo[]>([])

  const navigationService = NavigationService.getInstance()

  useEffect(() => {
    if (open) {
      loadNavigationData()
    }
  }, [open])

  const loadNavigationData = async () => {
    setLoading(true)
    try {
      // Get current location
      const current = await navigationService.getCurrentLocation()
      setCurrentLocation(current)

      const locations: LocationInfo[] = []

      // Add pickup location if coordinates exist
      if (parcel.pickup_lat && parcel.pickup_lng) {
        try {
          const pickupDistance = await navigationService.calculateDistance(current, {
            lat: Number.parseFloat(parcel.pickup_lat.toString()),
            lng: Number.parseFloat(parcel.pickup_lng.toString()),
          })
          locations.push({
            ...pickupDistance,
            coordinates: {
              lat: Number.parseFloat(parcel.pickup_lat.toString()),
              lng: Number.parseFloat(parcel.pickup_lng.toString()),
            },
            address: parcel.pickup_address,
            type: "pickup",
          })
        } catch (error) {
          console.error("Failed to calculate pickup distance:", error)
        }
      }

      // Add delivery location if coordinates exist
      if (parcel.delivery_lat && parcel.delivery_lng) {
        try {
          const deliveryDistance = await navigationService.calculateDistance(current, {
            lat: Number.parseFloat(parcel.delivery_lat.toString()),
            lng: Number.parseFloat(parcel.delivery_lng.toString()),
          })
          locations.push({
            ...deliveryDistance,
            coordinates: {
              lat: Number.parseFloat(parcel.delivery_lat.toString()),
              lng: Number.parseFloat(parcel.delivery_lng.toString()),
            },
            address: parcel.delivery_address,
            type: "delivery",
          })
        } catch (error) {
          console.error("Failed to calculate delivery distance:", error)
        }
      }

      setLocationInfo(locations)
    } catch (error) {
      console.error("Failed to load navigation data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleNavigate = async (destination: { lat: number; lng: number }, mode: "driving" | "walking" = "driving") => {
    try {
      await navigationService.smartNavigate({
        destination,
        origin: currentLocation || undefined,
        mode,
      })
      setOpen(false)
    } catch (error) {
      console.error("Navigation failed:", error)
    }
  }

  const getRecommendedDestination = () => {
    // Recommend pickup if status is PENDING, otherwise delivery
    if (parcel.status === "PENDING" && parcel.pickup_lat && parcel.pickup_lng) {
      return {
        lat: Number.parseFloat(parcel.pickup_lat.toString()),
        lng: Number.parseFloat(parcel.pickup_lng.toString()),
        type: "pickup" as const,
      }
    } else if (parcel.delivery_lat && parcel.delivery_lng) {
      return {
        lat: Number.parseFloat(parcel.delivery_lat.toString()),
        lng: Number.parseFloat(parcel.delivery_lng.toString()),
        type: "delivery" as const,
      }
    }
    return null
  }

  const recommendedDestination = getRecommendedDestination()

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Navigation className="h-5 w-5" />
            Navigate - {parcel.tracking_id}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Status and Recommendation */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Current Status</span>
                <Badge variant="outline">{parcel.status.replace("_", " ")}</Badge>
              </div>
              {recommendedDestination && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Navigation2 className="h-4 w-4" />
                  <span>
                    Recommended: Navigate to {recommendedDestination.type === "pickup" ? "pickup" : "delivery"} location
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Navigate */}
          {recommendedDestination && (
            <Card>
              <CardContent className="p-4">
                <h3 className="font-medium mb-3 flex items-center gap-2">
                  <Route className="h-4 w-4" />
                  Quick Navigate
                </h3>
                <div className="flex gap-2">
                  <Button onClick={() => handleNavigate(recommendedDestination, "driving")} className="flex-1">
                    <Car className="mr-2 h-4 w-4" />
                    Drive
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleNavigate(recommendedDestination, "walking")}
                    className="flex-1"
                  >
                    <Navigation className="mr-2 h-4 w-4" />
                    Walk
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <Separator />

          {/* Detailed Locations */}
          <div className="space-y-3">
            <h3 className="font-medium flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              All Locations
            </h3>

            {loading ? (
              <div className="space-y-3">
                {[1, 2].map((i) => (
                  <Card key={i}>
                    <CardContent className="p-4">
                      <div className="animate-pulse space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-1/3" />
                        <div className="h-3 bg-gray-200 rounded w-full" />
                        <div className="h-3 bg-gray-200 rounded w-1/2" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {locationInfo.map((location, index) => (
                  <Card key={index} className="hover:shadow-sm transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <MapPin
                            className={`h-4 w-4 ${location.type === "pickup" ? "text-green-600" : "text-red-600"}`}
                          />
                          <span className="font-medium capitalize">{location.type}</span>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {location.distance}
                        </Badge>
                      </div>

                      <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{location.address}</p>

                      <div className="flex items-center gap-4 mb-3 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {location.duration}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleNavigate(location.coordinates, "driving")}
                          className="flex-1"
                        >
                          <Car className="mr-1 h-3 w-3" />
                          Drive
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleNavigate(location.coordinates, "walking")}
                          className="flex-1"
                        >
                          <Navigation className="mr-1 h-3 w-3" />
                          Walk
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {locationInfo.length === 0 && (
                  <Card>
                    <CardContent className="p-4 text-center">
                      <MapPin className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">No coordinates available for navigation</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
