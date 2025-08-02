import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, DollarSign, TrendingUp, Clock, Wallet } from "lucide-react";
import { useGetDashboardStatsQuery } from "@/store/api/parcelApi";
import { formatDate, formatDateWithoutTime } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { saveAs } from "file-saver";
import Papa from "papaparse";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function AdminDashboard() {
  const { data: stats, isLoading } = useGetDashboardStatsQuery();

  const handleExportCSV = () => {
    if (!stats?.daily_booking.length) return;

    const formattedData = stats.daily_booking.map((item) => ({
      "Booking ID": item.id,
      "Tracking ID": item.tracking_id,
      "Customer Name": item.customer_name,
      Sender: item.sender_name,
      Receiver: item.receiver_name,
      Status: item.status,
      "Amount (৳)": item.amount,
      "Payment Status": item.is_paid ? "Paid" : "Unpaid",
      "Booking Date": formatDateWithoutTime(item.created_at),
      "Payment Type": item.payment_mode,
    }));

    const csv = Papa.unparse(formattedData);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, "daily_booking.csv");
  };

  const handleExportPDF = () => {
    if (!stats?.daily_booking?.length) {
      alert("No data to export");
      return;
    }

    const doc = new jsPDF();
    doc.text(
      `Daily Booking Report for ${formatDateWithoutTime(new Date())}`,
      14,
      16
    );

    autoTable(doc, {
      startY: 20,
      head: [
        [
          "Tracking ID",
          "Customer",
          "Sender",
          "Receiver",
          "Status",
          "Amount",
          "Payment Type",
          "Payment Status",
          "Booking Date",
        ],
      ],
      body: stats.daily_booking.map((p) => [
        p.tracking_id || "",
        p.customer_name || "",
        p.sender_name || "",
        p.receiver_name || "",
        p.status || "",
        `${Number(p.amount).toFixed(2)}`,
        p.payment_mode || "",
        p.is_paid ? "Paid" : "Unpaid",
        new Date(p.created_at).toLocaleString(),
      ]),
    });

    doc.save("daily_booking.pdf");
  };

  const handleFailedExportCSV = () => {
    if (!stats?.failed_deliveries?.length) return;
    const csv = Papa.unparse(stats.failed_deliveries);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, "failed_deliveries.csv");
  };

  const handleFailedExportPDF = () => {
    if (!stats?.failed_deliveries?.length) {
      alert("No data to export");
      return;
    }

    const doc = new jsPDF();
    doc.text(
      `Failed Deliveries Report for ${formatDateWithoutTime(new Date())}`,
      14,
      16
    );

    autoTable(doc, {
      startY: 20,
      head: [
        [
          "Tracking ID",
          "Customer",
          "Sender",
          "Receiver",
          "Status",
          "Amount",
          "Booking Date",
        ],
      ],
      body: stats.failed_deliveries.map((p) => [
        p.tracking_id || "",
        p.customer_name || "",
        p.sender_name || "",
        p.receiver_name || "",
        p.status || "",
        `${Number(p.amount).toFixed(2)}`,
        new Date(p.created_at).toLocaleDateString("en-US"),
      ]),
    });

    doc.save("failed_deliveries.pdf");
  };

  const statsCards = [
    {
      title: "Total Parcels",
      value: parseInt(stats?.state.total_parcels || "0"),
      icon: Package,
    },
    {
      title: "COD Parcels",
      value: parseInt(stats?.state.total_cod_count || "0"),
      icon: Wallet,
    },
    {
      title: "Pending Deliveries",
      value: parseInt(stats?.state.pending_deliveries || "0"),
      icon: Clock,
    },
    {
      title: "Delivered",
      value: parseInt(stats?.state.delivered_count || "0"),
      icon: TrendingUp,
    },
    {
      title: "Total Revenue",
      value: `BDT ${parseFloat(
        stats?.state.total_revenue || "0"
      ).toLocaleString()}`,
      icon: DollarSign,
    },
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Dashboard</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {[...Array(5)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-gray-600">
            Welcome back! Here's what's happening with your deliveries.
          </p>
        </div>
        <div className="text-sm text-gray-500">
          Last updated: {formatDate(new Date())}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        {statsCards.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Activity Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex items-center justify-between">
            <CardTitle>Todays Parcels</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleExportCSV}>
                Export CSV
              </Button>
              <Button variant="outline" size="sm" onClick={handleExportPDF}>
                Export PDF
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats?.daily_booking.length ? (
                stats.daily_booking.map((parcel) => (
                  <div
                    key={parcel.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded"
                  >
                    <div>
                      <p className="font-medium">{parcel.tracking_id}</p>
                      <p className="text-sm text-gray-600">
                        {parcel.sender_name} → {parcel.receiver_name}
                      </p>
                    </div>
                    <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                      {parcel.status}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">No recent parcels</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Failed Deliveries */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle> All Time Failed Deliveries</CardTitle>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleFailedExportCSV}
                >
                  Export CSV
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleFailedExportPDF}
                >
                  Export PDF
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats?.failed_deliveries.length ? (
                stats.failed_deliveries.map((parcel) => (
                  <div
                    key={parcel.id}
                    className="flex items-center justify-between p-3 bg-red-50 rounded"
                  >
                    <div>
                      <p className="font-medium">{parcel.tracking_id}</p>
                      <p className="text-sm text-gray-600">
                        {parcel.sender_name} → {parcel.receiver_name}
                      </p>
                    </div>
                    <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded">
                      {parcel.status}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">No failed deliveries</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
