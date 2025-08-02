import { useEffect, useRef, useState } from "react";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { useSocket } from "@/contexts/SocketContext";

const AgentLocationBroadcaster = () => {
  const { updateAgentLocation, isConnected } = useSocket();
  const [isTracking, setIsTracking] = useState(false);
  const watchIdRef = useRef<number | null>(null);

  console.log("isConnected", isConnected);
  console.log("isTracking", isTracking);
  console.log("watchIdRef", watchIdRef);

  const startTracking = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        console.log("📍 Sending agent location:", coords);
        updateAgentLocation(coords);
      },
      (error) => {
        console.error("Error getting location:", error);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 10000,
      }
    );

    watchIdRef.current = watchId;
    setIsTracking(true);
  };

  const stopTracking = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
      setIsTracking(false);
    }
  };

  useEffect(() => {
    return () => {
      stopTracking();
    };
  }, []);

  const handleToggle = (checked: boolean) => {
    if (checked) {
      startTracking();
    } else {
      stopTracking();
    }
  };

  return (
    <div className="flex items-center justify-between w-full px-3 py-2 border-t border-muted mt-auto text-sm">
      <div className="flex flex-col gap-1">
        <span className="font-medium text-xs text-muted-foreground flex gap-1">
          Live Location
          {isTracking && (
            <span>
              <span className="relative flex size-3">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sky-400 opacity-75"></span>
                <span className="relative inline-flex size-3 rounded-full bg-green-500"></span>
              </span>
            </span>
          )}
        </span>
        <span
          className={cn(
            "text-xs",
            isConnected ? "text-green-600" : "text-red-500"
          )}
        ></span>
      </div>
      <Switch checked={isTracking} onCheckedChange={handleToggle} />
    </div>
  );
};

export default AgentLocationBroadcaster;
