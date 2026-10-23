const nodemailer = require('nodemailer');
const APP_NAME = process.env.APP_NAME || 'ERP System';
const FROM_NAME = process.env.SMTP_FROM_NAME || APP_NAME;
const REPLY_TO = process.env.SMTP_REPLY_TO || process.env.SMTP_NAME;

const transporter = nodemailer.createTransport({
        service: 'gmail',
        pool: true,
        maxConnections: 1,
        maxMessages: 50,
        connectionTimeout: 15000,
        greetingTimeout: 10000,
        socketTimeout: 20000,
        auth: {
            user: process.env.SMTP_NAME,
            pass: process.env.SMTP_PASSWORD  
        },
        tls: {
            minVersion: 'TLSv1.2',
        },
    });
const API_BASE = process.env.BASE_URL || '/node-api/v1';

// Build verification URL pointing to the backend API route
const getVerifyUrl = (token) => {
  const base = process.env.SERVER_URL || process.env.CLIENT_URL;
  if (!base) {
    throw new Error('SERVER_URL or CLIENT_URL is not configured');
  }

  const url = new URL(`${API_BASE}/auth/verify-email`, base);
  url.searchParams.set('token', token);

  return url.toString();
};
const escapeHtml = (value = '') =>
  String(value).replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[char]);

//  Send email using Nodemailer.
const sendEmail = async ({ to, subject, html, text }) => {
  if (!process.env.SMTP_NAME || !process.env.SMTP_PASSWORD) {
    throw new Error('SMTP credentials are not configured');
  }

  return transporter.sendMail({
    from: {
      name: FROM_NAME,
      address: process.env.SMTP_NAME,
    },
    // A reachable Reply-To address is a positive trust signal for filters.
    replyTo: {
      name: FROM_NAME,
      address: REPLY_TO,
    },
    to,
    subject,
    // Always send both parts: HTML-only mail is a common spam trigger.
    text,
    html,
    headers: {
      // RFC 3834 — marks this as an automated transactional message so
      // auto-responders stay quiet and filters classify it as transactional.
      'Auto-Submitted': 'auto-generated',
      'X-Auto-Response-Suppress': 'All',
      // Gives recipients (and filters) a legitimate opt-out path.
      'List-Unsubscribe': `<mailto:${REPLY_TO}?subject=unsubscribe>`,
    },
  });
};

