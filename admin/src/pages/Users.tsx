import { useQuery } from "@tanstack/react-query";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import {
  Users as UsersIcon,
  Calendar,
  UserCheck,
  Activity,
} from "lucide-react";

// Type definitions
interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  isActive: boolean;
}

interface CaregiverAccess {
  user: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

interface Elder {
  id: string;
  firstName: string;
  lastName: string;
  gender: string;
  dateOfBirth: string;
  isActive: boolean;
  caregivers?: CaregiverAccess[];
}

// Helper function to convert date to Buddhist Era
const toBuddhistYear = (date: Date | string): string => {
  const d = new Date(date);
  const buddhistYear = d.getFullYear() + 543;
  const day = d.getDate().toString().padStart(2, "0");
  const month = (d.getMonth() + 1).toString().padStart(2, "0");
  return `${day}/${month}/${buddhistYear}`;
};

export default function Users() {
  const { user: currentUser } = useAuth();
  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const response = await api.get("/admin/users");
      return response.data.data;
    },
    refetchInterval: 5000,
  });

  const { data: elders, isLoading: eldersLoading } = useQuery({
    queryKey: ["elders"],
    queryFn: async () => {
      const response = await api.get("/admin/elders");
      return response.data.data;
    },
    refetchInterval: 5000,
  });

  if (usersLoading || eldersLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Total Users</p>
                <p className="text-3xl font-bold text-blue-600">
                  {users?.length || 0}
                </p>
              </div>
              <div className="p-2.5 bg-linear-to-br from-blue-500 to-blue-600 rounded-xl">
                <UsersIcon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Total Elders</p>
                <p className="text-3xl font-bold text-purple-600">
                  {elders?.length || 0}
                </p>
              </div>
              <div className="p-2.5 bg-linear-to-br from-purple-500 to-purple-600 rounded-xl">
                <Activity className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Active Users</p>
                <p className="text-3xl font-bold text-green-600">
                  {users?.filter((u: User) => u.isActive).length || 0}
                </p>
              </div>
              <div className="p-2.5 bg-linear-to-br from-green-500 to-green-600 rounded-xl">
                <UserCheck className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Users Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-linear-to-br from-blue-500 to-indigo-600 rounded-lg">
              <UsersIcon className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold bg-linear-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              Registered Users
            </h2>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-linear-to-r from-gray-50 to-blue-50 border-b border-gray-200">
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users?.map((user: User) => (
                  <tr
                    key={user.id}
                    className="hover:bg-blue-50/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-lg">
                          {user.firstName?.[0]?.toUpperCase()}
                          {user.lastName?.[0]?.toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">
                            {user.firstName} {user.lastName}
                          </p>
                          {currentUser?.id === user.id && (
                            <span className="inline-block mt-0.5 px-2 py-0.5 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                              You
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{user.email}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${user.role === "ADMIN"
                          ? "bg-purple-100 text-purple-700 border border-purple-200"
                          : "bg-blue-100 text-blue-700 border border-blue-200"
                          }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${user.isActive
                          ? "bg-green-100 text-green-700 border border-green-200"
                          : "bg-red-100 text-red-700 border border-red-200"
                          }`}
                      >
                        {user.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Elders Section */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-linear-to-br from-purple-500 to-pink-600 rounded-lg">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold bg-linear-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              Elders
            </h2>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-linear-to-r from-gray-50 to-purple-50 border-b border-gray-200">
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Caregiver
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Gender
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Date of Birth
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {elders?.map((elder: Elder) => (
                  <tr
                    key={elder.id}
                    className="hover:bg-purple-50/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-linear-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white font-bold shadow-lg">
                          {elder.firstName?.[0]?.toUpperCase()}
                          {elder.lastName?.[0]?.toUpperCase()}
                        </div>
                        <p className="font-semibold text-gray-900">
                          {elder.firstName} {elder.lastName}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {elder.caregivers && elder.caregivers.length > 0 ? (
                        <div className="flex flex-col gap-1">
                          {elder.caregivers.map((access: CaregiverAccess) => (
                            <span
                              key={access.user.id}
                              className="text-sm text-gray-700"
                            >
                              {access.user.firstName} {access.user.lastName}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-400 italic text-sm">
                          No caregiver
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
                        {elder.gender}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-gray-700">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="font-medium">
                          {toBuddhistYear(elder.dateOfBirth)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${elder.isActive
                          ? "bg-green-100 text-green-700 border border-green-200"
                          : "bg-red-100 text-red-700 border border-red-200"
                          }`}
                      >
                        {elder.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
