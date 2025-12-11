/**
 * FallHelp API Error Schema
 * Based on Resend's error schema pattern for consistency and user-friendliness
 * 
 * Pattern: { name, message, statusCode }
 * - name: snake_case error code for programmatic handling
 * - message: Thai user-friendly message for display
 * - statusCode: HTTP status code
 */

// ==========================================
// Error Types (snake_case for API responses)
// ==========================================
export type ErrorCode =
    // 400 - Bad Request
    | 'validation_error'
    | 'invalid_input'
    | 'missing_required_field'
    | 'invalid_email_format'
    | 'invalid_phone_format'
    | 'password_too_short'
    | 'password_mismatch'
    // 401 - Unauthorized
    | 'missing_token'
    | 'invalid_token'
    | 'session_expired'
    // 403 - Forbidden
    | 'access_denied'
    | 'role_not_allowed'
    | 'account_deactivated'
    // 404 - Not Found
    | 'user_not_found'
    | 'elder_not_found'
    | 'device_not_found'
    | 'otp_not_found'
    | 'resource_not_found'
    // 409 - Conflict
    | 'email_already_exists'
    | 'phone_already_exists'
    | 'user_already_member'
    | 'device_already_paired'
    // 422 - Unprocessable Entity
    | 'otp_expired'
    | 'otp_invalid'
    | 'otp_already_used'
    // 429 - Too Many Requests
    | 'rate_limit_exceeded'
    // 500 - Internal Server Error
    | 'internal_server_error'
    | 'email_send_failed'
    | 'database_error';

// ==========================================
// Error Messages (Thai, user-friendly)
// ==========================================
export const ErrorMessages: Record<ErrorCode, { th: string; en: string }> = {
    // 400 - Bad Request
    validation_error: {
        th: 'ข้อมูลไม่ถูกต้อง กรุณาตรวจสอบและลองใหม่อีกครั้ง',
        en: 'Invalid data. Please check and try again.',
    },
    invalid_input: {
        th: 'รูปแบบข้อมูลไม่ถูกต้อง',
        en: 'Invalid input format.',
    },
    missing_required_field: {
        th: 'กรุณากรอกข้อมูลให้ครบถ้วน',
        en: 'Please fill in all required fields.',
    },
    invalid_email_format: {
        th: 'รูปแบบอีเมลไม่ถูกต้อง',
        en: 'Invalid email format.',
    },
    invalid_phone_format: {
        th: 'รูปแบบเบอร์โทรศัพท์ไม่ถูกต้อง',
        en: 'Invalid phone number format.',
    },
    password_too_short: {
        th: 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร',
        en: 'Password must be at least 6 characters.',
    },
    password_mismatch: {
        th: 'รหัสผ่านไม่ตรงกัน',
        en: 'Passwords do not match.',
    },

    // 401 - Unauthorized
    missing_token: {
        th: 'กรุณาเข้าสู่ระบบก่อนใช้งาน',
        en: 'Please login to continue.',
    },
    invalid_token: {
        th: 'Token ไม่ถูกต้อง กรุณาเข้าสู่ระบบใหม่',
        en: 'Invalid token. Please login again.',
    },
    session_expired: {
        th: 'เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่',
        en: 'Session expired. Please login again.',
    },

    // 403 - Forbidden
    access_denied: {
        th: 'คุณไม่มีสิทธิ์เข้าถึงส่วนนี้',
        en: 'Access denied.',
    },
    role_not_allowed: {
        th: 'บัญชีประเภทนี้ไม่สามารถใช้ฟังก์ชันนี้ได้',
        en: 'This account type cannot use this function.',
    },
    account_deactivated: {
        th: 'บัญชีนี้ถูกระงับการใช้งาน กรุณาติดต่อผู้ดูแลระบบ',
        en: 'Account is deactivated. Please contact admin.',
    },

    // 404 - Not Found
    user_not_found: {
        th: 'ไม่พบผู้ใช้ในระบบ กรุณาตรวจสอบอีเมลอีกครั้ง',
        en: 'User not found. Please check your email.',
    },
    elder_not_found: {
        th: 'ไม่พบข้อมูลผู้สูงอายุ',
        en: 'Elder not found.',
    },
    device_not_found: {
        th: 'ไม่พบอุปกรณ์ในระบบ',
        en: 'Device not found.',
    },
    otp_not_found: {
        th: 'ไม่พบรหัส OTP หรือรหัสหมดอายุแล้ว',
        en: 'OTP not found or expired.',
    },
    resource_not_found: {
        th: 'ไม่พบข้อมูลที่ร้องขอ',
        en: 'Resource not found.',
    },

    // 409 - Conflict
    email_already_exists: {
        th: 'อีเมลนี้ถูกใช้งานแล้ว กรุณาใช้อีเมลอื่น',
        en: 'Email already exists. Please use another email.',
    },
    phone_already_exists: {
        th: 'เบอร์โทรศัพท์นี้ถูกใช้งานแล้ว',
        en: 'Phone number already exists.',
    },
    device_already_paired: {
        th: 'อุปกรณ์นี้ถูกเชื่อมต่อกับผู้ใช้อื่นแล้ว',
        en: 'Device is already paired with another user.',
    },
    user_already_member: {
        th: 'ผู้ใช้นี้เป็นสมาชิกของบ้านนี้อยู่แล้ว',
        en: 'User is already a member of this household.',
    },

    // 422 - Unprocessable Entity
    otp_expired: {
        th: 'รหัส OTP หมดอายุแล้ว กรุณาขอรหัสใหม่',
        en: 'OTP has expired. Please request a new one.',
    },
    otp_invalid: {
        th: 'รหัส OTP ไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง',
        en: 'Invalid OTP. Please check and try again.',
    },
    otp_already_used: {
        th: 'รหัส OTP นี้ถูกใช้งานแล้ว กรุณาขอรหัสใหม่',
        en: 'OTP has already been used. Please request a new one.',
    },

    // 429 - Too Many Requests
    rate_limit_exceeded: {
        th: 'คำขอมากเกินไป กรุณารอสักครู่แล้วลองใหม่',
        en: 'Too many requests. Please wait and try again.',
    },

    // 500 - Internal Server Error
    internal_server_error: {
        th: 'เกิดข้อผิดพลาดจากเซิร์ฟเวอร์ กรุณาลองใหม่อีกครั้ง',
        en: 'Server error. Please try again later.',
    },
    email_send_failed: {
        th: 'ไม่สามารถส่งอีเมลได้ กรุณาลองใหม่อีกครั้ง',
        en: 'Failed to send email. Please try again.',
    },
    database_error: {
        th: 'เกิดข้อผิดพลาดในการเข้าถึงฐานข้อมูล',
        en: 'Database error occurred.',
    },
};

