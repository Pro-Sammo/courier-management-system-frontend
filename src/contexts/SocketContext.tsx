import { createContext, useContext, useEffect, useState } from "react";
import { io, type Socket } from "socket.io-client";
import { useAppSelector } from "@/hooks/redux";

interface SocketContextType {
  isConnected: boolean;
  updateParcelStatus: (parcelId: string, status: string, location?: { lat: number; lng: number }) => void;
  updateAgentLocation: (location: { lat: number; lng: number }) => void;
  joinParcelRoom: (parcelId: string) => void;
  leaveParcelRoom: (parcelId: string) => void;
  on: (event: string, callback: (...args: any[]) => void) => void;
  off: (event: string, callback: (...args: any[]) => void) => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

let socket: Socket | null = null;

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const [isConnected, setIsConnected] = useState(false);
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const maxReconnectAttempts = 5;

  useEffect(() => {
    if (!isAuthenticated || !user) return;

    const SOCKET_URL = import.meta.env.VITE_SOCKET_URL;

    socket = io(SOCKET_URL, {
      auth: {
        token: localStorage.getItem("token"),
        userId: user.id,
        userRole: user.role,
      },
      transports: ["websocket", "polling"],
    });

    socket.on("connect", () => {
      console.log("✅ Connected to socket");
      setIsConnected(true);
      setReconnectAttempts(0);

      socket?.emit("join-room", {
        userId: user.id,
        role: user.role,
      });
    });

    socket.on("disconnect", (reason) => {
      console.log("❌ Disconnected:", reason);
      setIsConnected(false);

      if (reason === "io server disconnect") {
        tryReconnect();
      }
    });

    socket.on("connect_error", (err) => {
      console.error("⚠️ Connection error:", err);
      tryReconnect();
    });

    const interval = setInterval(() => {
      setIsConnected(socket?.connected || false);
    }, 5000);

    return () => {
      clearInterval(interval);
      socket?.disconnect();
      socket = null;
      setIsConnected(false);
    };
  }, [isAuthenticated, user]);


  const tryReconnect = () => {
    if (reconnectAttempts < maxReconnectAttempts) {
      const delay = 2000 * (reconnectAttempts + 1); 
      setTimeout(() => {
        console.log(`🔁 Reconnecting attempt ${reconnectAttempts + 1}`);
        socket?.connect();
        setReconnectAttempts((prev) => prev + 1);
      }, delay);
    } else {
      console.warn("🚫 Max reconnection attempts reached");
    }
  };

  const updateParcelStatus = (
    parcelId: string,
    status: string,
    location?: { lat: number; lng: number }
  ) => {
    socket?.emit("update-parcel-status", {
      parcelId,
      status,
      location,
      timestamp: new Date().toISOString(),
    });
  };

  const updateAgentLocation = (location: { lat: number; lng: number }) => {
    socket?.emit("update-agent-location", {
      location,
      timestamp: new Date().toISOString(),
    });
  };

  const joinParcelRoom = (parcelId: string) => {
    socket?.emit("join-parcel-room", parcelId);
  };

  const leaveParcelRoom = (parcelId: string) => {
    socket?.emit("leave-parcel-room", parcelId);
  };

  const on = (event: string, callback: (...args: any[]) => void) => {
  socket?.on(event, callback);
};

const off = (event: string, callback: (...args: any[]) => void) => {
  socket?.off(event, callback);
};

const contextValue: SocketContextType = {
  isConnected,
  updateParcelStatus,
  updateAgentLocation,
  joinParcelRoom,
  leaveParcelRoom,
  on,
  off,
};
  

  return <SocketContext.Provider value={contextValue}>{children}</SocketContext.Provider>;
}

export function useSocket() {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
}
