export const emailVerficationLinktemp = (link) => {
  return `
    <!DOCTYPE html>
    <html lang="en">
      <head><meta charset="UTF-8"><title>Verify Email</title></head>
      <body style="background-color:#f4f4f4;padding:30px;font-family:Arial,sans-serif">
        <table width="100%" cellspacing="0" cellpadding="0">
          <tr><td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;padding:40px;border-radius:8px;">
              <tr><td align="center" style="padding-bottom:20px;">
                <h1 style="color:#333;">Verify Your Email</h1>
              </td></tr>
              <tr><td align="center" style="padding-bottom:20px;">
                <p style="color:#666;">Click the button below to verify your account:</p>
              </td></tr>
              <tr><td align="center" style="padding-bottom:20px;">
                <a href="${link}" style="background:#4caf50;color:#fff;padding:12px 24px;text-decoration:none;border-radius:5px;font-size:16px;">Verify Email</a>
              </td></tr>
              <tr><td align="center" style="color:#999;">If you didn’t request this, you can safely ignore it.</td></tr>
              <tr><td align="center" style="padding-top:30px;color:#ccc;">&copy; ${new Date().getFullYear()} EL-Nour Paints</td></tr>
            </table>
          </td></tr>
        </table>
      </body>
    </html>`;
};
export const emailVerficationCodetemp = (code, verifyPageUrl) => {
  return `
      <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <title>Verify Your Email</title>
    </head>
    <body style="background-color:#f9f9f9; padding: 30px; font-family: sans-serif;">
      <table width="100%" cellspacing="0" cellpadding="0">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff; padding:40px; border-radius:8px;">
              <tr>
                <td align="center" style="padding-bottom:20px;">
                  <h2 style="color:#333;">Email Verification</h2>
                </td>
              </tr>
              <tr>
                <td align="center" style="padding-bottom:20px;">
                  <p style="color:#666;">Please use the following code to verify your account:</p>
                </td>
              </tr>
              <tr>
                <td align="center" style="padding-bottom:20px;">
                  <div style="font-size:2em; letter-spacing: 8px; font-weight:bold; color:#4caf50; background:#f0f0f0; padding:16px 32px; border-radius:8px; display:inline-block;">
                    ${code}
                  </div>
                </td>
              </tr>
              <tr>
                <td align="center" style="padding-bottom:20px;">
                  <a href="${verifyPageUrl}" style="background:#4caf50;color:#fff;padding:12px 24px;text-decoration:none;border-radius:5px;font-size:16px;">
                    Verify Now
                  </a>
                </td>
              </tr>
              <tr>
                <td align="center" style="color:#999; font-size:14px;">
                  If you didn't request this, just ignore the message.
                </td>
              </tr>
              <tr>
                <td align="center" style="padding-top:30px;color:#ccc;font-size:12px;">
                  &copy; ${new Date().getFullYear()} EL-Nour Paints
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
  </html>;
`;
};
