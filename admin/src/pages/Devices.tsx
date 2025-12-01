import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import { QRCodeSVG } from 'qrcode.react';
import { Plus, Trash2, QrCode } from 'lucide-react';

interface Device {
    id: string;
    serialNumber: string;
    deviceCode: string;
    status: 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE' | 'PAIRED' | 'UNPAIRED';
    firmwareVersion: string;
    lastOnline: string | null;
    elder?: {
        firstName: string;
        lastName: string;
    };
}

export default function Devices() {
    const [showModal, setShowModal] = useState(false);
    const [newDevice, setNewDevice] = useState({ serialNumber: '', firmwareVersion: '1.0.0' });
    const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);

    const queryClient = useQueryClient();

    const { data: devices, isLoading } = useQuery({
        queryKey: ['devices'],
        queryFn: async () => {
            const response = await api.get('/admin/devices');
            return response.data.data as Device[];
        },
    });

    const createMutation = useMutation({
        mutationFn: async (data: typeof newDevice) => {
            return await api.post('/admin/devices', data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['devices'] });
            setShowModal(false);
            setNewDevice({ serialNumber: '', firmwareVersion: '1.0.0' });
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        createMutation.mutate(newDevice);
    };

    const [deleteId, setDeleteId] = useState<string | null>(null);

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            return await api.delete(`/admin/devices/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['devices'] });
            setDeleteId(null);
        },
        onError: (error: any) => {
            alert(error.response?.data?.message || 'Failed to delete device');
        }
    });

    const handleDelete = () => {
        if (deleteId) {
            deleteMutation.mutate(deleteId);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'ACTIVE': return 'bg-green-100 text-green-800';
            case 'INACTIVE': return 'bg-gray-100 text-gray-800';
            case 'MAINTENANCE': return 'bg-yellow-100 text-yellow-800';
            case 'PAIRED': return 'bg-blue-100 text-blue-800';
            case 'UNPAIRED': return 'bg-purple-100 text-purple-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    if (isLoading) return <div className="text-center py-10">Loading devices...</div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Device Management</h1>
                <button
                    onClick={() => setShowModal(true)}
                    className="bg-primary text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-green-600 transition-colors"
                >
                    <Plus size={20} />
                    <span>Register Device</span>
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-4 font-medium text-gray-500">Serial Number</th>
                            <th className="px-6 py-4 font-medium text-gray-500">Device Code</th>
                            <th className="px-6 py-4 font-medium text-gray-500">Status</th>
                            <th className="px-6 py-4 font-medium text-gray-500">Assigned To</th>
                            <th className="px-6 py-4 font-medium text-gray-500">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {devices?.map((device) => (
                            <tr key={device.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 font-medium text-gray-900">{device.serialNumber}</td>
                                <td className="px-6 py-4 font-mono text-sm text-gray-600">{device.deviceCode}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(device.status)}`}>
                                        {device.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-gray-600">
                                    {device.elder ? `${device.elder.firstName} ${device.elder.lastName}` : '-'}
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center space-x-4">
                                        <button
                                            onClick={() => setSelectedDevice(device)}
                                            className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 p-2 rounded-lg transition-colors"
                                            title="View QR Code"
                                        >
                                            <QrCode size={18} />
                                        </button>
                                        <button
                                            onClick={() => setDeleteId(device.id)}
                                            className="text-red-600 hover:text-red-800 hover:bg-red-50 p-2 rounded-lg transition-colors"
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
                                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                    No devices registered yet.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Register Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4">Register New Device</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Serial Number</label>
                                <input
                                    type="text"
                                    required
                                    value={newDevice.serialNumber}
                                    onChange={(e) => setNewDevice({ ...newDevice, serialNumber: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                                    placeholder="SN-12345678"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Firmware Version</label>
                                <input
                                    type="text"
                                    required
                                    value={newDevice.firmwareVersion}
                                    onChange={(e) => setNewDevice({ ...newDevice, firmwareVersion: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                                    placeholder="1.0.0"
                                />
                            </div>
                            <div className="flex justify-end space-x-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={createMutation.isPending}
                                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
                                >
                                    {createMutation.isPending ? 'Registering...' : 'Register'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* QR Code Modal */}
            {selectedDevice && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 print:p-0 print:bg-white print:static print:block">
                    <div className="bg-white rounded-xl p-8 w-full max-w-sm text-center print:shadow-none print:w-full print:max-w-none print:p-0">
                        <div className="print-content">
                            <h2 className="text-xl font-bold mb-2 print:text-2xl print:mb-4">Device QR Code</h2>
                            <p className="text-gray-500 mb-6 text-sm print:hidden">Scan this code with the mobile app to pair.</p>

                            <div className="flex justify-center mb-6 p-4 bg-white rounded-xl border-2 border-gray-100 shadow-sm print:border-0 print:shadow-none print:mb-4">
                                <QRCodeSVG value={selectedDevice.deviceCode} size={200} level="H" />
                            </div>

                            <div className="bg-gray-50 p-3 rounded-lg mb-6 print:bg-transparent print:border print:border-gray-200">
                                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Device Code</p>
                                <p className="font-mono text-lg font-bold text-gray-900 tracking-wider">{selectedDevice.deviceCode}</p>
                            </div>
                        </div>

                        <div className="flex space-x-3 print:hidden">
                            <button
                                onClick={() => window.print()}
                                className="flex-1 py-2 bg-primary text-white rounded-lg hover:bg-green-600 font-medium flex items-center justify-center space-x-2"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
                                <span>Print Label</span>
                            </button>
                            <button
                                onClick={() => setSelectedDevice(null)}
                                className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteId && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-sm">
                        <h2 className="text-xl font-bold mb-2 text-red-600">Delete Device?</h2>
                        <p className="text-gray-600 mb-6">
                            Are you sure you want to delete this device? This action cannot be undone.
                        </p>
                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={() => setDeleteId(null)}
                                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={deleteMutation.isPending}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                            >
                                {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
