const axios = require('axios');
const db = require('../config/db');

// 抓資料得到結果需要時間，因此這裡就先使用了async function
async function updateAllStockPrices() {
    try {
        console.log('正在從證交所抓取');
        const response = await axios.get('https://openapi.twse.com.tw/v1/exchangeReport/STOCK_DAY_ALL');
        // axios會有五種屬性，其中data包含了抓到的資料
        // 將data資料放進allstocks裡面供我們後續操作
        const allStocks = response.data;

        // 1. 把資料轉換成 SQL 需要的格式：[[code1, name1, price1], [code2, name2, price2], ...]
        // 根據台股API裡使用的名稱
        const values = allStocks.map(stock => [
            stock.Code,
            stock.Name,
            stock.ClosingPrice || 0
        ]);

        // 2. 準備批次寫入的 SQL 語法
        // 注意：VALUES 的問號?代表整個大陣列[values]，也就是變成('2330', ...), ('2454', ...), ('2317', ...)
        // 當(on)資料重複(DUPLICATE)，資料為key(primary key)，則執行更新(UPDATE)而非(INSERT)，銜接後面的更動
        const sql = `
            INSERT INTO stockList (stock_id, stock_name, current_price) VALUES ? 
            ON DUPLICATE KEY UPDATE
            current_price = VALUES(current_price),
            stock_name = VALUES(stock_name);
        `;

        console.log(`準備更新 ${values.length} 筆資料`);

        // 3. 執行批次更新
        // 注意：在 mysql2 套件中，批次寫入的參數必須包在一個陣列裡，所以是 [values]
        await db.query(sql, [values]);

        console.log('✅ 全台股資料批次更新完成！');
    } catch (error) {
        
        console.error('❌ 批次更新失敗：', error.message);
        if (error.code === 'ER_PARSE_ERROR') {
            console.error('提示：SQL 語法解析錯誤，請檢查陣列格式。');
        }
    }
}

module.exports = { updateAllStockPrices };

// 手動測試=====================================================

// // ⚠️ 加入這行來手動觸發執行
// updateAllStockPrices();