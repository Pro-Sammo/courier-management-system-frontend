import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { formatDate, getStatusColor } from "@/lib/utils";
import type { AssignedParcel } from "@/pages/agent/AssignedParcels";

interface ParcelDetailsModalProps {
  open: boolean;
  onClose: () => void;
  parcel: AssignedParcel | null;
}

export default function ParcelDetailsModal({
  open,
  onClose,
  parcel,
}: ParcelDetailsModalProps) {
  if (!parcel) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            Parcel Details - <span className="text-primary">{parcel.tracking_id}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm mt-4">
          <div className="col-span-2">
            <p className="font-medium">
              <strong>Status:</strong>{" "}
              <Badge className={getStatusColor(parcel.status)}>
                {parcel.status.replaceAll("_", " ")}
              </Badge>
            </p>
          </div>

          <div>
            <p><strong>Sender:</strong></p>
            <p>{parcel.sender_name} ({parcel.sender_phone})</p>
          </div>

          <div>
            <p><strong>Receiver:</strong></p>
            <p>{parcel.receiver_name} ({parcel.receiver_phone})</p>
          </div>

          <div>
            <p><strong>Pickup Address:</strong></p>
            <p>{parcel.pickup_address}</p>
          </div>

          <div>
            <p><strong>Delivery Address:</strong></p>
            <p>{parcel.delivery_address}</p>
          </div>

          <div>
            <p><strong>Weight:</strong> {parcel.parcel_weight || "N/A"} kg</p>
          </div>

          <div>
            <p><strong>Type:</strong> {parcel.parcel_type || "N/A"}</p>
          </div>

          <div className="col-span-2">
            <p><strong>Description:</strong></p>
            <p>{parcel.parcel_description || "N/A"}</p>
          </div>

          <div>
            <p><strong>Payment Mode:</strong> {parcel.payment_mode}</p>
          </div>

          <div>
            <p><strong>Amount:</strong> ৳{parcel.amount}</p>
          </div>

          <div>
            <p><strong>Paid:</strong> {parcel.is_paid ? "Yes" : "No"}</p>
          </div>

          <div>
            <p><strong>Created At:</strong> {formatDate(parcel.created_at)}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
