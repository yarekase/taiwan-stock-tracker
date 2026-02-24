const axios = require('axios');
const db = require('../config/db');

async function updateAllStockPrices() {
    try {
        console.log('正在從證交所抓取即時行情...');
        const response = await axios.get('https://openapi.twse.com.tw/v1/exchangeReport/STOCK_DAY_ALL');
        const allStocks = response.data;

        // 1. 把資料轉換成 SQL 需要的格式：[[id1, name1, price1], [id2, name2, price2], ...]
        const values = allStocks.map(stock => [
            stock.Code,
            stock.Name,
            stock.ClosingPrice || 0
        ]);

        // 2. 準備批次寫入的 SQL 語法
        // 注意：VALUES 後面用一個問號 (?) 代表整個大陣列
        const sql = `
            INSERT INTO stockList (stock_id, stock_name, current_price)
            VALUES ? 
            ON DUPLICATE KEY UPDATE 
            current_price = VALUES(current_price),
            stock_name = VALUES(stock_name);
        `;

        console.log(`準備更新 ${values.length} 筆資料...`);

        // 3. 執行批次更新
        // 注意：在 mysql2 套件中，批次寫入的參數必須包在一個陣列裡，所以是 [values]
        await db.query(sql, [values]);

        console.log('✅ 全台股資料批次更新完成！');
    } catch (error) {
        // 按照你的要求：有錯必糾
        console.error('❌ 批次更新失敗：', error.message);
        if (error.code === 'ER_PARSE_ERROR') {
            console.error('提示：SQL 語法解析錯誤，請檢查陣列格式。');
        }
    }
}

module.exports = { updateAllStockPrices };

// 手動測試=====================================================

// module.exports = { updateAllStockPrices };

// // ⚠️ 加入這行來手動觸發執行
// updateAllStockPrices();