// Reusable email template
const emailTemplate = ({
  title,
  greeting,
  message,
  buttonText,
  actionUrl,
  note,
  preheader,
  recipientEmail,
}) => {
  const safeTitle = escapeHtml(title);
  const safeGreeting = escapeHtml(greeting);
  const safeMessage = escapeHtml(message);
  const safeButtonText = escapeHtml(buttonText);
  const safeUrl = escapeHtml(actionUrl);
  const safeNote = escapeHtml(note);
  const safeRecipient = escapeHtml(recipientEmail);
  const safeReplyTo = escapeHtml(REPLY_TO);
  const safeAppName = escapeHtml(APP_NAME);
  // Preview text shown next to the subject in the inbox; missing preheaders
  // make mailbox providers fall back to scraping the HTML body.
  const safePreheader = escapeHtml(preheader || message);
  return`
<!DOCTYPE html>
<html lang="en" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="x-apple-disable-message-reformatting">
  <meta name="color-scheme" content="light dark">
  <meta name="supported-color-schemes" content="light dark">
  <title>${safeTitle}</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style>
    /* Reset styles */
    body, table, td, a {
      -webkit-text-size-adjust: 100%;
      -ms-text-size-adjust: 100%;
    }
    table, td {
      mso-table-lspace: 0pt;
      mso-table-rspace: 0pt;
    }
    img {
      -ms-interpolation-mode: bicubic;
      border: 0;
      height: auto;
      line-height: 100%;
      outline: none;
      text-decoration: none;
    }
    table {
      border-collapse: collapse !important;
    }
    body {
      height: 100% !important;
      margin: 0 !important;
      padding: 0 !important;
      width: 100% !important;
    }

    /* Mobile Responsive Styles */
    @media screen and (max-width: 600px) {
      .email-container {
        width: 100% !important;
        max-width: 100% !important;
      }
      .responsive-padding {
        padding-left: 20px !important;
        padding-right: 20px !important;
      }
      .responsive-header {
        padding-top: 20px !important;
        padding-bottom: 20px !important;
      }
      .responsive-body {
        padding-top: 24px !important;
        padding-bottom: 24px !important;
      }
      .mobile-button {
        display: block !important;
        width: 100% !important;
        text-align: center !important;
        box-sizing: border-box !important;
      }
    }
  </style>
</head>

<body style="margin: 0; padding: 0; background-color: #f4f6f8; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1f2937; -webkit-font-smoothing: antialiased;">
  
  <!-- Hidden Preheader Text -->
  <div style="display: none; font-size: 1px; color: #f4f6f8; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden; mso-hide: all;">
    ${safePreheader}
  </div>

  <!-- Main Wrapper -->
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f4f6f8; table-layout: fixed;">
    <tr>
      <td align="center" style="padding: 40px 16px;">
        
        <!-- Email Container -->
        <table role="presentation" class="email-container" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 580px; background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">

          <!-- Header -->
          <tr>
            <td align="left" class="responsive-padding responsive-header" style="padding: 28px 32px; border-bottom: 1px solid #f3f4f6; background-color: #ffffff;">
              <h1 style="margin: 0; color: #2563eb; font-size: 20px; font-weight: 700; letter-spacing: -0.02em;">
                ${safeAppName}
              </h1>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td align="left" class="responsive-padding responsive-body" style="padding: 32px 32px 28px 32px;">
              
              <!-- Greeting -->
              <p style="margin: 0 0 16px; font-size: 16px; font-weight: 600; line-height: 1.5; color: #111827;">
                ${safeGreeting}
              </p>

              <!-- Message -->
              <p style="margin: 0 0 24px; font-size: 15px; line-height: 1.6; color: #374151;">
                ${safeMessage}
              </p>

              <!-- CTA Button -->
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin: 0 0 28px 0;">
                <tr>
                  <td align="center" style="border-radius: 8px; background-color: #2563eb;">
                    <a href="${safeUrl}" target="_blank" class="mobile-button" style="display: inline-block; padding: 12px 24px; font-size: 15px; font-weight: 600; color: #ffffff; text-decoration: none; border-radius: 8px; background-color: #2563eb; border: 1px solid #2563eb;">
                      ${safeButtonText}
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Alternative Link Info -->
              <p style="margin: 0 0 8px; font-size: 13px; line-height: 1.5; color: #6b7280;">
                Or copy and paste this link into your browser:
              </p>

              <p style="margin: 0 0 24px; font-size: 13px; line-height: 1.5; color: #2563eb; word-break: break-all;">
                <a href="${safeUrl}" target="_blank" style="color: #2563eb; text-decoration: underline;">
                  ${safeUrl}
                </a>
              </p>

              <!-- Note -->
              <p style="margin: 0; font-size: 13px; line-height: 1.6; color: #6b7280; border-top: 1px dashed #e5e7eb; padding-top: 20px;">
                ${safeNote}
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="left" class="responsive-padding" style="padding: 24px 32px; background-color: #f9fafb; border-top: 1px solid #f3f4f6;">
              <p style="margin: 0 0 10px; font-size: 12px; line-height: 1.6; color: #6b7280;">
                This email was sent to <span style="color: #374151; font-weight: 500;">${safeRecipient}</span>. Have questions? Reply directly to this email or contact us at <a href="mailto:${safeReplyTo}" style="color: #2563eb; text-decoration: none;">${safeReplyTo}</a>.
              </p>
              <p style="margin: 0; font-size: 12px; line-height: 1.5; color: #9ca3af;">
                &copy; ${new Date().getFullYear()} ${safeAppName}. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
        
      </td>
    </tr>
  </table>

</body>
</html>`;
};
// Email verification
const sendVerificationEmail = async (email, token, username = '') => {
  const verifyUrl = getVerifyUrl(token);

  const greeting = username ? `Hello ${username},` : 'Hello,';

  const message =
    `Thanks for creating an account with ${APP_NAME}. ` +
    'Confirm this email address to activate the account, then you can log in.';

  const note =
    'If you did not create this account, you can safely ignore this email. ' +
    `If this message landed in your spam folder, please move it to your inbox and mark it as "Not spam" so future ${APP_NAME} emails reach you.`;

  return sendEmail({
    to: email,
    subject: `Verify your ${APP_NAME} account email`,

    text: [
      greeting,
      '',
      message,
      '',
      `Verify your email address: ${verifyUrl}`,
      '',
      'This link will expire in 1 hour.',
      '',
      note,
      '',
      `Regards,`,
      `${APP_NAME}`,
      `Reply to this email if you need help.`,
    ].join('\n'),

    html: emailTemplate({
      title: 'Verify Your Email Address',
      greeting,
      message,
      buttonText: 'Verify my email address',
      actionUrl: verifyUrl,
      note,
      recipientEmail: email,
      preheader: `Confirm your email address to activate your ${APP_NAME} account.`,
    }),
  });
};

module.exports = {sendEmail,sendVerificationEmail}