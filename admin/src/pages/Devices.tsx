import React, { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import {
  Plus,
  Trash2,
  QrCode,
  Unplug,
  Smartphone,
  Activity,
  Link,
} from "lucide-react";
import {
  useAdminDevices,
  useCreateDevice,
  useDeleteDevice,
  useUnpairDevice,
} from "../hooks/useAdminDevices";
import { LoadingSkeleton } from "../components/LoadingSkeleton";
import { StatusBadge } from "../components/StatusBadge";
import { EmptyState } from "../components/EmptyState";
import type { Device, CreateDevicePayload } from "../types";

export default function Devices() {
  const [showModal, setShowModal] = useState(false);
  const [newDevice, setNewDevice] = useState<CreateDevicePayload>({
    serialNumber: "",
    firmwareVersion: "1.0.0",
  });
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [unpairId, setUnpairId] = useState<string | null>(null);

  const { data: devices, isLoading } = useAdminDevices();
  const createMutation = useCreateDevice();
  const deleteMutation = useDeleteDevice();
  const unpairMutation = useUnpairDevice();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(newDevice, {
      onSuccess: () => {
        setShowModal(false);
        setNewDevice({ serialNumber: "", firmwareVersion: "1.0.0" });
      },
    });
  };

  const handleDelete = () => {
    if (deleteId) {
      deleteMutation.mutate(deleteId, {
        onSuccess: () => setDeleteId(null),
        onError: (error: unknown) => {
          const err = error as { response?: { data?: { message?: string } } };
          alert(err.response?.data?.message || "ลบอุปกรณ์ไม่สำเร็จ");
        },
      });
    }
  };

  const handleUnpair = () => {
    if (unpairId) {
      unpairMutation.mutate(unpairId, {
        onSuccess: () => setUnpairId(null),
        onError: (error: unknown) => {
          const err = error as { response?: { data?: { message?: string } } };
          alert(
            err.response?.data?.message || "ยกเลิกการจับคู่อุปกรณ์ไม่สำเร็จ"
          );
        },
      });
    }
  };

  if (isLoading) {
    return <LoadingSkeleton message="กำลังโหลดอุปกรณ์..." color="green" />;
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-50/50 to-emerald-50/20 dark:from-gray-900 dark:via-gray-900/50 dark:to-emerald-900/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent">
                จัดการอุปกรณ์
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                ลงทะเบียน ตรวจสอบสถานะ และจัดการอุปกรณ์ทั้งหมดในระบบ
              </p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="bg-green-600 text-white px-6 py-3 rounded-xl flex items-center gap-2 hover:bg-green-700 transition-all shadow-lg hover:shadow-xl"
            >
              <Plus size={20} />
              <span className="font-semibold">ลงทะเบียนอุปกรณ์</span>
            </button>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                    อุปกรณ์ทั้งหมด
                  </p>
                  <p className="text-3xl font-bold text-gray-700 dark:text-gray-200">
                    {devices?.length || 0}
                  </p>
                </div>
                <div className="p-2.5 bg-gradient-to-br from-slate-500 to-slate-600 rounded-xl">
                  <Smartphone className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                    จับคู่แล้ว
                  </p>
                  <p className="text-3xl font-bold text-blue-600">
                    {devices?.filter((d) => d.status === "PAIRED").length || 0}
                  </p>
                </div>
                <div className="p-2.5 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl">
                  <Link className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                    ใช้งานอยู่
                  </p>
                  <p className="text-3xl font-bold text-green-600">
                    {devices?.filter((d) => d.status === "ACTIVE").length || 0}
                  </p>
                </div>
                <div className="p-2.5 bg-gradient-to-br from-green-500 to-green-600 rounded-xl">
                  <Activity className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                    ยังไม่จับคู่
                  </p>
                  <p className="text-3xl font-bold text-orange-600">
                    {devices?.filter((d) => d.status === "UNPAIRED").length ||
                      0}
                  </p>
                </div>
                <div className="p-2.5 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl">
                  <Unplug className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Devices Table */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-gray-50 to-green-50 dark:from-gray-700 dark:to-gray-700 border-b border-gray-200 dark:border-gray-600">
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    หมายเลขอุปกรณ์
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    รหัสอุปกรณ์
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    สถานะ
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    จัดการ
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {devices?.map((device) => (
                  <tr
                    key={device.id}
                    className="hover:bg-green-50/50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <span className="font-semibold text-gray-900 dark:text-gray-100">
                        {device.serialNumber}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <code className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm font-mono text-gray-700 dark:text-gray-300">
                        {device.deviceCode}
                      </code>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={device.status} variant="device" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedDevice(device)}
                          className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                          title="ดู QR Code"
                        >
                          <QrCode size={18} />
                        </button>
                        {device.status === "PAIRED" && (
                          <button
                            onClick={() => setUnpairId(device.id)}
                            className="p-2 text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg transition-colors"
                            title="ยกเลิกการจับคู่"
                          >
                            <Unplug size={18} />
                          </button>
                        )}
                        <button
                          onClick={() => setDeleteId(device.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="ลบอุปกรณ์"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {devices?.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-12">
                      <EmptyState
                        icon={Smartphone}
                        title="No devices registered yet"
                        message="Register your first device to get started"
                      />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Register Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 w-full max-w-md shadow-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg">
                <Plus className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                ลงทะเบียนอุปกรณ์ใหม่
              </h2>
            </div>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  หมายเลขอุปกรณ์
                </label>
                <input
                  type="text"
                  required
                  value={newDevice.serialNumber}
                  onChange={(e) =>
                    setNewDevice({ ...newDevice, serialNumber: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
                  placeholder="SN-12345678"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  เวอร์ชันเฟิร์มแวร์
                </label>
                <input
                  type="text"
                  required
                  value={newDevice.firmwareVersion}
                  onChange={(e) =>
                    setNewDevice({
                      ...newDevice,
                      firmwareVersion: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
                  placeholder="1.0.0"
                />
              </div>
              <div className="flex justify-end gap-3 mt-8">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-6 py-3 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl font-medium transition-colors"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="px-6 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 disabled:opacity-50 transition-all shadow-lg"
                >
                  {createMutation.isPending
                    ? "กำลังลงทะเบียน..."
                    : "ลงทะเบียนอุปกรณ์"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QR Code Modal */}
      {selectedDevice && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 print:p-0 print:bg-white print:static print:block">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 w-full max-w-md text-center shadow-2xl print:shadow-none print:w-full print:max-w-none print:p-0">
            <div className="print-content">
              <div className="flex items-center justify-center gap-3 mb-4 print:mb-6">
                <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl print:hidden">
                  <QrCode className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 print:text-3xl">
                  QR Code อุปกรณ์
                </h2>
              </div>
              <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm print:hidden">
                สแกนรหัสนี้ด้วยแอปมือถือเพื่อจับคู่อุปกรณ์
              </p>

              <div className="flex justify-center mb-6 p-6 bg-gradient-to-br from-gray-50 to-green-50 dark:from-gray-700 dark:to-gray-700 rounded-2xl border-2 border-gray-200 dark:border-gray-600 print:border-gray-300 print:bg-white">
                <QRCodeSVG
                  value={selectedDevice.deviceCode}
                  size={220}
                  level="H"
                />
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-xl mb-6 print:bg-transparent print:border-2 print:border-gray-300">
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold mb-2">
                  รหัสอุปกรณ์
                </p>
                <p className="font-mono text-xl font-bold text-gray-900 dark:text-gray-100 tracking-wider">
                  {selectedDevice.deviceCode}
                </p>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-xl p-3 mb-4 print:hidden">
                <p className="text-xs text-blue-700 dark:text-blue-300 font-medium">
                  หมายเลข: {selectedDevice.serialNumber}
                </p>
              </div>
            </div>

            <div className="flex gap-3 print:hidden">
              <button
                onClick={() => window.print()}
                className="flex-1 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 font-semibold flex items-center justify-center gap-2 shadow-lg transition-all"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="6 9 6 2 18 2 18 9"></polyline>
                  <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
                  <rect x="6" y="14" width="12" height="8"></rect>
                </svg>
                <span>พิมพ์ป้าย</span>
              </button>
              <button
                onClick={() => setSelectedDevice(null)}
                className="flex-1 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 font-semibold transition-colors"
              >
                ปิด
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 w-full max-w-md shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                <Trash2 className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <h2 className="text-2xl font-bold text-red-600 dark:text-red-400">
                ลบอุปกรณ์?
              </h2>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
              คุณแน่ใจหรือไม่ว่าต้องการลบอุปกรณ์นี้?
              การกระทำนี้ไม่สามารถย้อนกลับได้และจะลบข้อมูลอุปกรณ์ทั้งหมดอย่างถาวร
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="px-6 py-3 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl font-medium transition-colors"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
                className="px-6 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 disabled:opacity-50 transition-all shadow-lg"
              >
                {deleteMutation.isPending ? "กำลังลบ..." : "ลบอุปกรณ์"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Unpair Confirmation Modal */}
      {unpairId && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 w-full max-w-md shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                <Unplug className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
              <h2 className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                ยกเลิกการจับคู่อุปกรณ์?
              </h2>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
              คุณแน่ใจหรือไม่ว่าต้องการยกเลิกการจับคู่อุปกรณ์นี้?
              การกระทำนี้จะยกเลิกการเชื่อมต่อกับผู้สูงอายุปัจจุบันและรีเซ็ตสถานะการจับคู่
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setUnpairId(null)}
                className="px-6 py-3 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl font-medium transition-colors"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleUnpair}
                disabled={unpairMutation.isPending}
                className="px-6 py-3 bg-orange-600 text-white rounded-xl font-semibold hover:bg-orange-700 disabled:opacity-50 transition-all shadow-lg"
              >
                {unpairMutation.isPending
                  ? "กำลังยกเลิก..."
                  : "ยกเลิกการจับคู่"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
