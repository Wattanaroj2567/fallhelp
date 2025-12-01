import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import { MessageSquare, CheckCircle, Clock, Loader2 } from 'lucide-react';

interface Feedback {
    id: string;
    message: string;
    status: 'PENDING' | 'REVIEWED' | 'RESOLVED';
    createdAt: string;
    user: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
        profileImage: string | null;
    } | null;
}

export default function Feedback() {
    const queryClient = useQueryClient();

    const { data: feedbacks, isLoading, isError } = useQuery({
        queryKey: ['feedbacks'],
        queryFn: async () => {
            const response = await api.get('/feedback');
            return response.data.data as Feedback[];
        },
    });

    const updateStatusMutation = useMutation({
        mutationFn: async ({ id, status }: { id: string; status: string }) => {
            await api.patch(`/feedback/${id}/status`, { status });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['feedbacks'] });
        },
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PENDING': return 'bg-yellow-100 text-yellow-800';
            case 'REVIEWED': return 'bg-blue-100 text-blue-800';
            case 'RESOLVED': return 'bg-green-100 text-green-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
                <p className="text-gray-500">Loading feedback...</p>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-red-500">
                <p>Failed to load feedback. Please try again later.</p>
            </div>
        );
    }

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <MessageSquare className="w-8 h-8 text-indigo-600" />
                    ความคิดเห็นจากผู้ใช้
                </h1>
            </div>

            <div className="bg-white shadow-sm rounded-xl overflow-hidden border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ผู้ส่ง</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ข้อความ</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">สถานะ</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">วันที่</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">จัดการ</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {feedbacks?.map((feedback) => (
                            <tr key={feedback.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                                            {feedback.user?.firstName?.[0] || '?'}
                                        </div>
                                        <div className="ml-4">
                                            <div className="text-sm font-medium text-gray-900">
                                                {feedback.user ? `${feedback.user.firstName} ${feedback.user.lastName}` : 'ไม่ระบุตัวตน'}
                                            </div>
                                            <div className="text-sm text-gray-500">{feedback.user?.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="text-sm text-gray-900 max-w-md break-words">{feedback.message}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(feedback.status)}`}>
                                        {feedback.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {new Date(feedback.createdAt).toLocaleString('th-TH')}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    {feedback.status === 'PENDING' && (
                                        <button
                                            onClick={() => updateStatusMutation.mutate({ id: feedback.id, status: 'REVIEWED' })}
                                            className="text-blue-600 hover:text-blue-900 mr-4"
                                            title="Mark as Reviewed"
                                        >
                                            <Clock className="w-5 h-5" />
                                        </button>
                                    )}
                                    {feedback.status !== 'RESOLVED' && (
                                        <button
                                            onClick={() => updateStatusMutation.mutate({ id: feedback.id, status: 'RESOLVED' })}
                                            className="text-green-600 hover:text-green-900"
                                            title="Mark as Resolved"
                                        >
                                            <CheckCircle className="w-5 h-5" />
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {feedbacks?.length === 0 && (
                    <div className="p-12 text-center text-gray-500 flex flex-col items-center">
                        <MessageSquare className="w-12 h-12 text-gray-300 mb-4" />
                        <p className="text-lg font-medium text-gray-900">ยังไม่มีความคิดเห็น</p>
                        <p className="text-sm text-gray-500">ความคิดเห็นจากผู้ใช้จะปรากฏที่นี่</p>
                    </div>
                )}
            </div>
        </div>
    );
}
