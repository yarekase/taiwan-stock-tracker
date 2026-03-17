import { hashPassword } from './utils/crypto.js';

// 註冊功能========================================================================================================================================
export async function handleSignup(request, env) {
  const { email, password } = await request.json();

  // 1. 檢查密碼格式 (8-15 碼英數字)============================================
  // 先建立regex規則
  const passwordRegex = /^[A-Za-z0-9]{8,15}$/;

  // 使用regex規則的text功能檢查密碼是否正確
  if (!passwordRegex.test(password)) {
    return new Response("密碼格式不符", { status: 400 });
  }
  // =========================================================================

  // 2. 檢查 Email 是否已被註冊================================================
  const existingUser = await env.DB.prepare("SELECT id FROM users WHERE email = ?")
    .bind(email)
    .first();
    // .all()會回傳一個陣列或null，.first()會回傳一個物件或null
    // 使用first()在找到第一筆的時候就會停下來，節省效能
  if (existingUser) {
    return new Response("此 Email 已被註冊", { status: 409 });
  }
  // =========================================================================

  // 3. 密碼加密===============================================================
  const passwordHash = await hashPassword(password); 

  const userId = crypto.randomUUID();
  const token = crypto.randomUUID();

  // 4. 存入資料庫
  await env.DB.prepare(
    "INSERT INTO users (id, email, password, verification_token) VALUES (?, ?, ?, ?)"
  )
    .bind(userId, email, passwordHash, token)
    .run();
    // is_verified預設為0，created_at則會自動產生

  return new Response(JSON.stringify({ message: "註冊成功，請驗證信箱" }), { status: 201 });
  // 回傳狀態201，要求使用者去接收信箱
}

// ===================================================================================================================================================

// 登入功能============================================================================================================================================
export async function handleLogin(request, env) {
  const { email, password } = await request.json();

  // 1. 從資料庫抓出該使用者的資料
  const user = await env.DB.prepare(
    "SELECT id, password, is_verified FROM users WHERE email = ?"
  )
    .bind(email)
    .first();

  // 2. 檢查使用者是否存在
  if (!user) {
    // 為了安全，建議回應「帳號或密碼錯誤」，不要明確說 email 不存在
    return new Response("帳號或密碼錯誤", { status: 401 });
  }

  // 3. 檢查是否已驗證信箱 (如果你有做驗證功能的話)
  if (!user.is_verified) {
    return new Response("請先驗證您的電子信箱", { status: 403 });
  }

  // 4. 比對密碼！
  // 關鍵點：用同樣的絞碎機算一次，結果必須一模一樣
  const currentLoginHash = await hashPassword(password);

  if (currentLoginHash !== user.password) {
    return new Response("帳號或密碼錯誤", { status: 401 });
  }

  // 5. 登入成功，發放憑證 (Session 或 JWT)
  // 這裡先回傳成功訊息，後續我們可以討論如何產生 Session Token
  return new Response(JSON.stringify({ 
    message: "登入成功",
    userId: user.id 
  }), { status: 200 });
}