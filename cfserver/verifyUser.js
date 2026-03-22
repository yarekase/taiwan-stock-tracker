async function verifyUser(request, env) {
    // Header會長這樣:
    // {
    // Host: 主機名稱
    // Authorization: Bearer JWT
    // Content-Type: application/json
    // }
    // 這裡先取得Authorization，得到Bearer JWT
    const authHeader = request.headers.get("Authorization");
    if (!authHeader) throw new Error("未提供驗證權杖");
    // 從空格切開成兩個資料放進陣列裡，我們取第二個[1]
    const token = authHeader.split(" ")[1]; // 取得 Bearer 後面的字串

    // 這裡會用到 Web Crypto API 來檢查簽名
    const payload = await verifyJWT(token, env.JWT_SECRET); 
    
    return payload.userId; // 驗證成功，直接回傳 ID
}