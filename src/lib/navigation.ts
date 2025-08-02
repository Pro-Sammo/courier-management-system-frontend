interface NavigationCoordinates {
  lat: number
  lng: number
}

interface NavigationOptions {
  destination: NavigationCoordinates
  origin?: NavigationCoordinates
  mode?: "driving" | "walking" | "bicycling" | "transit"
}

declare const google: any // Declare the google variable

export class NavigationService {
  private static instance: NavigationService
  private googleMapsLoaded = false

  static getInstance(): NavigationService {
    if (!NavigationService.instance) {
      NavigationService.instance = new NavigationService()
    }
    return NavigationService.instance
  }

  // Load Google Maps API
  async loadGoogleMaps(): Promise<void> {
    if (this.googleMapsLoaded || window.google?.maps) {
      return
    }

    return new Promise((resolve, reject) => {
      const script = document.createElement("script")
      script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_API_KEY}&libraries=geometry`
      script.async = true
      script.defer = true

      script.onload = () => {
        this.googleMapsLoaded = true
        resolve()
      }

      script.onerror = () => {
        reject(new Error("Failed to load Google Maps API"))
      }

      document.head.appendChild(script)
    })
  }

  // Get current location
  getCurrentLocation(): Promise<NavigationCoordinates> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation is not supported"))
        return
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          })
        },
        (error) => {
          reject(error)
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000, // 5 minutes
        },
      )
    })
  }

  // Open Google Maps for navigation
  openGoogleMapsNavigation(options: NavigationOptions): void {
    const { destination, origin, mode = "driving" } = options

    let url = "https://www.google.com/maps/dir/"

    if (origin) {
      url += `${origin.lat},${origin.lng}/`
    }

    url += `${destination.lat},${destination.lng}`
    url += `/@${destination.lat},${destination.lng},15z`
    url += `/data=!3m1!4b1!4m2!4m1!3e${this.getModeCode(mode)}`

    window.open(url, "_blank")
  }

  // Open Apple Maps (for iOS devices)
  openAppleMapsNavigation(options: NavigationOptions): void {
    const { destination, origin } = options

    let url = "http://maps.apple.com/?"

    if (origin) {
      url += `saddr=${origin.lat},${origin.lng}&`
    }

    url += `daddr=${destination.lat},${destination.lng}&dirflg=d`

    window.open(url, "_blank")
  }

  // Calculate distance between two points
  async calculateDistance(
    origin: NavigationCoordinates,
    destination: NavigationCoordinates,
  ): Promise<{ distance: string; duration: string }> {
    await this.loadGoogleMaps()

    return new Promise((resolve, reject) => {
      const service = new google.maps.DistanceMatrixService()

      service.getDistanceMatrix(
        {
          origins: [new google.maps.LatLng(origin.lat, origin.lng)],
          destinations: [new google.maps.LatLng(destination.lat, destination.lng)],
          travelMode: google.maps.TravelMode.DRIVING,
          unitSystem: google.maps.UnitSystem.METRIC,
        },
        (response:any, status:any) => {
          if (status === google.maps.DistanceMatrixStatus.OK && response) {
            const element = response.rows[0].elements[0]
            if (element.status === "OK") {
              resolve({
                distance: element.distance?.text || "Unknown",
                duration: element.duration?.text || "Unknown",
              })
            } else {
              reject(new Error("Could not calculate distance"))
            }
          } else {
            reject(new Error("Distance Matrix request failed"))
          }
        },
      )
    })
  }

  private getModeCode(mode: string): string {
    switch (mode) {
      case "walking":
        return "2"
      case "bicycling":
        return "1"
      case "transit":
        return "3"
      case "driving":
      default:
        return "0"
    }
  }

  // Detect if user is on iOS
  private isIOS(): boolean {
    return /iPad|iPhone|iPod/.test(navigator.userAgent)
  }

  // Smart navigation that chooses the best option
  async smartNavigate(options: NavigationOptions): Promise<void> {
    try {
      // Get current location if not provided
      if (!options.origin) {
        options.origin = await this.getCurrentLocation()
      }

      // Choose navigation app based on platform
      if (this.isIOS()) {
        this.openAppleMapsNavigation(options)
      } else {
        this.openGoogleMapsNavigation(options)
      }
    } catch (error) {
      console.error("Navigation failed:", error)
      // Fallback to Google Maps without origin
      this.openGoogleMapsNavigation({
        destination: options.destination,
        mode: options.mode,
      })
    }
  }
}
