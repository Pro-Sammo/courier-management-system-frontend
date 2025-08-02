import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

import { Badge } from "@/components/ui/badge"
import { Package, MapPin, Truck, User, Phone, Calendar } from "lucide-react"
import { getStatusColor, formatDate } from "@/lib/utils"
import type { Parcel } from "@/types"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { FILE_LOCATION } from "@/miscellaneous/constants"

interface ParcelDetailsProps {
  parcel: Parcel
  isLoading?: boolean
}

export default function ParcelDetails({ parcel, isLoading = false }: ParcelDetailsProps) {

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-gray-200 rounded w-1/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Parcel {parcel.tracking_id}
          </CardTitle>
          <Badge className={getStatusColor(parcel.status)}>{parcel.status.replace("_", " ")}</Badge>
        </div>
      </CardHeader>
      <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-3">
              {/* Sender & Receiver */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Sender</h3>
                  <div className="mt-1 flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-400" />
                    <span>{parcel.sender_name}</span>
                  </div>
                  <div className="mt-1 flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span>{parcel.sender_phone}</span>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500">Receiver</h3>
                  <div className="mt-1 flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-400" />
                    <span>{parcel.receiver_name}</span>
                  </div>
                  <div className="mt-1 flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span>{parcel.receiver_phone}</span>
                  </div>
                </div>
              </div>

              {/* Parcel Info */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Parcel Details</h3>
                  <div className="mt-1 grid grid-cols-2 gap-2">
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-gray-400" />
                      <span>Weight: {parcel.parcel_weight} kg</span>
                    </div>
                  </div>
                  <div className="mt-1 flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span>Created: {formatDate(parcel.created_at)}</span>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500">Payment</h3>
                  <div className="mt-1 flex items-center gap-2">
                    
                    <span>
                      {parcel.payment_mode} {parcel.amount ? `(৳${parcel.amount})` : ""}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Addresses */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div className="rounded-lg border p-4">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="h-4 w-4 text-green-600" />
                  <h3 className="font-medium">Pickup Address</h3>
                </div>
                <p className="text-sm">
                  {parcel.pickup_address}
                </p>
              </div>

              <div className="rounded-lg border p-4">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="h-4 w-4 text-red-600" />
                  <h3 className="font-medium">Delivery Address</h3>
                </div>
                <p className="text-sm">
                  {parcel.delivery_address}
                </p>
              </div>
            </div>

            {/* Agent Info (if assigned) */}
            {parcel.agent_id && (
              <div className="rounded-lg border p-4 mt-6">
                <div className="flex items-center gap-2 mb-2">
                  <Truck className="h-4 w-4 text-blue-600" />
                  <h3 className="font-medium">Delivery Agent</h3>
                </div>
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 rounded-full">
                    <AvatarImage src={`${FILE_LOCATION}${parcel.agent_photo}`} alt="" />
                    <AvatarFallback>A</AvatarFallback>
                  </Avatar>
                  <div>

                    <p className="font-medium">{parcel.agent_name}</p>
                    <p className="text-sm text-gray-600">{parcel.agent_phone}</p>
                  </div>
                </div>
              </div>
            )}


      </CardContent>
    </Card>
  )
}
