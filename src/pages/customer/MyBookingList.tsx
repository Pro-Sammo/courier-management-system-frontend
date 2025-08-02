import { useGetMyBookingListQuery } from "@/store/api/parcelApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  AlertCircle,
  Package,
  PackageCheck,
  PackageX,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { useState } from "react";
import ParcelDetails from "@/components/parcels/ParcelDetails";
import { useNavigate } from "react-router-dom";

export default function MyBookings() {
  const [page, setPage] = useState(1);
  const limit = 10;
  const skip = (page - 1) * limit;
  const navigate = useNavigate();
  const [selectedParcel, setSelectedParcel] = useState<any>(null);

  const {
    data: parcels,
    isLoading,
    isError,
    isFetching,
  } = useGetMyBookingListQuery({ limit, skip });

  const handleMoveToBook = () => {
    navigate("/customer/book");
  };

  const getStatusClass = (status: string) => {
    switch (status.toLowerCase()) {
      case "delivered":
        return "bg-green-100 text-green-800";
      case "in transit":
        return "bg-blue-100 text-blue-800";
      case "processing":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "";
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            My Bookings
          </h1>
          <p className="text-muted-foreground">
            Track and manage your parcel shipments
          </p>
        </div>
        <Button variant="outline" className="gap-2" onClick={handleMoveToBook}>
          <Package className="w-4 h-4" />
          New Booking
        </Button>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="animate-spin w-10 h-10 text-primary" />
          <p className="text-muted-foreground">Loading your bookings...</p>
        </div>
      ) : isError ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Failed to load bookings. Please try again later.
          </AlertDescription>
        </Alert>
      ) : parcels?.data?.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
          <PackageX className="w-12 h-12 text-muted-foreground" />
          <h3 className="text-xl font-semibold">No bookings found</h3>
          <p className="text-muted-foreground max-w-md">
            You haven't made any bookings yet. Create your first shipment to get
            started.
          </p>
          <Button className="mt-4 pointer" onClick={handleMoveToBook}>
            Create Booking
          </Button>
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {parcels?.data?.map((parcel: any) => (
              <Card
                key={parcel.id}
                className="hover:shadow-md transition-shadow"
              >
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start gap-2">
                    <CardTitle className="text-lg font-medium truncate">
                      {parcel.tracking_id}
                    </CardTitle>
                    <Badge className={getStatusClass(parcel.status)}>
                      {parcel.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <PackageCheck className="w-4 h-4" />
                    <span>
                      {formatDistanceToNow(new Date(parcel.created_at))} ago
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="grid gap-2 text-sm">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="font-medium text-muted-foreground">
                        Sender
                      </p>
                      <p className="truncate">{parcel.sender_name}</p>
                    </div>
                    <div>
                      <p className="font-medium text-muted-foreground">
                        Receiver
                      </p>
                      <p className="truncate">{parcel.receiver_name}</p>
                    </div>
                  </div>

                  <div>
                    <p className="font-medium text-muted-foreground">Pickup</p>
                    <p className="line-clamp-2">{parcel.pickup_address}</p>
                  </div>

                  <div>
                    <p className="font-medium text-muted-foreground">
                      Delivery
                    </p>
                    <p className="line-clamp-2">{parcel.delivery_address}</p>
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-2">
                    <div>
                      <p className="font-medium text-muted-foreground">
                        Weight
                      </p>
                      <p>{parcel.parcel_weight} kg</p>
                    </div>
                    <div>
                      <p className="font-medium text-muted-foreground">Type</p>
                      <p>{parcel.parcel_type}</p>
                    </div>
                    <div>
                      <p className="font-medium text-muted-foreground">
                        Amount
                      </p>
                      <p>৳{parcel.amount}</p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4 w-full pointer"
                    onClick={() => setSelectedParcel(parcel)}
                  >
                    View Details
                  </Button>
                </CardContent>
              </Card>
            ))}
            <Dialog
              open={!!selectedParcel}
              onOpenChange={(isOpen) => {
                if (!isOpen) setSelectedParcel(null);
              }}
            >
              <DialogContent className="max-w-5xl w-full max-h-[90vh] overflow-y-auto p-0">
                {selectedParcel && <ParcelDetails parcel={selectedParcel} />}
              </DialogContent>
            </Dialog>
          </div>

          {/* Pagination */}
          {(parcels?.total ?? 0) > limit && (
            <div className="flex justify-center items-center gap-4 mt-6">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                disabled={page === 1}
              >
                Previous
              </Button>

              <span className="text-sm text-muted-foreground">
                Page {page} of {Math.ceil((parcels?.total ?? 0) / limit)}
              </span>

              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setPage((prev) =>
                    prev < Math.ceil((parcels?.total ?? 0) / limit)
                      ? prev + 1
                      : prev
                  )
                }
                disabled={page >= Math.ceil((parcels?.total ?? 0) / limit)}
              >
                Next
              </Button>
            </div>
          )}

          {/* Optional: Show loader on page change */}
          {isFetching && !isLoading && (
            <div className="text-center text-muted-foreground text-sm mt-4">
              Loading page {page}...
            </div>
          )}
        </>
      )}
    </div>
  );
}
