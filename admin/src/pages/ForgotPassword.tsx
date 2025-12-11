import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { Mail, ArrowLeft } from 'lucide-react';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await api.post('/auth/admin/request-otp', {
                email,
                purpose: 'PASSWORD_RESET'
            });

            // Navigate to verify OTP page with email
            navigate('/verify-otp', { state: { email } });
        } catch (err) {
            const error = err as { response?: { data?: { error?: string; message?: string } } };
            const message = error.response?.data?.error || error.response?.data?.message || 'Failed to send OTP';

            // User-friendly messages
            if (message.includes('User not found')) {
                setError('ไม่พบอีเมลนี้ในระบบ กรุณาตรวจสอบอีเมลอีกครั้ง');
            } else if (message.includes('CAREGIVER') || message.includes('ผู้ดูแล')) {
                setError('บัญชีนี้ไม่ใช่บัญชีผู้ดูแลระบบ กรุณาใช้แอป Mobile แทน');
            } else {
                setError(message);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
            <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 font-kanit">ลืมรหัสผ่าน</h1>
                    <p className="text-gray-500 mt-2">กรอกอีเมลที่ใช้ลงทะเบียน เราจะส่งรหัส OTP ไปให้</p>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">อีเมล</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder=""
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'กำลังส่ง...' : 'ส่งรหัส OTP'}
                    </button>

                    <div className="text-center">
                        <Link to="/login" className="text-sm text-gray-500 hover:text-primary inline-flex items-center gap-1">
                            <ArrowLeft size={16} />
                            กลับไปหน้าเข้าสู่ระบบ
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
