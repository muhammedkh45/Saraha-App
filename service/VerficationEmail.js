export const emailtemp = (link)=>{ 
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
}