// ==========================================
// Status Code Mapping
// ==========================================
export const ErrorStatusCodes: Record<ErrorCode, number> = {
    // 400
    validation_error: 400,
    invalid_input: 400,
    missing_required_field: 400,
    invalid_email_format: 400,
    invalid_phone_format: 400,
    password_too_short: 400,
    password_mismatch: 400,
    // 401
    missing_token: 401,
    invalid_token: 401,
    session_expired: 401,
    // 403
    access_denied: 403,
    role_not_allowed: 403,
    account_deactivated: 403,
    // 404
    user_not_found: 404,
    elder_not_found: 404,
    device_not_found: 404,
    otp_not_found: 404,
    resource_not_found: 404,
    // 409
    email_already_exists: 409,
    phone_already_exists: 409,
    device_already_paired: 409,
    user_already_member: 409,
    // 422
    otp_expired: 422,
    otp_invalid: 422,
    otp_already_used: 422,
    // 429
    rate_limit_exceeded: 429,
    // 500
    internal_server_error: 500,
    email_send_failed: 500,
    database_error: 500,
};

// ==========================================
// API Error Class
// ==========================================
export class ApiError extends Error {
    public readonly code: ErrorCode;
    public readonly statusCode: number;
    public readonly messageTh: string;
    public readonly messageEn: string;
    public readonly isOperational: boolean;

    constructor(code: ErrorCode, customMessage?: string) {
        const messages = ErrorMessages[code];
        const statusCode = ErrorStatusCodes[code];

        super(customMessage || messages.en);

        this.code = code;
        this.statusCode = statusCode;
        this.messageTh = customMessage || messages.th;
        this.messageEn = customMessage || messages.en;
        this.isOperational = true;

        Error.captureStackTrace(this, this.constructor);
    }

    /**
     * Convert to API response format
     */
    toResponse(lang: 'th' | 'en' = 'th') {
        return {
            success: false,
            error: {
                code: this.code,
                message: lang === 'th' ? this.messageTh : this.messageEn,
                statusCode: this.statusCode,
            },
        };
    }
}

// ==========================================
// Factory Functions
// ==========================================
export const createError = {
    // Auth errors
    userNotFound: () => new ApiError('user_not_found'),
    invalidCredentials: () => new ApiError('validation_error', 'อีเมลหรือรหัสผ่านไม่ถูกต้อง'),
    sessionExpired: () => new ApiError('session_expired'),
    accessDenied: () => new ApiError('access_denied'),
    roleNotAllowed: (role: string) => new ApiError('role_not_allowed', `บัญชีประเภท ${role} ไม่สามารถใช้ฟังก์ชันนี้ได้`),
    accountDeactivated: () => new ApiError('account_deactivated'),

    // OTP errors
    otpNotFound: () => new ApiError('otp_not_found'),
    otpExpired: () => new ApiError('otp_expired'),
    otpInvalid: () => new ApiError('otp_invalid'),

    // Conflict errors
    emailExists: () => new ApiError('email_already_exists'),
    deviceAlreadyPaired: () => new ApiError('device_already_paired'),

    // Server errors
    serverError: () => new ApiError('internal_server_error'),
    emailFailed: () => new ApiError('email_send_failed'),

    // Validation
    validationError: (message: string) => new ApiError('validation_error', message),
    missingField: (field: string) => new ApiError('missing_required_field', `กรุณากรอก ${field}`),
};
