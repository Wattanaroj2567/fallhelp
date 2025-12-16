import { useAuth } from "../context/AuthContext";
import { Users as UsersIcon, Smartphone, UserCircle } from "lucide-react";
import { useAdminDashboard } from "../hooks/useAdminDashboard";
import { useAdminUsers } from "../hooks/useAdminUsers";
import { useAdminElders } from "../hooks/useAdminElders";
import { LoadingSkeleton } from "../components/LoadingSkeleton";
import { StatusBadge } from "../components/StatusBadge";
import type { User, Elder, CaregiverAccess } from "../types";

export default function Dashboard() {
  const { user: currentUser } = useAuth();

  const { data, isLoading: dashboardLoading } = useAdminDashboard();
  const { data: users, isLoading: usersLoading } = useAdminUsers();
  const { data: elders, isLoading: eldersLoading } = useAdminElders();

  if (dashboardLoading || usersLoading || eldersLoading) {
    return <LoadingSkeleton message="กำลังโหลดแดชบอร์ด..." />;
  }

  const summary = [
    {
      label: "ผู้ใช้ทั้งหมด",
      value: data?.totalUsers || users?.length || 0,
      icon: UsersIcon,
      gradient: "from-blue-500 to-blue-600",
      text: "text-blue-600",
      bgColor: "bg-blue-600",
    },
    {
      label: "ผู้สูงอายุทั้งหมด",
      value: data?.totalElders || elders?.length || 0,
      icon: UserCircle,
      gradient: "from-amber-500 to-orange-600",
      text: "text-amber-600",
      bgColor: "bg-amber-600",
    },
    {
      label: "อุปกรณ์ที่ใช้งาน",
      value: `${data?.activeDevices || 0} / ${data?.totalDevices || 0}`,
      icon: Smartphone,
      gradient: "from-green-500 to-green-600",
      text: "text-green-600",
      bgColor: "bg-green-600",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-50/50 to-slate-50/30 dark:from-gray-900 dark:via-gray-900/50 dark:to-gray-800/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent mb-2">
            แดชบอร์ด
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            ภาพรวมข้อมูลผู้ใช้ อุปกรณ์ และผู้สูงอายุในระบบ
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {summary.map((item, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 hover:shadow-md transition-all"
            >
              <div className="flex items-center justify-between mb-4">
                <div
                  className={`p-2.5 rounded-xl bg-gradient-to-br ${item.gradient} shadow-lg`}
                >
                  <item.icon size={24} className="text-white" />
                </div>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                {item.label}
              </p>
              <p className={`text-3xl font-bold ${item.text}`}>{item.value}</p>
            </div>
          ))}
        </div>

        {/* Users Section */}
        <div className="mb-8">
          <div className="mb-4">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent">
              ผู้ใช้ที่ลงทะเบียน
            </h2>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-700 dark:to-gray-700 border-b border-gray-200 dark:border-gray-600">
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    ชื่อ
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    อีเมล
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    บทบาท
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {users
                  ?.filter((user: User) => user.role !== "ADMIN")
                  .map((user: User) => (
                    <tr
                      key={user.id}
                      className="hover:bg-blue-50/50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-gray-100">
                            {user.firstName} {user.lastName}
                          </p>
                          {currentUser?.id === user.id && (
                            <span className="inline-block mt-0.5 px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs font-semibold rounded-full">
                              คุณ
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                        {user.email}
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge
                          status={
                            user.role === "CAREGIVER" && user.caregiverType
                              ? `CAREGIVER_${user.caregiverType}`
                              : user.role
                          }
                        />
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
            <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent">
              ผู้สูงอายุ
            </h2>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-gray-50 to-purple-50 dark:from-gray-700 dark:to-gray-700 border-b border-gray-200 dark:border-gray-600">
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    ชื่อ
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    ผู้ดูแล
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    อุปกรณ์
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    สถานะอุปกรณ์
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {elders?.map((elder: Elder) => (
                  <tr
                    key={elder.id}
                    className="hover:bg-purple-50/50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <p className="font-semibold text-gray-900 dark:text-gray-100">
                        {elder.firstName} {elder.lastName}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      {elder.caregivers && elder.caregivers.length > 0 ? (
                        <div className="flex flex-col gap-2">
                          {elder.caregivers
                            .filter(
                              (access: CaregiverAccess) =>
                                access.accessLevel === "OWNER"
                            )
                            .map((access: CaregiverAccess) => (
                              <div
                                key={access.user.id}
                                className="flex items-center gap-2"
                              >
                                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                  {access.user.firstName} {access.user.lastName}
                                </span>
                                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300">
                                  ญาติผู้ดูแลหลัก
                                </span>
                              </div>
                            ))}
                          {elder.caregivers
                            .filter(
                              (access: CaregiverAccess) =>
                                access.accessLevel !== "OWNER"
                            )
                            .map((access: CaregiverAccess) => (
                              <div
                                key={access.user.id}
                                className="flex items-center gap-2"
                              >
                                <span className="text-sm text-gray-700 dark:text-gray-300">
                                  {access.user.firstName} {access.user.lastName}
                                </span>
                                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                                  ญาติผู้ดูแลร่วม
                                </span>
                              </div>
                            ))}
                        </div>
                      ) : (
                        <span className="text-gray-400 dark:text-gray-500 italic text-sm">
                          ไม่มีผู้ดูแล
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {elder.device ? (
                        <div className="flex items-center gap-2">
                          <Smartphone className="w-4 h-4 text-green-600 dark:text-green-400" />
                          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {elder.device.deviceCode}
                          </span>
                        </div>
                      ) : (
                        <span className="text-gray-400 dark:text-gray-500 italic text-sm">
                          ไม่มีอุปกรณ์
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {elder.device ? (
                        <StatusBadge
                          status={elder.device.status || "INACTIVE"}
                          variant="device"
                        />
                      ) : (
                        <span className="text-gray-400 dark:text-gray-500 italic text-sm">
                          -
                        </span>
                      )}
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
