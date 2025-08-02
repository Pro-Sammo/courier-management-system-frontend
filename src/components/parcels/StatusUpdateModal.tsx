import type React from "react"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Loader2, Package } from "lucide-react"
import { useUpdateParcelMutation } from "@/store/api/parcelApi"
import { toast } from "sonner"
import { getStatusColor } from "@/lib/utils"
import type { Parcel, ParcelStatus } from "@/types"

interface StatusUpdateModalProps {
  parcel: Parcel
  handleRefreshRoute?: () => void
  children: React.ReactNode
}

const statusOptions: { value: ParcelStatus; label: string; description: string }[] = [
  { value: "PICKED UP", label: "Picked Up", description: "Parcel collected from sender" },
  { value: "IN TRANSIT", label: "In Transit", description: "Parcel is on the way" },
  { value: "DELIVERED", label: "Delivered", description: "Successfully delivered" },
  { value: "FAILED", label: "Failed", description: "Delivery attempt failed" },
]

export function StatusUpdateModal({ parcel,handleRefreshRoute, children }: StatusUpdateModalProps) {
  const [open, setOpen] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState<ParcelStatus>(parcel.status)
  const [notes, setNotes] = useState("")
  const [isUpdating, setIsUpdating] = useState(false)

  const [updateParcel] = useUpdateParcelMutation()

  const handleStatusUpdate = async () => {
    if (selectedStatus === parcel.status) {
      toast("Please select a different status to update")
      return
    }

    setIsUpdating(true)

    try {
      await updateParcel({
        id: String(parcel.id),
        data: {
          status: selectedStatus,
          agent_note: notes,
        },
      }).unwrap()

      setOpen(false)
      setNotes("")
      handleRefreshRoute?.()
    } catch (error: any) {
    } finally {
      setIsUpdating(false)
    }
  }




  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Update Status - {parcel.tracking_id}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="text-sm font-medium">Current Status:</span>
            <Badge className={getStatusColor(parcel.status)}>{parcel.status.replace("_", " ")}</Badge>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">New Status</label>
            <Select value={selectedStatus} onValueChange={(value) => setSelectedStatus(value as ParcelStatus)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value} disabled={option.value === parcel.status}>
                    <div className="flex flex-col">
                      <span>{option.label}</span>
                      <span className="text-xs text-gray-500">{option.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Notes (Optional)</label>
            <Textarea
              placeholder="Add any additional notes about this status update..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setOpen(false)} disabled={isUpdating}>
              Cancel
            </Button>
            <Button onClick={handleStatusUpdate} disabled={isUpdating || selectedStatus === parcel.status}>
              {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Update Status
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
