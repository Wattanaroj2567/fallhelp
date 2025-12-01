import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Users() {
    const { user: currentUser } = useAuth();
    const { data: users, isLoading: usersLoading } = useQuery({
        queryKey: ['users'],
        queryFn: async () => {
            const response = await api.get('/admin/users');
            return response.data.data;
        },
    });

    const { data: elders, isLoading: eldersLoading } = useQuery({
        queryKey: ['elders'],
        queryFn: async () => {
            const response = await api.get('/admin/elders');
            return response.data.data;
        },
    });

    if (usersLoading || eldersLoading) return <div className="text-center py-10">Loading data...</div>;

    return (
        <div className="space-y-8">
            {/* Users Section */}
            <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">Registered Users</h2>
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4 font-medium text-gray-500">Name</th>
                                <th className="px-6 py-4 font-medium text-gray-500">Email</th>
                                <th className="px-6 py-4 font-medium text-gray-500">Role</th>
                                <th className="px-6 py-4 font-medium text-gray-500">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {users?.map((user: any) => (
                                <tr key={user.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 font-medium text-gray-900 flex items-center">
                                        {user.firstName} {user.lastName}
                                        {currentUser?.id === user.id && (
                                            <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-800 text-xs font-semibold rounded-full border border-green-200">
                                                You
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-gray-600">{user.email}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${user.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                            {user.isActive ? 'Active' : 'Inactive'}
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
                <h2 className="text-xl font-bold text-gray-900 mb-4">Elders</h2>
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4 font-medium text-gray-500">Name</th>
                                <th className="px-6 py-4 font-medium text-gray-500">Caregiver</th>
                                <th className="px-6 py-4 font-medium text-gray-500">Gender</th>
                                <th className="px-6 py-4 font-medium text-gray-500">Date of Birth</th>
                                <th className="px-6 py-4 font-medium text-gray-500">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {elders?.map((elder: any) => (
                                <tr key={elder.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 font-medium text-gray-900">{elder.firstName} {elder.lastName}</td>
                                    <td className="px-6 py-4 text-gray-600">
                                        {elder.caregivers && elder.caregivers.length > 0 ? (
                                            <div className="flex flex-col">
                                                {elder.caregivers.map((access: any) => (
                                                    <span key={access.user.id} className="text-sm">
                                                        {access.user.firstName} {access.user.lastName}
                                                    </span>
                                                ))}
                                            </div>
                                        ) : (
                                            <span className="text-gray-400 italic">No caregiver</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-gray-600">{elder.gender}</td>
                                    <td className="px-6 py-4 text-gray-600">{new Date(elder.dateOfBirth).toLocaleDateString()}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${elder.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                            {elder.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
