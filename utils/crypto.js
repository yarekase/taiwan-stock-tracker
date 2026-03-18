/**
 * 將原始密碼轉換為安全的 SHA-256 雜湊字串
 * @param {string} password - 使用者輸入的明文密碼
 * @returns {Promise<string>} - 64 位元的十六進位雜湊字串
 */
export async function hashPassword(password, userSalt) {
  const pepper = "SECRET_PEPPER_IN_ENV"; //準備胡椒
  const hash = password + userSalt + pepper;
  // 1. 使用TextEncoder()的encode，將字串轉換為位元組
  const msgUint8 = new TextEncoder().encode(hash);
  
  // 2. 進行加密運算，使用SHA-256演算法
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  
  // 3. 轉換型別並輸出唯一連串16進位的字串
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
  return hashHex;
}