// 註冊接口範例
export async function handleSignup(request, env) {
  const { email, password } = await request.json();

  // 1. 檢查密碼格式 (8-15 碼英數字)
  const passwordRegex = /^[A-Za-z0-9]{8,15}$/;
  if (!passwordRegex.test(password)) {
    return new Response("密碼格式不符", { status: 400 });
  }

  // 2. 檢查 Email 是否已被註冊
  const existingUser = await env.DB.prepare("SELECT id FROM users WHERE email = ?")
    .bind(email)
    .first();
    // .all()會回傳一個陣列或null，.first()會回傳一個物件或null
    // 使用first()在找到第一筆的時候就會停下來，節省效能
  if (existingUser) {
    return new Response("此 Email 已被註冊", { status: 409 });
  }

  // 3. 密碼加密 (這裡建議使用 Web Crypto API 進行簡單雜湊)
  // 專業建議：在正式環境請使用專用的密碼雜湊函式
  const passwordHash = await hashPassword(password); 

  const userId = crypto.randomUUID();
  const token = crypto.randomUUID();

  // 4. 存入資料庫
  await env.DB.prepare(
    "INSERT INTO users (id, email, password_hash, verification_token) VALUES (?, ?, ?, ?)"
  )
    .bind(userId, email, passwordHash, token)
    .run();

  return new Response(JSON.stringify({ message: "註冊成功，請驗證信箱" }), { status: 201 });
}