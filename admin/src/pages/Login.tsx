import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import { Lock, Mail, Eye, EyeOff } from "lucide-react";

export default function Login() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await api.post("/auth/login", { identifier, password });
      const { token, user } = response.data.data; // Note: api response structure might be data.data based on controller

      if (user.role !== "ADMIN") {
        setError("การเข้าถึงถูกปฏิเสธ ต้องใช้สิทธิ์ผู้ดูแลระบบ");
        setLoading(false);
        return;
      }

      login(token, user);
      navigate("/");
    } catch (err) {
      // Extract error message safely - handle both string and object formats
      let errorMessage = "เข้าสู่ระบบล้มเหลว";

      try {
        const error = err as {
          response?: {
            data?: {
              error?: string | { code?: string; message?: string };
              message?: string | { code?: string; message?: string };
            };
          };
        };

        const errorData = error.response?.data?.error;
        const messageData = error.response?.data?.message;

        // Try error object first
        if (typeof errorData === "string") {
          errorMessage = errorData;
        } else if (
          errorData &&
          typeof errorData === "object" &&
          errorData !== null &&
          !Array.isArray(errorData) &&
          "message" in errorData
        ) {
          // Extract message from error object
          const msg = errorData.message;
          if (typeof msg === "string" && msg.trim()) {
            errorMessage = msg;
          }
        }

        // Fallback to message field
        if (errorMessage === "เข้าสู่ระบบล้มเหลว") {
          if (typeof messageData === "string") {
            errorMessage = messageData;
          } else if (
            messageData &&
            typeof messageData === "object" &&
            messageData !== null &&
            !Array.isArray(messageData) &&
            "message" in messageData
          ) {
            const msg = messageData.message;
            if (typeof msg === "string" && msg.trim()) {
              errorMessage = msg;
            }
          }
        }
      } catch (parseError) {
        // If anything goes wrong, use default message
        console.warn("[Login] Error parsing error response:", parseError);
        errorMessage = "เข้าสู่ระบบล้มเหลว";
      }

      // Ensure errorMessage is always a string (never an object)
      // Double check to prevent any object from being set
      const finalMessage =
        typeof errorMessage === "string"
          ? errorMessage.trim() || "เข้าสู่ระบบล้มเหลว"
          : "เข้าสู่ระบบล้มเหลว";

      setError(finalMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 font-kanit">
            FallHelp แผงควบคุม
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            เข้าสู่ระบบเพื่อจัดการระบบ
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              อีเมล
            </label>
            <div className="relative">
              <Mail
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500"
                size={20}
              />
              <input
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              รหัสผ่าน
            </label>
            <div className="relative">
              <Lock
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500"
                size={20}
              />
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-12 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
          </button>
        </form>
      </div>
    </div>
  );
}
