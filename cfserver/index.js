// 匯入crawlerForCF的函式=============================
// 對應檔案裡匯出的形式export { updateAllStocks };;
import { updateAllStocks } from './crawlerForCF.js';


export default{
    // 1.進行HTTP請求處理
    // 新增CRUD要求
    // 由於worker不是透過exprss的listen持續監聽，而是事件驅動，因此要寫當使用者發送請求時，讓CF做什麼
    async fetch(request, env, ctx){
        
        // 處理請求的url
        const url = new URL(request.url);
        const {pathname} = url;
        // 處理請求的method
        const method = request.method;
        // 連線D1資料庫
        const db = env.DB;

        // 處理CORS，取代app.use(cors())的寫法，自行定義標頭，最基本的是需要這幾個：
        // origin網域來源、method做什麼事情、header帶著什麼東西、content-type讓前端知道這個是json檔要轉成物件
        const corsHeaders ={
            // 前端請求是CF提供的前端網址才可進入
            "Access-Control-Allow-Origin":"*",
            // 前端可請求的動作為何
            "Access-Control-Allow-Methods":"GET,POST,DELETE,OPTIONS",
            // 允許前端請求帶有Content-Type的標頭
            "Access-Control-Allow-Headers":"Content-Type",
            // 伺服器回應的內容格式為JSON格式
            "Content-Type":"application/json; charset=UTF-8"
        };

        // 當前端發出CORS請求時，HTTP請求方法會是OPTIONS，如果是這個，不用做回應(null)，然後允許請求
        if (method ==="OPTIONS") return new Response(null, {headers:corsHeaders});

        // 針對首頁執行===========================================================
        if (pathname === "/" || pathname === "") {
            return new Response("🚀 台灣股票追蹤器 API 伺服器正在高雄穩定運行中！", { 
                headers: { 
                    ...corsHeaders, 
                    "Content-Type": "text/plain; charset=UTF-8" 
                } 
            });
        }

        // 開始針對動作執行=========================================================
        try{
            // 讀取records的方法=========================================
            if (method === "GET" && pathname ==="/api/records") {
                // 抓取資料，轉換成前端的名稱，用交易日期做排序，DESC是從小到大，ASC是從大到小
                // prepare包含了results跟meta兩個資料，前者是抓到的資料陣列，後者是這次查詢的統計資訊，這裡只需要results
                // .all()在資料庫中，代表取得多行資料，在CF特別跟run等效
                const {results} =await db.prepare(`
                    SELECT id,
                    trade_date AS date,
                    stock_id AS stockId,
                    stock_name AS stockName,
                    action AS type,
                    price,
                    quantity
                    FROM records ORDER BY trade_date DESC
                    `).all();
                return new Response(JSON.stringify(results), { headers: corsHeaders });
            };

            // 更新records的方法=========================================
            if (method === "POST" && pathname === "/api/records") {
                // 從請求裡抓取前端的各個資料
                const { date, stockId, stockName, price, quantity, type } = await request.json();
                const result = await db.prepare(`
                    INSERT INTO records (trade_date, stock_id, stock_name, action, price, quantity)
                    VALUES (?, ?, ?, ?, ?, ?)
                `).bind(date, stockId, stockName, type, price, quantity).run();
                // 先填入站位符號?，把用bind資料填入，注意位置要對應很重要
                // 最後執行run
                return new Response(JSON.stringify({ message: '儲存完畢', recordId: result.meta.last_row_id }), { status: 201, headers: corsHeaders });
            }

            // 刪除各別record的方法=========================================
            // 這裡的將會針對/api/records/:id做操作，因此pathname設定上改成/api/records/開頭而非===
            if (method === "DELETE" && pathname.startsWith("/api/records/")) {
                // 移除"/"符號，變成api,records,id，透過pop取得最後一個資料得到要刪除的id
                const id = pathname.split("/").pop();
                const result = await db.prepare("DELETE FROM records WHERE id = ?").bind(id).run();

                // 透過prpare裡的meta紀錄，尋找changes這個有幾行資料變動的數據，如果沒有變動，代表沒找到這個id
                if (result.meta.changes === 0) return new Response(JSON.stringify({ error: '找不到紀錄' }), { status: 404, headers: corsHeaders });
                
                return new Response(JSON.stringify({ message: '刪除成功' }), { headers: corsHeaders });
            }

            // 取得stocks的方法=========================================
            if (method === "GET" && pathname === "/api/stocks") {
                const { results } = await db.prepare("SELECT stock_id, stock_name, current_price FROM stocklist").all();
                return new Response(JSON.stringify(results), { headers: corsHeaders });
            }

            // 預留手動觸發爬蟲的路徑=========================================
            // if (pathname === "/run-crawler") {
            //     ctx.waitUntil(updateAllStocks(db));
            //     return new Response("爬蟲啟動中", { headers: corsHeaders });
            // }

            // 如果上面幾個通通沒有抓到，回傳沒找到資料，可能api有錯
            return new Response("Not Found", { status: 404, headers: corsHeaders });


        }catch(error){
            return new Response(JSON.stringify({error:error.message}),{status:500,headers:corsHeaders});
        }      
    },

    // ===============================================================================================
    // 2.定時任務處理
    async scheduled(event, env, ctx){
        // evb.DB對應的是wrangler裡的名字
        const db = env.DB;
        ctx.waitUntil(updateAllStocks(db));
    }
};