/**
 * 將物件轉為 Base64URL 編碼 (JWT 標準)
 * 將+換成-，將/換成_
 */
// ========================================================================================================
function base64url(source) {
  let encoded = btoa(JSON.stringify(source));
  return encoded.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}
// 在網址標準中，+會被解讀為空白鍵，/會變成路徑分隔，因此兩個都要用其他符號取代，以後會去還原
// \代表轉義，把後面的符號變成純粹的文字符號
// 在網址標準中，=代表賦值，而base64的結尾會有用=去補償度的填充物，必須把它去掉

// ========================================================================================================
/**
 * 產生 JWT 通行證
 * @param {Object} payload 想要帶入的資料 (例如 {userId: "..."})
 * @param {String} secret 你的 Pepper (Secret Key)
 */
export async function generateJWT(payload, secret) {
    // 設定Header，演算法使用HS256(HMAC-SHA256)，類型是JWT
    const header = { alg: 'HS256', typ: 'JWT' };

  // 設定過期時間(七天)
    // 使用Date.now(自紀元以來經過的毫秒數)，除以1000從毫秒換成秒，然後取整數(exp的規定)
    const now = Math.floor(Date.now() / 1000);
    const fullPayload = {
        ...payload,                     // 展開payload
        iat: now,                       // 發行時間
        exp: now + (7 *24 * 60 * 60)    // 過期時間(7天 * 24小時 * 60分鐘 * 60秒數)。exp必須以秒為單位
    };

    // 把JSON物件轉換成base64純文字編碼，data就是之後要來蓋章的
    const encodedHeader = base64url(header);
    const encodedPayload = base64url(fullPayload);
    const data = `${encodedHeader}.${encodedPayload}`;

    // 使用 Web Crypto API 進行 HMAC-SHA256 簽名
    const encoder = new TextEncoder();
    const keyData = encoder.encode(secret);
    const key = await crypto.subtle.importKey(
    'raw', keyData, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  );
    // crypto.subtle.importKey可以把secret(我的pepper)轉成密鑰物件
    // raw代表密鑰是uint8Array格式
    // keyData要轉換成密鑰的資料，也就是轉換成uint8Array的secret
    // { name: 'HMAC', hash: 'SHA-256' }使用HMAC演算法，用SHA-256作雜湊函數
    // false代表密鑰不可被匯出
    // ['sign']指定密鑰可以做哪些操作，這裡只規定用來簽章
  
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(data));
  const encodedSignature = btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');

  return `${data}.${encodedSignature}`;
}

// ========================================================================================================

/**
 * 驗證 JWT 通行證
 * @param {String} token 完整 JWT 字串
 * @param {String} secret 你的 Pepper (Secret Key)
 */
export async function verifyJWT(token, secret) {
  const parts = token.split('.');
  if (parts.length !== 3) throw new Error('無效的 Token 格式');

  const [header, payload, signature] = parts;
  const data = `${header}.${payload}`;

  // 1. 重新計算簽名並驗證
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const key = await crypto.subtle.importKey(
    'raw', keyData, { name: 'HMAC', hash: 'SHA-256' }, false, ['verify']
  );

  // 將 Base64URL 簽名轉回 ArrayBuffer
  const sigStr = atob(signature.replace(/-/g, '+').replace(/_/g, '/'));
  const sigBuf = new Uint8Array([...sigStr].map(c => c.charCodeAt(0)));

  const isValid = await crypto.subtle.verify('HMAC', key, sigBuf, encoder.encode(data));
  if (!isValid) throw new Error('數位簽章無效，這張證件是偽造的！');

  // 2. 檢查是否過期
  const decodedPayload = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
  const now = Math.floor(Date.now() / 1000);
  if (decodedPayload.exp < now) throw new Error('證件已過期，請重新登入');

  return decodedPayload; // 驗證成功，回傳 Payload 資料
}