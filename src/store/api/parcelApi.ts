import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type {
  Parcel,
  DashboardStats,
  IBooking,
  GetAssignedParcelsResponse,
  TrackParcelResponse,
  ITrackingParcel,
  AgentDashboardStats,
  AgentParcelStatsData,
} from "@/types";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL 

export const parcelApi = createApi({
  reducerPath: "parcelApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_BASE_URL}`,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as any).auth.token;
      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["Parcel", "Stats"],
  endpoints: (builder) => ({
    createParcel: builder.mutation<Parcel, Partial<Parcel>>({
      query: (parcelData) => ({
        url: "/customer/parcel",
        method: "POST",
        body: parcelData,
      }),
      invalidatesTags: ["Parcel", "Stats"],
    }),
    getParcels: builder.query<
      Parcel[],
      { page?: number; limit?: number; status?: string }
    >({
      query: ({ page = 1, limit = 10, status }) => ({
        url: "/",
        params: { page, limit, status },
      }),
      providesTags: ["Parcel"],
    }),
    getParcelById: builder.query<Parcel, string>({
      query: (id) => `/${id}`,
      providesTags: ["Parcel"],
    }),
    updateParcel: builder.mutation<
      Parcel,
      { id: string; data: { status: string; agent_note?: string } }
    >({
      query: ({ id, data }) => ({
        url: `agent/parcel/update-status/${id}`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Parcel", "Stats"],
    }),
    trackParcel: builder.query<ITrackingParcel, string>({
      query: (trackingNumber) => `/customer/parcel/track/${trackingNumber}`,

      transformResponse: (response: TrackParcelResponse): ITrackingParcel =>
        response.data,
      providesTags: ["Parcel"],
    }),
    assignAgent: builder.mutation<
      Parcel,
      { parcelId: string; agentId: string }
    >({
      query: ({ parcelId, agentId }) => ({
        url: `/${parcelId}/assign`,
        method: "POST",
        body: { agentId },
      }),
      invalidatesTags: ["Parcel"],
    }),
    getDashboardStats: builder.query<DashboardStats, void>({
      query: () => "/admin/dashboard",
      transformResponse: (response: {
        success: boolean;
        message: string;
        data: DashboardStats;
      }) => response.data,
      providesTags: ["Stats"],
    }),

    getMyBookingList: builder.query<
      IBooking,
      { skip?: number; limit?: number; status?: string }
    >({
      query: ({ skip = 0, limit = 10, status }) => ({
        url: "/customer/parcel",
        method: "GET",
        params: { skip, limit, status },
      }),
      providesTags: ["Parcel"],
    }),

    getAllParcelsAdmin: builder.query<
      {
        success: boolean;
        message: string;
        total: number;
        data: Parcel[];
      },
      { skip?: number; limit?: number; status?: string }
    >({
      query: ({ skip = 0, limit = 10, status }) => ({
        url: "/admin/parcel",
        params: { skip, limit, status },
      }),
      providesTags: ["Parcel"],
    }),

    changeParcelStatus: builder.mutation<
      {
        success: boolean;
        message: string;
      },
      {
        parcel_id: number;
        status: string;
      }
    >({
      query: (body) => ({
        url: "admin/parcel/change-status",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Parcel"],
    }),

    assignAgentToParcel: builder.mutation<
      {
        success: boolean;
        message: string;
      },
      {
        parcel_id: number;
        agent_id: number;
      }
    >({
      query: (body) => ({
        url: "/admin/parcel/assign-agent",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Parcel"],
    }),

    getAssignedParcels: builder.query<GetAssignedParcelsResponse, void>({
      query: () => ({
        url: "/agent/parcel",
        method: "GET",
      }),
      providesTags: ["Parcel"],
    }),

    updateParcelStatusByAdmin: builder.mutation<
      Parcel,
      { data: { status: string; parcel_id: number } }
    >({
      query: ({ data }) => ({
        url: `admin/parcel/change-status`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Parcel", "Stats"],
    }),

    getCustomerDashboardData: builder.query<AgentDashboardStats, void>({
      query: () => "/customer/dashboard",
      transformResponse: (response: {
        success: boolean;
        message: string;
        data: AgentDashboardStats;
      }) => response.data,
      providesTags: ["Stats"],
    }),

    getAgentDashboardData: builder.query<AgentParcelStatsData, void>({
      query: () => "/agent/dashboard",
      transformResponse: (response: {
        success: boolean;
        message: string;
        data: AgentParcelStatsData;
      }) => response.data,
      providesTags: ["Stats"],
    })
  }),
});

export const {
  useCreateParcelMutation,
  useGetParcelsQuery,
  useGetParcelByIdQuery,
  useUpdateParcelMutation,
  useTrackParcelQuery,
  useAssignAgentMutation,
  useGetDashboardStatsQuery,
  useGetMyBookingListQuery,
  useGetAllParcelsAdminQuery,
  useChangeParcelStatusMutation,
  useAssignAgentToParcelMutation,
  useGetAssignedParcelsQuery,
  useUpdateParcelStatusByAdminMutation,
  useGetCustomerDashboardDataQuery,
  useGetAgentDashboardDataQuery,
} = parcelApi;
