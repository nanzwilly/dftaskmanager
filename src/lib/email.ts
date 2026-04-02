import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendPasswordResetEmail(
  email: string,
  name: string,
  resetUrl: string,
) {
  await resend.emails.send({
    from: "MeetingManager <onboarding@resend.dev>",
    to: email,
    subject: "Reset your password",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
        <h2 style="color: #00838f; margin-bottom: 16px;">Reset Your Password</h2>
        <p style="color: #333; font-size: 14px; line-height: 1.6;">
          Hi ${name},
        </p>
        <p style="color: #333; font-size: 14px; line-height: 1.6;">
          We received a request to reset your password. Click the button below to set a new password. This link expires in 1 hour.
        </p>
        <div style="text-align: center; margin: 28px 0;">
          <a href="${resetUrl}" style="background-color: #00838f; color: #fff; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-size: 14px; font-weight: 600;">
            Reset Password
          </a>
        </div>
        <p style="color: #888; font-size: 12px; line-height: 1.5;">
          If you didn't request this, you can safely ignore this email. Your password won't be changed.
        </p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
        <p style="color: #aaa; font-size: 11px;">MeetingManager</p>
      </div>
    `,
  });
}
