import { sign } from 'hono/jwt'; 
// 使用框架給的JWT工具
import { hashPassword } from '../utils/crypto.js';
import { sendVerificationEmail } from '../utils/mailService.js';

/** 
 * 處理註冊handleSignup
 * 輸入email跟password
 * 改用hono框架
*/

// 註冊功能========================================================================================================================================
export async function handleSignup(c){
  const { email, password } = await c.req.json();  //從請求裡提取出信箱跟密碼，轉成字串
  const db = c.env.DB;
  const pepper = c.env.SECRET_PEPPER;

  // 1. 檢查密碼格式 (8-15 碼英數字)============================================
  
  // 先建立regex規則
  const passwordRegex = /^[A-Za-z0-9]{8,15}$/;
  // 使用regex規則的text功能檢查密碼是否正確
  if (!passwordRegex.test(password)) {
    return c.text("密碼格式不符", 400);
  }
  // =========================================================================

  // 2. 檢查 Email 是否已被註冊================================================
  const existingUser = await db.prepare("SELECT id FROM users WHERE email = ?")
  .bind(email).first();
    // .all()會回傳一個陣列或null，.first()會回傳一個物件或null
    // 使用first()在找到第一筆的時候就會停下來，節省效能
  if (existingUser) {
    return c.text({error:"此 Email 已被註冊"}, 409);
  }
  // =========================================================================

  // 3. 密碼加密===============================================================
  // 針對不同用戶產生不同的鹽
  const userSalt = crypto.randomUUID().replace(/-/g, '');  //把原本的36字元去掉4個底線變32字元，同時減少雜湊時可能的問題
  const passwordHash = await hashPassword(password,userSalt,pepper); 
  const userId = crypto.randomUUID();
  const token = crypto.randomUUID();

  // 4. 存入資料庫===============================================================
  await db.prepare("INSERT INTO users (id, email, password, verification_token, salt) VALUES (?, ?, ?, ?, ?)")
  .bind(userId, email, passwordHash, token, userSalt).run();
    // is_verified預設為0，created_at則會自動產生

  // 使用resend功能寄信
  c.executionCtx.waitUntil(sendVerificationEmail(email, token, c.env));
  // 這裡我們要呼喚CF去執行動作，因此用executionCtx或event，讓CF使用原生資源ctx去執行waitUntil

  return c.json({ message: "註冊成功，請驗證信箱" },201);
  // 回傳狀態201，要求使用者去接收信箱
}

// ===================================================================================================================================================

/** 
 * 處理驗證handleVerify
 * 輸入url
 * 改用hono框架
*/


// 驗證功能============================================================================================================================================
 
export async function handleVerify(c) {
  // 使用Hono框架的query，去尋找url上的"token=金鑰"部分
    const token = c.req.query("token");
    const db = c.env.DB;

  // 如果沒有token，回傳錯誤
    if (!token) return c.json({ error: "缺少token" },400);
  
    // 尋找對應token的使用者
    const user = await db.prepare("SELECT id FROM users WHERE verification_token = ?").bind(token).first();
    
    // 找不到使用者，代表token無效
    if (!user) return c.json({ error: "無效token" },400);
    
    // 找到使用者，將那名人員的is_verified設定為1，並把token刪除
    const result = await db.prepare(`
      UPDATE users SET is_verified = 1, verification_token = NULL WHERE id = ?`
      ).bind(user.id).run();
    
    if (result.success){
      return c.json({ message: "驗證成功" });  //附註，當沒有特別寫status時，預設是成功請求，並回應200
    } else {
      return c.json({ error: "資料庫更新失敗" },500 );
    }
}

/** 
 * 處理驗證handleLogin
 * 改用hono框架
*/

// 登入功能============================================================================================================================================
export async function handleLogin(c) {
  const { email, password } = await c.req.json();
  const db = c.env.DB;
  const pepper = c.env.SECRET_PEPPER;

  const user = await db.prepare("SELECT id, password, is_verified, salt FROM users WHERE email = ?")
    .bind(email)
    .first();

  // 檢查使用者是否存在
  if (!user) return c.text("帳號或密碼錯誤", 401);

  // 檢查是否已做了帳號驗證
  if (!user.is_verified) return c.text("請先驗證帳號", 403);

  // 比對密碼
  const currentLoginHash = await hashPassword(password, user.salt, pepper);
  if (currentLoginHash !== user.password) return c.text("帳號或密碼錯誤", 401);

  // 登入成功，發放憑證 (Session 或 JWT)
const payload = {
  userId: user.id,
  exp: Math.floor(Date.now() / 1000) + (7*24*60*60)
};

const token = await sign(payload, c.env.JWT_SECRET);

  return c.json({
    message: "登入成功",
    token: token 
  });
}