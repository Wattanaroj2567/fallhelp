import { useAuth } from "../context/AuthContext";
import {
  Users as UsersIcon,
  Smartphone,
  Activity,
  Calendar,
} from "lucide-react";
import { useAdminDashboard } from "../hooks/useAdminDashboard";
import { useAdminUsers } from "../hooks/useAdminUsers";
import { useAdminElders } from "../hooks/useAdminElders";
import { LoadingSkeleton } from "../components/LoadingSkeleton";
import { StatusBadge } from "../components/StatusBadge";
import { toBuddhistYear } from "../utils/date";
import type { User, Elder, CaregiverAccess } from "../types";

export default function Dashboard() {
  const { user: currentUser } = useAuth();

  const { data, isLoading: dashboardLoading } = useAdminDashboard();
  const { data: users, isLoading: usersLoading } = useAdminUsers();
  const { data: elders, isLoading: eldersLoading } = useAdminElders();

  if (dashboardLoading || usersLoading || eldersLoading) {
    return <LoadingSkeleton message="Loading dashboard..." />;
  }

  const summary = [
    {
      label: "Total Users",
      value: data?.totalUsers || users?.length || 0,
      icon: UsersIcon,
      gradient: "from-blue-500 to-blue-600",
      text: "text-blue-600",
    },
    {
      label: "Total Elders",
      value: data?.totalElders || elders?.length || 0,
      icon: Activity,
      gradient: "from-purple-500 to-purple-600",
      text: "text-purple-600",
    },
    {
      label: "Active Devices",
      value: `${data?.activeDevices || 0} / ${data?.totalDevices || 0}`,
      icon: Smartphone,
      gradient: "from-green-500 to-green-600",
      text: "text-green-600",
    },
  ];

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-linear-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-2">
            Dashboard Overview
          </h1>
          <p className="text-gray-500">
            Real-time system monitoring and summary
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {summary.map((item, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all"
            >
              <div className="flex items-center justify-between mb-4">
                <div
                  className={`p-2.5 rounded-xl bg-linear-to-br ${item.gradient} shadow-lg`}
                >
                  <item.icon size={20} className="text-white" />
                </div>
              </div>
              <p className="text-sm text-gray-500 mb-1">{item.label}</p>
              <p className={`text-3xl font-bold ${item.text}`}>{item.value}</p>
            </div>
          ))}
        </div>

        {/* Users Section */}
        <div className="mb-8">
          <div className="mb-4">
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
                    </td>
                    <td className="px-6 py-4 text-gray-600">{user.email}</td>
                    <td className="px-6 py-4">
                      <StatusBadge status={user.role} />
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={user.isActive ? "Active" : "Inactive"} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Elders Section */}
        <div>
          <div className="mb-4">
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
                      <p className="font-semibold text-gray-900">
                        {elder.firstName} {elder.lastName}
                      </p>
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
                      <StatusBadge status={elder.gender} />
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
                      <StatusBadge status={elder.isActive ? "Active" : "Inactive"} />
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
