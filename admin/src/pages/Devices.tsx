import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../services/api";
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

interface Device {
  id: string;
  serialNumber: string;
  deviceCode: string;
  status: "ACTIVE" | "INACTIVE" | "MAINTENANCE" | "PAIRED" | "UNPAIRED";
  firmwareVersion: string;
  lastOnline: string | null;
  elder?: {
    firstName: string;
    lastName: string;
  };
}

export default function Devices() {
  const [showModal, setShowModal] = useState(false);
  const [newDevice, setNewDevice] = useState({
    serialNumber: "",
    firmwareVersion: "1.0.0",
  });
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);

  const queryClient = useQueryClient();

  const { data: devices, isLoading } = useQuery({
    queryKey: ["devices"],
    queryFn: async () => {
      const response = await api.get("/admin/devices");
      return response.data.data as Device[];
    },
    refetchInterval: 5000,
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof newDevice) => {
      return await api.post("/admin/devices", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["devices"] });
      setShowModal(false);
      setNewDevice({ serialNumber: "", firmwareVersion: "1.0.0" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(newDevice);
  };

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [unpairId, setUnpairId] = useState<string | null>(null);

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await api.delete(`/admin/devices/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["devices"] });
      setDeleteId(null);
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      alert(err.response?.data?.message || "Failed to delete device");
    },
  });

  const unpairMutation = useMutation({
    mutationFn: async (id: string) => {
      return await api.post(`/admin/devices/${id}/unpair`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["devices"] });
      setUnpairId(null);
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      alert(err.response?.data?.message || "Failed to unpair device");
    },
  });

  const handleDelete = () => {
    if (deleteId) {
      deleteMutation.mutate(deleteId);
    }
  };

  const handleUnpair = () => {
    if (unpairId) {
      unpairMutation.mutate(unpairId);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-100 text-green-800 border-green-200";
      case "INACTIVE":
        return "bg-gray-100 text-gray-800 border-gray-200";
      case "MAINTENANCE":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "PAIRED":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "UNPAIRED":
        return "bg-purple-100 text-purple-800 border-purple-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading devices...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-linear-to-br from-slate-50 via-green-50 to-emerald-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold bg-linear-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                Device Management
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Monitor and manage IoT devices
              </p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="bg-linear-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-xl flex items-center gap-2 hover:from-green-600 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl"
            >
              <Plus size={20} />
              <span className="font-semibold">Register Device</span>
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Total Devices</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {devices?.length || 0}
                  </p>
                </div>
                <div className="p-2.5 bg-linear-to-br from-gray-500 to-gray-600 rounded-xl">
                  <Smartphone className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Paired</p>
                  <p className="text-3xl font-bold text-blue-600">
                    {devices?.filter((d) => d.status === "PAIRED").length || 0}
                  </p>
                </div>
                <div className="p-2.5 bg-linear-to-br from-blue-500 to-blue-600 rounded-xl">
                  <Link className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Active</p>
                  <p className="text-3xl font-bold text-green-600">
                    {devices?.filter((d) => d.status === "ACTIVE").length || 0}
                  </p>
                </div>
                <div className="p-2.5 bg-linear-to-br from-green-500 to-green-600 rounded-xl">
                  <Activity className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Unpaired</p>
                  <p className="text-3xl font-bold text-purple-600">
                    {devices?.filter((d) => d.status === "UNPAIRED").length ||
                      0}
                  </p>
                </div>
                <div className="p-2.5 bg-linear-to-br from-purple-500 to-purple-600 rounded-xl">
                  <Unplug className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Devices Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-linear-to-r from-gray-50 to-green-50 border-b border-gray-200">
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Serial Number
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Device Code
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Assigned To
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {devices?.map((device) => (
                  <tr
                    key={device.id}
                    className="hover:bg-green-50/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <span className="font-semibold text-gray-900">
                        {device.serialNumber}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <code className="px-3 py-1 bg-gray-100 rounded-lg text-sm font-mono text-gray-700">
                        {device.deviceCode}
                      </code>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(
                          device.status
                        )}`}
                      >
                        {device.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {device.elder ? (
                        <span className="text-gray-700 font-medium">
                          {device.elder.firstName} {device.elder.lastName}
                        </span>
                      ) : (
                        <span className="text-gray-400 italic">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedDevice(device)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View QR Code"
                        >
                          <QrCode size={18} />
                        </button>
                        {device.status === "PAIRED" && (
                          <button
                            onClick={() => setUnpairId(device.id)}
                            className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                            title="Force Unpair"
                          >
                            <Unplug size={18} />
                          </button>
                        )}
                        <button
                          onClick={() => setDeleteId(device.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Device"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {devices?.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-12 text-center text-gray-500"
                    >
                      <div className="flex flex-col items-center gap-3">
                        <Smartphone className="w-12 h-12 text-gray-300" />
                        <p className="font-medium">No devices registered yet</p>
                        <p className="text-sm">
                          Register your first device to get started
                        </p>
                      </div>
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
          <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-linear-to-br from-green-500 to-emerald-600 rounded-lg">
                <Plus className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">
                Register New Device
              </h2>
            </div>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Serial Number
                </label>
                <input
                  type="text"
                  required
                  value={newDevice.serialNumber}
                  onChange={(e) =>
                    setNewDevice({ ...newDevice, serialNumber: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
                  placeholder="SN-12345678"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Firmware Version
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
                  placeholder="1.0.0"
                />
              </div>
              <div className="flex justify-end gap-3 mt-8">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-6 py-3 text-gray-600 hover:bg-gray-100 rounded-xl font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="px-6 py-3 bg-linear-to-r from-green-500 to-emerald-600 text-white rounded-xl font-semibold hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 transition-all shadow-lg"
                >
                  {createMutation.isPending
                    ? "Registering..."
                    : "Register Device"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QR Code Modal */}
      {selectedDevice && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 print:p-0 print:bg-white print:static print:block">
          <div className="bg-white rounded-2xl p-8 w-full max-w-md text-center shadow-2xl print:shadow-none print:w-full print:max-w-none print:p-0">
            <div className="print-content">
              <div className="flex items-center justify-center gap-3 mb-4 print:mb-6">
                <div className="p-3 bg-linear-to-br from-green-500 to-emerald-600 rounded-xl print:hidden">
                  <QrCode className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 print:text-3xl">
                  Device QR Code
                </h2>
              </div>
              <p className="text-gray-500 mb-6 text-sm print:hidden">
                Scan this code with the mobile app to pair the device.
              </p>

              <div className="flex justify-center mb-6 p-6 bg-linear-to-br from-gray-50 to-green-50 rounded-2xl border-2 border-gray-200 print:border-gray-300 print:bg-white">
                <QRCodeSVG
                  value={selectedDevice.deviceCode}
                  size={220}
                  level="H"
                />
              </div>

              <div className="bg-gray-50 p-4 rounded-xl mb-6 print:bg-transparent print:border-2 print:border-gray-300">
                <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-2">
                  Device Code
                </p>
                <p className="font-mono text-xl font-bold text-gray-900 tracking-wider">
                  {selectedDevice.deviceCode}
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 mb-6 print:hidden">
                <p className="text-xs text-blue-700 font-medium">
                  Serial: {selectedDevice.serialNumber}
                </p>
              </div>
            </div>

            <div className="flex gap-3 print:hidden">
              <button
                onClick={() => window.print()}
                className="flex-1 py-3 bg-linear-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 font-semibold flex items-center justify-center gap-2 shadow-lg transition-all"
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
                <span>Print Label</span>
              </button>
              <button
                onClick={() => setSelectedDevice(null)}
                className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 font-semibold transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-100 rounded-lg">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <h2 className="text-2xl font-bold text-red-600">
                Delete Device?
              </h2>
            </div>
            <p className="text-gray-600 mb-8 leading-relaxed">
              Are you sure you want to delete this device? This action cannot be
              undone and will permanently remove all device data.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="px-6 py-3 text-gray-600 hover:bg-gray-100 rounded-xl font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
                className="px-6 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 disabled:opacity-50 transition-all shadow-lg"
              >
                {deleteMutation.isPending ? "Deleting..." : "Delete Device"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Unpair Confirmation Modal */}
      {unpairId && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Unplug className="w-6 h-6 text-orange-600" />
              </div>
              <h2 className="text-2xl font-bold text-orange-600">
                Force Unpair Device?
              </h2>
            </div>
            <p className="text-gray-600 mb-8 leading-relaxed">
              Are you sure you want to force unpair this device? This will
              disconnect it from the current elder and reset its pairing status.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setUnpairId(null)}
                className="px-6 py-3 text-gray-600 hover:bg-gray-100 rounded-xl font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUnpair}
                disabled={unpairMutation.isPending}
                className="px-6 py-3 bg-orange-600 text-white rounded-xl font-semibold hover:bg-orange-700 disabled:opacity-50 transition-all shadow-lg"
              >
                {unpairMutation.isPending ? "Unpairing..." : "Force Unpair"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
