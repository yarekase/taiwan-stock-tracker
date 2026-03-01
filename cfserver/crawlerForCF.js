// 為了在CF上運行所改寫的檔案
// 從Cloudflare Worker環境傳來的資料庫連結參數。
async function updateAllStocks(stockList) {

    try {
        // 1.抓取證交所資訊====================================================================================
        // 用fetch把證交所資料抓到response裡面，此時是字串，因此要做json轉檔後放到allstocks裡
        console.log('正在從證交所抓取資料...');
        const response = await fetch('https://openapi.twse.com.tw/v1/exchangeReport/STOCK_DAY_ALL');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const allStocks = await response.json();
        console.log(`抓取到 ${allStocks.length} 筆原始資料`);

        // 2. 準備SQLite語法====================================================================================
        // prepare是預處理，先把這段語法準備起來但不要執行，用?當作佔位符號
        // ?一樣代表所有資料裡的某個欄位的值陣列
        // 得到prepare這個準備好但還沒執行的SQL語法
        const prepare = stockList.prepare(
            `INSERT OR REPLACE INTO stocklist (stock_id, stock_name, current_price) VALUES (?, ?, ?)`
        );

        // 3.將allstocks資料作map====================================================================================
        // 用bind把資料放入prepare裡面，把Code、Name和ClosingPrice資料抓出來，照順序對應放入?裡
        // **?在這裡會明確的被當作字串，因此不會被當作SQL語言去影響到資料庫，頂多是這格資料有點問題而已。
        // 將放入資料以後的預處理SQL語法放入done裡
        const done = allStocks.map(stock => {
            return prepare.bind(
                stock.Code,
                stock.Name,
                parseFloat(stock.ClosingPrice) || 0
            );
        });

        console.log(`準備更新資料庫...`);
        
        // 4. 使用 D1 的 batch 功能執行批次操作====================================================================================
        await stockList.batch(done);

        console.log('✅ 全台股資料 SQLite 批次更新完成！');
    } catch (error) {
        console.error('❌ 批次更新失敗：', error.message);
    }
}

export { updateAllStocks };;