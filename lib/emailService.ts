/**
 * Email notification service using Resend
 */

import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'Holiday Hub <notifications@example.com>',
      to: options.to,
      subject: options.subject,
      html: options.html,
    });

    if (error) {
      console.error('Email send error:', error);
      return false;
    }

    console.log('Email sent successfully:', data);
    return true;
  } catch (error) {
    console.error('Failed to send email:', error);
    return false;
  }
}

export function generateHolidayEmailHTML(
  holidayName: string,
  holidayDescription: string,
  holidayDate: Date,
  daysUntil: number,
): string {
  const dateString = holidayDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const message =
    daysUntil === 0
      ? `Today is ${holidayName}!`
      : daysUntil === 1
        ? `Tomorrow is ${holidayName}!`
        : `${holidayName} is coming up in ${daysUntil} days!`;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 30px;
          border-radius: 10px 10px 0 0;
          text-align: center;
        }
        .content {
          background: #f7f7f7;
          padding: 30px;
          border-radius: 0 0 10px 10px;
        }
        .holiday-name {
          font-size: 28px;
          font-weight: bold;
          margin: 0 0 10px 0;
        }
        .message {
          font-size: 18px;
          margin: 20px 0;
        }
        .date {
          font-size: 16px;
          color: #666;
          margin: 10px 0;
        }
        .description {
          margin: 20px 0;
          padding: 15px;
          background: white;
          border-radius: 5px;
          border-left: 4px solid #667eea;
        }
        .footer {
          margin-top: 20px;
          text-align: center;
          color: #999;
          font-size: 14px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="holiday-name">${holidayName}</div>
      </div>
      <div class="content">
        <div class="message">${message}</div>
        <div class="date">📅 ${dateString}</div>
        <div class="description">
          ${holidayDescription}
        </div>
        <div class="footer">
          This is a reminder from Holiday Hub. Manage your notifications at your dashboard.
        </div>
      </div>
    </body>
    </html>
  `;
}

export function generatePasswordResetEmailHTML(resetLink: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 30px;
          border-radius: 10px 10px 0 0;
          text-align: center;
        }
        .content {
          background: #f7f7f7;
          padding: 30px;
          border-radius: 0 0 10px 10px;
        }
        .title {
          font-size: 24px;
          font-weight: bold;
          margin: 0 0 10px 0;
        }
        .message {
          font-size: 16px;
          margin: 20px 0;
        }
        .button {
          display: inline-block;
          padding: 15px 30px;
          background: #667eea;
          color: white;
          text-decoration: none;
          border-radius: 5px;
          font-weight: bold;
          margin: 20px 0;
        }
        .warning {
          color: #d9534f;
          margin: 20px 0;
          padding: 15px;
          background: #fee;
          border-radius: 5px;
          border-left: 4px solid #d9534f;
        }
        .footer {
          margin-top: 20px;
          text-align: center;
          color: #999;
          font-size: 14px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="title">🔑 Password Reset Request</div>
      </div>
      <div class="content">
        <div class="message">
          We received a request to reset your password for your Holiday Hub account.
          Click the button below to reset your password:
        </div>
        <div style="text-align: center;">
          <a href="${resetLink}" class="button">Reset Password</a>
        </div>
        <div class="message">
          Or copy and paste this link into your browser:
          <br>
          <a href="${resetLink}">${resetLink}</a>
        </div>
        <div class="warning">
          ⚠️ This link will expire in 1 hour.
          If you didn't request a password reset, please ignore this email.
        </div>
        <div class="footer">
          This is an automated message from Holiday Hub.
        </div>
      </div>
    </body>
    </html>
  `;
}
