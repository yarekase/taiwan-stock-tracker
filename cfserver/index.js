// 匯入crawlerForCF的函式=============================
// 對應檔案裡匯出的形式export { updateAllStocks };;
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { jwt } from 'hono/jwt';
import { updateAllStocks } from './crawlerForCF.js';
import { handleSignup, handleVerify, handleLogin } from './auth.js';

// 初始化Hono
const app = new Hono;

// =====================================================================================

// 處理CORS
// 使用框架use(中間件Middleware)功能，在處理其他API之前，先處理一些重複的事情
// 處理的範圍是所有API網址都要，因為這裡要處理的是CORS
// 這裡使用框架的cors功能，處理瀏覽器發送的預檢請求(Preflight)
app.use('*', cors({
    origin: '*',       //等同"Access-Control-Allow-Origin"，*是所有網域都接受，日後改成自己的網域
    allowMethods: ['GET','POST','DELETE','OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization']  // 由於要使用JWT，必須增加Authorization這個Headers
}));

// =====================================================================================

/* 
c便是上下文Context，將request,env,ctx三個參數包含在一起
箭頭函數(c)：當參數只有一個時，()可以省略，當有兩個或沒有參數時，需要使用()
*/

// 首頁
app.get('/', (c) => {
    return c.text('台股紀錄伺服器穩定運行中');  //c.text：回傳純文字，自動包含了標頭
});

// 認證相關功能(註冊/驗證/登入)

app.post('/api/signup', handleSignup);
app.get('/api/verify', handleVerify);
app.post('/api/login', handleLogin);

// =====================================================================================

// JWT保護層，只要經過auth的都會經過這層
app.use('/api/auth/*', (c,next)=>{
    // jwt()函式：當執行時，會自動去檢查req headers，尋找到Authorization並且自動拆分出來找到token
    // 接著將token分成三段（Header, Payload, Signature）
    // 使用secret: c.env.JWT_SECRET，配合token前兩段，重新計算後比對跟Signature是否吻合
    // 如果吻合則執行await next()，並且把payload放入c裡面，此時程式碼會暫停等待吻合的next()
    const authMiddleware = jwt({
        secret: c.env.JWT_SECRET,
        alg: 'HS256'
    });
    return authMiddleware(c,next);
})

// 受保護的API
// =====================================================================================
// 取得紀錄
app.get('/api/auth/records',async (c)=>{
    const db = c.env.DB;
    const payload = c.get('jwtPayload');  //從jwt()得到的資料

// 測試
    if (!payload || !payload.userId) {
            console.error("❌ Token 解析失敗或缺少 userId");
            return c.json({ error: "無效的授權資訊" }, 401);
        }



    const userId = payload.userId;  //在auth.js裡面的handleLogin存進去的

    const {results} = await db.prepare(`
        SELECT id, trade_date AS date, stock_id AS stockId, stock_name AS stockName,
        action AS type, price, quantity
        FROM records
        WHERE user_id =?
        ORDER BY trade_date DESC
        `).bind(userId).all();

    return c.json(results);
});

// =====================================================================================

// 新增記錄
app.post('/api/auth/records',async (c) => {
    const db = c.env.DB;
    const payload = c.get('jwtPayload');
    const userId = payload.userId;
    const {date, stockId, stockName, type, price, quantity} = await c.req.json();

    const result = await db.prepare(`
        INSERT INTO records (user_id, trade_date, stock_id, stock_name, action, price, quantity)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        `).bind(userId, date, stockId, stockName, type, price, quantity).run();

    return c.json({message: "紀錄新增完畢", recordId: result.meta.last_row_id},201);
    // message跟recordId都是json欄位不是物件
    // D1回傳的result有個meta會保存各種數據，裡面的last_row_id就是最新的表格id欄位
    // 前端拿到這個id，便可以在不經由資料庫的情況下去渲染畫面
})

// =====================================================================================

// 刪除記錄
app.delete('/api/auth/records/:id', async (c)=>{
    const db = c.env.DB;
    const payload = c.get('jwtPayload');
    const userId = payload.userId;
    const id = c.req.param("id");
    // url裡面的:id，把/後面的資料放入了id裡，接著透過param讀取id對應的值

    // 為了確保安全性，增加一個AND user_id = ?好檢查更動的表格確實是使用者的
    const result = await db.prepare("DELETE FROM records WHERE id = ? AND user_id = ?")
    .bind(id, userId).run();

    // 如果沒有任何更動，可能出錯了
    if (result.meta.changes === 0){
        return c.json({error: '找不到紀錄或無權進行動作'},404 );
    }

    return c.json({message: '刪除成功'});
});

// =====================================================================================

// 不須保護的API
// 取得股票清單

app.get('/api/stocks', async (c) => {
  const { results } = await c.env.DB.prepare(
    "SELECT stock_id, stock_name, current_price FROM stocklist"
  ).all();
  return c.json(results);
});

export default{
    fetch: app.fetch,
    // app.fetch功能，會讓進來的HTTP請求導向對應的app邏輯裡

    async scheduled(event, env, ctx){
        // 由於這裡是純後端運作，沒有前端發送請求，因此不能使用Hono提供的c
        const db = env.DB;
        ctx.waitUntil(updateAllStocks(db));
        // 由於updateAllStocks可能會花一段時間，因此需要用waitUntil去執行
        // 與await的不同
        // await把這串函式停下來，放到背景去等待，等其他程式碼結束後才丟回call stack
        // waitUntill是CF特有的功能，由於爬蟲耗時較長，waitUntill讓函式移開call stack後
        // 讓worker持續運行，不丟回call stack，因此主程序做完就能立刻結束
    }
};
