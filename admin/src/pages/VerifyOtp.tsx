import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import api from '../services/api';
import { KeyRound, ArrowLeft, RotateCcw } from 'lucide-react';

export default function VerifyOtp() {
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [resending, setResending] = useState(false);
    const [countdown, setCountdown] = useState(60);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    const navigate = useNavigate();
    const location = useLocation();
    const email = (location.state as { email?: string })?.email;

    // Redirect if no email
    useEffect(() => {
        if (!email) {
            navigate('/forgot-password');
        }
    }, [email, navigate]);

    // Countdown timer
    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [countdown]);

    const handleChange = (index: number, value: string) => {
        if (!/^\d*$/.test(value)) return; // Only allow numbers

        const newOtp = [...otp];
        newOtp[index] = value.slice(-1); // Only take last character
        setOtp(newOtp);

        // Auto-focus next input
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
        // Handle backspace
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pasteData = e.clipboardData.getData('text').slice(0, 6);
        if (!/^\d+$/.test(pasteData)) return;

        const newOtp = [...otp];
        pasteData.split('').forEach((char, index) => {
            if (index < 6) newOtp[index] = char;
        });
        setOtp(newOtp);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        const code = otp.join('');
        if (code.length !== 6) {
            setError('กรุณากรอกรหัส OTP ให้ครบ 6 หลัก');
            return;
        }

        setLoading(true);

        try {
            const response = await api.post('/auth/verify-otp', {
                email,
                code,
                purpose: 'PASSWORD_RESET'
            });

            if (response.data.data.valid) {
                navigate('/reset-password', { state: { email, code } });
            } else {
                setError(response.data.data.message || 'รหัส OTP ไม่ถูกต้อง');
            }
        } catch (err) {
            const error = err as { response?: { data?: { error?: string; message?: string } } };
            setError(error.response?.data?.error || error.response?.data?.message || 'Failed to verify OTP');
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        if (countdown > 0 || resending) return;

        setResending(true);
        setError('');

        try {
            await api.post('/auth/admin/request-otp', {
                email,
                purpose: 'PASSWORD_RESET'
            });
            setCountdown(60);
            setOtp(['', '', '', '', '', '']);
        } catch (err) {
            const error = err as { response?: { data?: { error?: string; message?: string } } };
            setError(error.response?.data?.error || error.response?.data?.message || 'Failed to resend OTP');
        } finally {
            setResending(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
            <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <KeyRound className="text-primary" size={32} />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 font-kanit">ยืนยันรหัส OTP</h1>
                    <p className="text-gray-500 mt-2">
                        เราได้ส่งรหัส 6 หลักไปที่
                        <br />
                        <span className="font-medium text-gray-700">{email}</span>
                    </p>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="flex justify-center gap-2">
                        {otp.map((digit, index) => (
                            <input
                                key={index}
                                ref={(el) => { inputRefs.current[index] = el; }}
                                type="text"
                                inputMode="numeric"
                                maxLength={1}
                                value={digit}
                                onChange={(e) => handleChange(index, e.target.value)}
                                onKeyDown={(e) => handleKeyDown(index, e)}
                                onPaste={index === 0 ? handlePaste : undefined}
                                className="w-12 h-14 text-center text-2xl font-bold border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                            />
                        ))}
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'กำลังตรวจสอบ...' : 'ยืนยัน'}
                    </button>

                    <div className="text-center space-y-3">
                        <button
                            type="button"
                            onClick={handleResend}
                            disabled={countdown > 0 || resending}
                            className="text-sm text-primary hover:underline inline-flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <RotateCcw size={14} />
                            {countdown > 0 ? `ส่งรหัสใหม่อีกครั้ง (${countdown}s)` : 'ส่งรหัสใหม่'}
                        </button>

                        <div>
                            <Link to="/forgot-password" className="text-sm text-gray-500 hover:text-gray-700 inline-flex items-center gap-1">
                                <ArrowLeft size={16} />
                                เปลี่ยนอีเมล
                            </Link>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
