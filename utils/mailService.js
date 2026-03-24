/**
 * 發送驗證信件
 * @param {string} email - 使用者的信箱
 * @param {string} token - 驗證權杖
 * @param {object} env - 包含環境變數 (API_KEY, DOMAIN)
 */
export async function sendVerificationEmail(email, token, env) {
  // 之後根據網址修改，或是存在 env 裡
  const baseUrl = env.APP_DOMAIN || 'stock-tracker.ejimtpck.workers.dev';  //注意這裡要輸入伺服器的網址
  const verifyUrl = `${baseUrl}/api/verify?token=${token}`;
  
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${env.RESEND_API}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'onboarding@resend.dev', // 註冊網域後再修改
      to: 'ejimtpck@gmail.com',
      subject: '台股追蹤系統 - 驗證您的帳號',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px;">
          <h2 style="color: #333;">歡迎加入台股追蹤系統！</h2>
          <p>感謝您的註冊。請點擊下方的按鈕以完成 Email 驗證：</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verifyUrl}" style="background-color: #0070f3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">
              驗證我的帳號
            </a>
          </div>
          <p style="font-size: 12px; color: #666;">如果按鈕無效，請複製此連結到瀏覽器：<br>${verifyUrl}</p>
          <hr style="border: none; border-top: 1px solid #eee; margin-top: 30px;">
          <p style="font-size: 12px; color: #999;">這是一封系統自動發送的郵件，請勿直接回覆。</p>
        </div>
      `
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('Resend API Error:', error);
  }
}