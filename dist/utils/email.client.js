"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendResetPasswordOtpEmail = exports.sendRegisterOtpEmail = void 0;
const nodemailer = require("nodemailer");
let cachedTransporter = null;
const getTransporter = () => {
    if (cachedTransporter)
        return cachedTransporter;
    const smtpHost = process.env.SMTP_HOST;
    const smtpPortRaw = process.env.SMTP_PORT;
    const smtpUser = process.env.SMTP_USER;
    const smtpPassRaw = process.env.SMTP_PASS;
    const smtpPass = typeof smtpPassRaw === "string"
        ? smtpPassRaw.replace(/\s+/g, "")
        : smtpPassRaw;
    const shouldDebug = process.env.NODE_ENV !== "production" && process.env.EMAIL_DEBUG === "true";
    if (smtpHost && smtpPortRaw && smtpUser && smtpPass) {
        const smtpPort = Number(smtpPortRaw);
        if (!Number.isFinite(smtpPort) || smtpPort <= 0) {
            throw new Error("Invalid SMTP_PORT");
        }
        cachedTransporter = nodemailer.createTransport({
            host: smtpHost,
            port: smtpPort,
            secure: smtpPort === 465,
            logger: shouldDebug,
            debug: shouldDebug,
            auth: {
                user: smtpUser,
                pass: smtpPass,
            },
        });
        return cachedTransporter;
    }
    const user = process.env.EMAIL_USER;
    const passRaw = process.env.EMAIL_PASS;
    const pass = typeof passRaw === "string" ? passRaw.replace(/\s+/g, "") : passRaw;
    if (!user || !pass) {
        throw new Error("Missing EMAIL_USER or EMAIL_PASS");
    }
    cachedTransporter = nodemailer.createTransport({
        service: "gmail",
        logger: shouldDebug,
        debug: shouldDebug,
        auth: {
            user,
            pass,
        },
    });
    return cachedTransporter;
};
const sendRegisterOtpEmail = async (params) => {
    const transporter = getTransporter();
    const fromEmail = (process.env.EMAIL_FROM ||
        process.env.EMAIL_USER ||
        process.env.SMTP_USER);
    const fromName = process.env.EMAIL_FROM_NAME;
    const from = fromName && !/</.test(fromEmail)
        ? `"${fromName}" <${fromEmail}>`
        : fromEmail;
    const minutes = Math.max(1, Math.round(params.expiresInSeconds / 60));
    if (process.env.EMAIL_VERIFY === "true") {
        await transporter.verify();
    }
    await transporter.sendMail({
        from,
        to: params.to,
        subject: "Mã OTP đăng ký tài khoản",
        text: `Mã OTP của bạn là: ${params.otp}. Mã có hiệu lực trong ${minutes} phút.`,
        html: `<p>Mã OTP của bạn là: <b>${params.otp}</b></p><p>Mã có hiệu lực trong <b>${minutes} phút</b>.</p>`,
    });
};
exports.sendRegisterOtpEmail = sendRegisterOtpEmail;
const sendResetPasswordOtpEmail = async (params) => {
    const transporter = getTransporter();
    const fromEmail = (process.env.EMAIL_FROM ||
        process.env.EMAIL_USER ||
        process.env.SMTP_USER);
    const fromName = process.env.EMAIL_FROM_NAME;
    const from = fromName && !/</.test(fromEmail)
        ? `"${fromName}" <${fromEmail}>`
        : fromEmail;
    const minutes = Math.max(1, Math.round(params.expiresInSeconds / 60));
    if (process.env.EMAIL_VERIFY === "true") {
        await transporter.verify();
    }
    await transporter.sendMail({
        from,
        to: params.to,
        subject: "Mã OTP đặt lại mật khẩu",
        text: `Mã OTP đặt lại mật khẩu của bạn là: ${params.otp}. Mã có hiệu lực trong ${minutes} phút.`,
        html: `<p>Mã OTP đặt lại mật khẩu của bạn là: <b>${params.otp}</b></p><p>Mã có hiệu lực trong <b>${minutes} phút</b>.</p>`,
    });
};
exports.sendResetPasswordOtpEmail = sendResetPasswordOtpEmail;
