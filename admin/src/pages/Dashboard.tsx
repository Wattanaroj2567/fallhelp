import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import { Users, Smartphone, AlertTriangle, Activity } from 'lucide-react';

export default function Dashboard() {
    const { data, isLoading, error } = useQuery({
        queryKey: ['dashboardStats'],
        queryFn: async () => {
            const response = await api.get('/admin/dashboard');
            return response.data.data;
        },
    });

    if (isLoading) return <div className="text-center py-10">Loading stats...</div>;
    if (error) return <div className="text-center py-10 text-red-500">Failed to load dashboard data</div>;

    const stats = [
        {
            label: 'Total Users',
            value: data.totalUsers,
            icon: Users,
            color: 'bg-blue-500',
        },
        {
            label: 'Total Elders',
            value: data.totalElders,
            icon: Activity,
            color: 'bg-purple-500',
        },
        {
            label: 'Active Devices',
            value: `${data.onlineDevices || 0} / ${data.totalDevices || 0}`,
            icon: Smartphone,
            color: 'bg-green-500',
        },
        {
            label: 'Active Alerts',
            value: data.activeAlerts || 0,
            icon: AlertTriangle,
            color: 'bg-red-500',
        },
    ];

    return (
        <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard Overview</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {stats.map((stat, index) => (
                    <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center">
                        <div className={`${stat.color} p-4 rounded-lg text-white mr-4`}>
                            <stat.icon size={24} />
                        </div>
                        <div>
                            <p className="text-gray-500 text-sm">{stat.label}</p>
                            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Recent Activity Placeholder */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Recent System Events</h2>
                <div className="text-gray-500 text-center py-8">
                    No recent events to display.
                </div>
            </div>
        </div>
    );
}
