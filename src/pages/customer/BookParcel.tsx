import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useCreateParcelMutation } from "@/store/api/parcelApi";
import { useNavigate } from "react-router-dom";
import { LocationPicker } from "@/components/maps/LocationPicker";

const formSchema = z.object({
  senderName: z.string().min(1, "Required"),
  senderPhone: z.string().min(10, "Invalid phone"),
  receiverName: z.string().min(1, "Required"),
  receiverPhone: z.string().min(10, "Invalid phone"),
  pickupAddress: z.string().min(1, "Required"),
  pickupLat: z.number().refine((val) => val !== undefined, {
    message: "Pickup coordinates required",
  }),
  pickupLng: z.number().refine((val) => val !== undefined, {
    message: "Pickup coordinates required",
  }),
  deliveryAddress: z.string().min(1, "Required"),
  deliveryLat: z.number().refine((val) => val !== undefined, {
    message: "Delivery coordinates required",
  }),
  deliveryLng: z.number().refine((val) => val !== undefined, {
    message: "Delivery coordinates required",
  }),
  parcelType: z.enum([
    "fragile",
    "electronics",
    "documents",
    "clothing",
    "food",
    "other",
  ]),
  parcelWeight: z.number().min(0.1, "Weight must be positive"),
  parcelDescription: z.string().optional(),
  paymentMode: z.enum(["cod", "prepaid"]),
  amount: z.number().min(0, "Amount must be non-negative"),
});

type BookParcelForm = z.infer<typeof formSchema>;

export default function BookParcel() {
  const [createParcel, { isLoading }] = useCreateParcelMutation();
  const navigate = useNavigate();

  const form = useForm<BookParcelForm>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      senderName: "",
      senderPhone: "",
      receiverName: "",
      receiverPhone: "",
      pickupAddress: "",
      pickupLat: undefined,
      pickupLng: undefined,
      deliveryAddress: "",
      deliveryLat: undefined,
      deliveryLng: undefined,
      parcelType: "other",
      parcelWeight: 0.1,
      parcelDescription: "",
      paymentMode: "cod",
      amount: 0,
    },
  });

  const onSubmit = async (data: BookParcelForm) => {
    try {
      const parcelData = {
        sender_name: data.senderName,
        sender_phone: data.senderPhone,
        receiver_name: data.receiverName,
        receiver_phone: data.receiverPhone,
        pickup_address: data.pickupAddress,
        pickup_lat: data.pickupLat,
        pickup_lng: data.pickupLng,
        delivery_address: data.deliveryAddress,
        delivery_lat: data.deliveryLat,
        delivery_lng: data.deliveryLng,
        parcel_type: data.parcelType,
        parcel_weight: data.parcelWeight,
        parcel_description: data.parcelDescription,
        payment_mode: data.paymentMode,
        amount: data.amount,
        is_paid: data.paymentMode === "prepaid",
      };

      await createParcel(parcelData).unwrap();
      toast.success("Parcel booked successfully");
      navigate("/customer/bookings");
    } catch (error: any) {
      toast.error("Booking Failed", {
        description: error?.data?.message || "Something went wrong.",
      });
    }
  };

  // Reusable required label
  const RequiredLabel = ({ children }: { children: React.ReactNode }) => (
    <FormLabel>
      {children} <span className="text-red-500">*</span>
    </FormLabel>
  );

  return (
    <div className="max-w-5xl mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Book Parcel</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              <div className="space-y-6">
                {/* Sender Name */}
                <FormField
                  control={form.control}
                  name="senderName"
                  render={({ field }) => (
                    <FormItem>
                      <RequiredLabel>Sender Name</RequiredLabel>
                      <FormControl>
                        <Input placeholder="Sender name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Sender Phone */}
                <FormField
                  control={form.control}
                  name="senderPhone"
                  render={({ field }) => (
                    <FormItem>
                      <RequiredLabel>Sender Phone</RequiredLabel>
                      <FormControl>
                        <Input type="tel" placeholder="Sender phone" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Pickup Location */}
                <FormField
                  control={form.control}
                  name="pickupAddress"
                  render={({ field }) => (
                    <FormItem>
                      <RequiredLabel>Pickup Location</RequiredLabel>
                      <LocationPicker
                        value={field.value}
                        onAddressChange={(address) => field.onChange(address)}
                        onCoordinatesChange={(lat, lng) => {
                          form.setValue("pickupLat", lat);
                          form.setValue("pickupLng", lng);
                        }}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Parcel Type */}
                <FormField
                  control={form.control}
                  name="parcelType"
                  render={({ field }) => (
                    <FormItem>
                      <RequiredLabel>Parcel Type</RequiredLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="fragile">Fragile</SelectItem>
                          <SelectItem value="electronics">Electronics</SelectItem>
                          <SelectItem value="documents">Documents</SelectItem>
                          <SelectItem value="clothing">Clothing</SelectItem>
                          <SelectItem value="food">Food</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Parcel Weight */}
                <FormField
                  control={form.control}
                  name="parcelWeight"
                  render={({ field }) => (
                    <FormItem>
                      <RequiredLabel>Weight (kg)</RequiredLabel>
                      <FormControl>
                        <Input
                          type="number"
                          value={field.value === 0 ? "" : field.value}
                          onChange={(e) => {
                            const value = e.target.value;
                            field.onChange(value === "" ? 0 : Number(value));
                          }}
                          placeholder="e.g. 2.5"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-6">
                {/* Receiver Name */}
                <FormField
                  control={form.control}
                  name="receiverName"
                  render={({ field }) => (
                    <FormItem>
                      <RequiredLabel>Receiver Name</RequiredLabel>
                      <FormControl>
                        <Input placeholder="Receiver name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Receiver Phone */}
                <FormField
                  control={form.control}
                  name="receiverPhone"
                  render={({ field }) => (
                    <FormItem>
                      <RequiredLabel>Receiver Phone</RequiredLabel>
                      <FormControl>
                        <Input type="tel" placeholder="Receiver phone" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Delivery Location */}
                <FormField
                  control={form.control}
                  name="deliveryAddress"
                  render={({ field }) => (
                    <FormItem>
                      <RequiredLabel>Delivery Location</RequiredLabel>
                      <LocationPicker
                        value={field.value}
                        onAddressChange={(address) => field.onChange(address)}
                        onCoordinatesChange={(lat, lng) => {
                          form.setValue("deliveryLat", lat);
                          form.setValue("deliveryLng", lng);
                        }}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Amount */}
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <RequiredLabel>Amount (BDT)</RequiredLabel>
                      <FormControl>
                        <Input
                          type="number"
                          value={field.value === 0 ? "" : field.value}
                          onChange={(e) => {
                            const value = e.target.value;
                            field.onChange(value === "" ? 0 : Number(value));
                          }}
                          placeholder="Amount"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Payment Mode */}
                <FormField
                  control={form.control}
                  name="paymentMode"
                  render={({ field }) => (
                    <FormItem>
                      <RequiredLabel>Payment Mode</RequiredLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select payment mode" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="cod">Cash on Delivery</SelectItem>
                          <SelectItem value="prepaid">Prepaid</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Full-width Description & Submit */}
              <div className="md:col-span-2 space-y-6">
                <FormField
                  control={form.control}
                  name="parcelDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Parcel Description (Optional)</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Parcel description" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" disabled={isLoading} className="w-full">
                  {isLoading ? "Booking..." : "Book Parcel"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
