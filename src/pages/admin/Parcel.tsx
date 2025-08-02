import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  User2,
  MapPin,
  Package,
  Search,
  Filter,
  Truck,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import {
  useGetAllParcelsAdminQuery,
  useUpdateParcelStatusByAdminMutation,
  useAssignAgentToParcelMutation,
} from "@/store/api/parcelApi";
import { useGetAllAgentListQuery } from "@/store/api/userApi";
import { FILE_LOCATION } from "@/miscellaneous/constants";
import { useEffect } from "react";
import { useSocket } from "@/contexts/SocketContext";
import { AgentCombobox } from "@/components/agent/AgentCombobox";

export default function AdminParcels() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [skip, setSkip] = useState(0);
  const [limit] = useState(12);
  const { on, off } = useSocket();
  // const [updatedParcels, setUpdatedParcels] = useState({});

  const {
    data: parcelsResponse,
    isLoading: parcelsLoading,
    isError: parcelsError,
    refetch: refetchParcels,
  } = useGetAllParcelsAdminQuery({
    skip,
    limit,
    status: statusFilter === "all" ? undefined : statusFilter,
  });

  useEffect(() => {
    const listener = (updatedParcel: any) => {
      console.log("Parcel updated:", updatedParcel);
      refetchParcels();
    };

    on("updateParcelStatus", listener);
    return () => {
      off("updateParcelStatus", listener);
    };
  }, [on, off, refetchParcels]);

  const {
    data: agents = [],
    isLoading: agentsLoading,
    isError: agentsError,
  } = useGetAllAgentListQuery();
  const [updateParcel, { isLoading: isUpdating }] =
    useUpdateParcelStatusByAdminMutation();
  const [assignAgent, { isLoading: isAssigning }] =
    useAssignAgentToParcelMutation();

  const parcels = parcelsResponse?.data || [];
  const totalParcels = parcelsResponse?.total || 0;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PENDING":
        return <Clock className="w-3 h-3" />;
      case "PICKED UP":
        return <Package className="w-3 h-3" />;
      case "IN TRANSIT":
        return <Truck className="w-3 h-3" />;
      case "DELIVERED":
        return <CheckCircle className="w-3 h-3" />;
      case "FAILED":
        return <XCircle className="w-3 h-3" />;
      default:
        return <AlertCircle className="w-3 h-3" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "PICKED UP":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "IN TRANSIT":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "DELIVERED":
        return "bg-green-100 text-green-800 border-green-200";
      case "FAILED":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const filteredParcels = parcels.filter((parcel) => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      parcel.tracking_id.toLowerCase().includes(searchLower) ||
      parcel.sender_name.toLowerCase().includes(searchLower) ||
      parcel.receiver_name.toLowerCase().includes(searchLower)
    );
  });

  const handleChangeStatus = async (parcelId: number, status: string) => {
    try {
      await updateParcel({
        data: { status, parcel_id: Number(parcelId) },
      }).unwrap();
      toast.success(`Status updated to ${status}`);
      refetchParcels();
    } catch (error) {
      toast.error("Failed to update status");
      console.error("Update status error:", error);
    }
  };

  const handleAssignAgent = async (parcelId: number, agentId: string) => {
    try {
      await assignAgent({
        parcel_id: Number(parcelId),
        agent_id: Number(agentId),
      });
      toast.success(`Agent assigned successfully`);
    } catch (error) {
      toast.error("Failed to assign agent");
      console.error("Assign agent error:", error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getAgent = (agentId?: number) => {
    if (!agentId) return null;
    return agents.find((a) => a.id === agentId);
  };

  const LoadingSkeleton = () => (
    <div className="grid gap-3 grid-cols-1 lg:grid-cols-2">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i} className="border shadow-sm bg-white rounded-lg">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2">
                <div>
                  <Skeleton className="w-24 h-4 mb-1" />
                  <Skeleton className="w-16 h-3" />
                </div>
              </div>
              <Skeleton className="w-16 h-5 rounded-full" />
            </div>
          </CardHeader>
          <CardContent className="p-3 space-y-2">
            <Skeleton className="w-full h-16" />
            <Skeleton className="w-full h-16" />
            <Skeleton className="w-full h-8" />
            <Skeleton className="w-full h-8" />
          </CardContent>
        </Card>
      ))}
    </div>
  );

  if (parcelsError || agentsError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <XCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              Failed to load data
            </h3>
            <p className="text-gray-500 mb-4">
              There was an error loading the parcels or agents
            </p>
            <Button
              onClick={() => refetchParcels()}
              size="sm"
              className="gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Compact Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg shadow">
                <Package className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  Parcel Management
                </h1>
                <p className="text-sm text-gray-600">
                  Manage and track all parcels
                </p>
              </div>
            </div>
            <Button
              onClick={() => refetchParcels()}
              variant="outline"
              size="sm"
              className="gap-2"
              disabled={parcelsLoading}
            >
              <RefreshCw
                className={`w-4 h-4 ${parcelsLoading ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
          </div>
        </div>

        {/* Compact Filters */}
        <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search by tracking ID, sender, or receiver..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 h-9 text-sm border-gray-200"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="text-gray-400 w-4 h-4" />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40 h-9 text-sm border-gray-200">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="PICKED UP">Picked Up</SelectItem>
                  <SelectItem value="IN TRANSIT">In Transit</SelectItem>
                  <SelectItem value="DELIVERED">Delivered</SelectItem>
                  <SelectItem value="FAILED">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {parcelsLoading && <LoadingSkeleton />}

        {/* Horizontal Parcels Grid */}
        {!parcelsLoading && (
          <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
            {filteredParcels.map((parcel) => {
              const assignedAgent = getAgent(parcel.agent_id);
              return (
                <Card
                  key={parcel.id}
                  className="group border shadow-sm bg-white hover:shadow-lg transition-all duration-200 rounded-lg overflow-hidden"
                >
                  <CardHeader className="pb-3 bg-gradient-to-r from-gray-50 to-blue-50 p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                          {parcel.tracking_id}
                        </CardTitle>
                        <p className="text-sm text-gray-500">
                          {formatDate(parcel.created_at)}
                        </p>
                      </div>
                      <Badge
                        className={`${getStatusColor(
                          parcel.status
                        )} border text-sm px-3 py-1 flex items-center gap-1`}
                      >
                        {getStatusIcon(parcel.status)}
                        {parcel.status.replace("_", " ")}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Left Column - Sender & Receiver */}
                      <div className="space-y-3">
                        {/* Sender Info */}
                        <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                          <User2 className="text-green-600 mt-1" size={16} />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-green-700 uppercase tracking-wide">
                              FROM
                            </p>
                            <p className="text-sm font-semibold text-gray-900">
                              {parcel.sender_name}
                            </p>
                            <p className="text-xs text-gray-600">
                              {parcel.sender_phone}
                            </p>
                            <div className="mt-2">
                              <p className="text-xs font-medium text-green-700 mb-1">
                                Pickup Address
                              </p>
                              <p className="text-xs text-gray-600 leading-relaxed">
                                {parcel.pickup_address}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Receiver Info */}
                        <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                          <MapPin className="text-blue-600 mt-1" size={16} />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-blue-700 uppercase tracking-wide">
                              TO
                            </p>
                            <p className="text-sm font-semibold text-gray-900">
                              {parcel.receiver_name}
                            </p>
                            <p className="text-xs text-gray-600">
                              {parcel.receiver_phone}
                            </p>
                            <div className="mt-2">
                              <p className="text-xs font-medium text-blue-700 mb-1">
                                Delivery Address
                              </p>
                              <p className="text-xs text-gray-600 leading-relaxed">
                                {parcel.delivery_address}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Right Column - Details & Actions */}
                      <div className="space-y-3">
                        {/* Amount & Payment */}
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <div className="text-center mb-3">
                            <p className="text-xs text-gray-500 uppercase tracking-wide">
                              Amount
                            </p>
                            <p className="text-xl font-bold text-gray-900">
                              ৳{parcel.amount}
                            </p>
                          </div>
                          <div className="flex items-center justify-between">
                            <Badge
                              variant={
                                parcel.payment_mode === "prepaid"
                                  ? "secondary"
                                  : "outline"
                              }
                              className="text-xs"
                            >
                              {String(parcel.payment_mode).toUpperCase()}
                            </Badge>
                            <Badge
                              variant={
                                parcel.is_paid ? "secondary" : "destructive"
                              }
                              className="text-xs"
                            >
                              {parcel.is_paid ? "Paid" : "Unpaid"}
                            </Badge>
                          </div>
                        </div>

                        {/* Description */}
                        {parcel.parcel_description && (
                          <div className="p-3 bg-yellow-50 rounded-lg">
                            <p className="text-xs font-medium text-yellow-700 mb-1">
                              Description
                            </p>
                            <p className="text-xs text-gray-600">
                              {parcel.parcel_description}
                            </p>
                          </div>
                        )}

                        {/* Agent Info */}
                        {assignedAgent && (
                          <div className="p-3 bg-indigo-50 rounded-lg">
                            <p className="text-xs font-medium text-indigo-700 uppercase tracking-wide mb-2">
                              ASSIGNED AGENT
                            </p>
                            <div className="flex items-center gap-3">
                              <Avatar className="w-8 h-8">
                                <AvatarImage
                                  src={`${FILE_LOCATION}/${assignedAgent.photo}`}
                                  alt={assignedAgent.name}
                                />
                                <AvatarFallback className="text-xs">
                                  {assignedAgent.name?.charAt(0) || "A"}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="text-sm font-semibold text-gray-900">
                                  {assignedAgent.name}
                                </p>
                                <p className="text-sm font-semibold text-gray-900">
                                  {assignedAgent.phone}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="space-y-2 flex gap-2">
                          <div>
                            <label className="text-xs font-medium text-gray-700 block mb-1">
                              Update Status
                            </label>
                            <Select
                              onValueChange={(value) =>
                                handleChangeStatus(parcel.id, value)
                              }
                              disabled={isUpdating}
                            >
                              <SelectTrigger className="h-8 text-xs border-gray-200">
                                <SelectValue placeholder={parcel.status} />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="PENDING">Pending</SelectItem>
                                <SelectItem value="PICKED UP">
                                  Picked Up
                                </SelectItem>
                                <SelectItem value="IN TRANSIT">
                                  In Transit
                                </SelectItem>
                                <SelectItem value="DELIVERED">
                                  Delivered
                                </SelectItem>
                                <SelectItem value="FAILED">Failed</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <label className="text-xs font-medium text-gray-700 block mb-1">
                              Assign Agent
                            </label>
                            <AgentCombobox
                              agents={agents}
                              assignedAgent={assignedAgent}
                              disabled={isAssigning || agentsLoading}
                              onSelect={(agentId:any) =>
                                handleAssignAgent(parcel.id, agentId)
                              }
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Empty State */}
        {!parcelsLoading && filteredParcels.length === 0 && (
          <div className="text-center py-12">
            <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              No parcels found
            </h3>
            <p className="text-gray-500 text-sm">
              {searchTerm
                ? "Try adjusting your search criteria"
                : "No parcels available"}
            </p>
          </div>
        )}

        {/* Compact Pagination */}
        {!parcelsLoading && totalParcels > limit && (
          <div className="flex justify-center items-center gap-3 mt-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSkip(Math.max(0, skip - limit))}
              disabled={skip === 0}
            >
              Previous
            </Button>
            <span className="text-xs text-gray-600">
              {skip + 1}-{Math.min(skip + limit, totalParcels)} of{" "}
              {totalParcels}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSkip(skip + limit)}
              disabled={skip + limit >= totalParcels}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
