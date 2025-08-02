import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { User, Agent, IAgent } from "@/types";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL

export const userApi = createApi({
  reducerPath: "userApi",
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
  tagTypes: ["User", "Agent"],
  endpoints: (builder) => ({
    getUsers: builder.query<User[], { role?: string; filter?: string }>({
      query: ({ role, filter }) => ({
        url: "/admin/user",
        params: {
          ...(role && { role }),
          ...(filter && { filter }),
        },
      }),
      transformResponse: (response: any) => {
        // Handle the API response structure you showed
        if (response.success && response.data) {
          return response.data;
        }
        return [];
      },
      providesTags: ["User"],
    }),
    getAgents: builder.query<Agent[], { available?: boolean }>({
      query: ({ available }) => ({
        url: "/agents",
        params: { available },
      }),
      providesTags: ["Agent"],
    }),
    updateUserStatus: builder.mutation<User, { id: string; status: string }>({
      query: ({ id, status }) => ({
        url: `/${id}/status`,
        method: "PUT",
        body: { status },
      }),
      invalidatesTags: ["User", "Agent"],
    }),

    updateUserRole: builder.mutation({
      query: (body) => ({
        url: "/admin/user/update-role",
        method: "POST",
        body,
      }),
    }),

      getAllAgentList: builder.query<Agent[], void>({
      query: () => ({
        url: "/admin/agent",
        method: "GET",
      }),
      transformResponse: (response: IAgent) => response.data,
    }),
  }),
});

export const {
  useGetUsersQuery,
  useGetAgentsQuery,
  useUpdateUserStatusMutation,
  useUpdateUserRoleMutation,
  useGetAllAgentListQuery
} = userApi;
