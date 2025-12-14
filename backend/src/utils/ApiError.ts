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
    | 'invalid_push_token'
    // 401 - Unauthorized
    | 'missing_token'
    | 'invalid_token'
    | 'session_expired'
    | 'invalid_credentials'
    | 'current_password_incorrect'
    // 403 - Forbidden
    | 'access_denied'
    | 'role_not_allowed'
    | 'account_deactivated'
    | 'owner_only'
    | 'editor_required'
    | 'cannot_update_self'
    | 'cannot_remove_self'
    | 'cannot_modify_owner'
    // 404 - Not Found
    | 'user_not_found'
    | 'elder_not_found'
    | 'device_not_found'
    | 'device_not_paired'
    | 'otp_not_found'
    | 'resource_not_found'
    | 'event_not_found'
    | 'notification_not_found'
    | 'member_not_found'
    // 409 - Conflict
    | 'email_already_exists'
    | 'phone_already_exists'
    | 'user_already_member'
    | 'device_already_paired'
    | 'event_already_cancelled'
    // 422 - Unprocessable Entity
    | 'otp_expired'
    | 'otp_invalid'
    | 'otp_already_used'
    | 'cancel_time_expired'
    | 'invalid_event_type'
    | 'invalid_access_level'
    // 429 - Too Many Requests
    | 'rate_limit_exceeded'
    // 500 - Internal Server Error
    | 'internal_server_error'
    | 'email_send_failed'
    | 'database_error'
    | 'qrcode_generation_failed';

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
    invalid_push_token: {
        th: 'รูปแบบ Push Token ไม่ถูกต้อง',
        en: 'Invalid Push Token format.',
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
    invalid_credentials: {
        th: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง',
        en: 'Invalid email or password.',
    },
    current_password_incorrect: {
        th: 'รหัสผ่านปัจจุบันไม่ถูกต้อง',
        en: 'Current password is incorrect.',
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
    owner_only: {
        th: 'เฉพาะเจ้าของเท่านั้นที่สามารถทำได้',
        en: 'Only owner can perform this action.',
    },
    editor_required: {
        th: 'ต้องมีสิทธิ์แก้ไขขึ้นไปเพื่อทำรายการนี้',
        en: 'Editor or higher access required.',
    },
    cannot_update_self: {
        th: 'ไม่สามารถแก้ไขสิทธิ์ของตัวเองได้',
        en: 'Cannot update your own access level.',
    },
    cannot_remove_self: {
        th: 'ไม่สามารถลบตัวเองออกได้',
        en: 'Cannot remove yourself.',
    },
    cannot_modify_owner: {
        th: 'ไม่สามารถแก้ไขหรือลบเจ้าของได้',
        en: 'Cannot modify or remove owner.',
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
    device_not_paired: {
        th: 'อุปกรณ์ยังไม่ได้จับคู่กับผู้สูงอายุ',
        en: 'Device is not paired.',
    },
    otp_not_found: {
        th: 'ไม่พบรหัส OTP หรือรหัสหมดอายุแล้ว',
        en: 'OTP not found or expired.',
    },
    resource_not_found: {
        th: 'ไม่พบข้อมูลที่ร้องขอ',
        en: 'Resource not found.',
    },
    event_not_found: {
        th: 'ไม่พบเหตุการณ์ที่ระบุ',
        en: 'Event not found.',
    },
    notification_not_found: {
        th: 'ไม่พบการแจ้งเตือน',
        en: 'Notification not found.',
    },
    member_not_found: {
        th: 'ไม่พบสมาชิกที่ระบุ',
        en: 'Member not found.',
    },

    // 409 - Conflict
    email_already_exists: {
        th: 'อีเมลนี้ถูกใช้งานแล้ว กรุณาใช้อีเมลอื่น',
        en: 'Email already exists. Please use another email.',
    },
    phone_already_exists: {
        th: 'เบอร์โทรศัพท์นี้ถูกใช้งานแล้ว กรุณาใช้หมายเลขอื่น',
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
    event_already_cancelled: {
        th: 'เหตุการณ์นี้ถูกยกเลิกไปแล้ว',
        en: 'Event has already been cancelled.',
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
    cancel_time_expired: {
        th: 'หมดเวลายกเลิกแล้ว (30 วินาที)',
        en: 'Cancel time window expired (30 seconds).',
    },
    invalid_event_type: {
        th: 'ประเภทเหตุการณ์ไม่รองรับการดำเนินการนี้',
        en: 'This event type does not support this action.',
    },
    invalid_access_level: {
        th: 'ระดับสิทธิ์ที่ระบุไม่ถูกต้อง',
        en: 'Invalid access level specified.',
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
    qrcode_generation_failed: {
        th: 'ไม่สามารถสร้าง QR Code ได้',
        en: 'Failed to generate QR code.',
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
    invalid_push_token: 400,
    // 401
    missing_token: 401,
    invalid_token: 401,
    session_expired: 401,
    invalid_credentials: 401,
    current_password_incorrect: 401,
    // 403
    access_denied: 403,
    role_not_allowed: 403,
    account_deactivated: 403,
    owner_only: 403,
    editor_required: 403,
    cannot_update_self: 403,
    cannot_remove_self: 403,
    cannot_modify_owner: 403,
    // 404
    user_not_found: 404,
    elder_not_found: 404,
    device_not_found: 404,
    device_not_paired: 404,
    otp_not_found: 404,
    resource_not_found: 404,
    event_not_found: 404,
    notification_not_found: 404,
    member_not_found: 404,
    // 409
    email_already_exists: 409,
    phone_already_exists: 409,
    device_already_paired: 409,
    user_already_member: 409,
    event_already_cancelled: 409,
    // 422
    otp_expired: 422,
    otp_invalid: 422,
    otp_already_used: 422,
    cancel_time_expired: 422,
    invalid_event_type: 422,
    invalid_access_level: 422,
    // 429
    rate_limit_exceeded: 429,
    // 500
    internal_server_error: 500,
    email_send_failed: 500,
    database_error: 500,
    qrcode_generation_failed: 500,
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
    invalidToken: () => new ApiError('invalid_token'),
    invalidCredentials: () => new ApiError('invalid_credentials'),
    sessionExpired: () => new ApiError('session_expired'),
    accessDenied: () => new ApiError('access_denied'),
    roleNotAllowed: (role: string) => new ApiError('role_not_allowed', `บัญชีประเภท ${role} ไม่สามารถใช้ฟังก์ชันนี้ได้`),
    accountDeactivated: () => new ApiError('account_deactivated'),
    currentPasswordIncorrect: () => new ApiError('current_password_incorrect'),

    // OTP errors
    otpNotFound: () => new ApiError('otp_not_found'),
    otpExpired: () => new ApiError('otp_expired'),
    otpInvalid: () => new ApiError('otp_invalid'),

    // Elder/Member errors
    elderNotFound: () => new ApiError('elder_not_found'),
    memberNotFound: () => new ApiError('member_not_found'),
    ownerOnly: () => new ApiError('owner_only'),
    editorRequired: () => new ApiError('editor_required'),
    cannotUpdateSelf: () => new ApiError('cannot_update_self'),
    cannotRemoveSelf: () => new ApiError('cannot_remove_self'),
    cannotModifyOwner: () => new ApiError('cannot_modify_owner'),
    userAlreadyMember: () => new ApiError('user_already_member'),
    invalidAccessLevel: () => new ApiError('invalid_access_level'),

    // Device errors
    deviceNotFound: () => new ApiError('device_not_found'),
    deviceNotPaired: () => new ApiError('device_not_paired'),
    deviceAlreadyPaired: () => new ApiError('device_already_paired'),

    // Event errors
    eventNotFound: () => new ApiError('event_not_found'),
    eventAlreadyCancelled: () => new ApiError('event_already_cancelled'),
    cancelTimeExpired: () => new ApiError('cancel_time_expired'),
    invalidEventType: () => new ApiError('invalid_event_type'),

    // Notification errors
    notificationNotFound: () => new ApiError('notification_not_found'),

    // Generic Not Found
    resourceNotFound: () => new ApiError('resource_not_found'),

    // Conflict errors
    emailExists: () => new ApiError('email_already_exists'),
    phoneExists: () => new ApiError('phone_already_exists'),

    // Server errors
    serverError: () => new ApiError('internal_server_error'),
    emailFailed: () => new ApiError('email_send_failed'),
    qrcodeGenerationFailed: () => new ApiError('qrcode_generation_failed'),

    // Validation
    validationError: (message: string) => new ApiError('validation_error', message),
    missingField: (field: string) => new ApiError('missing_required_field', `กรุณากรอก ${field}`),
    invalidPushToken: () => new ApiError('invalid_push_token'),
};
