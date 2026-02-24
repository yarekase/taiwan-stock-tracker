// 導入mysql2套件的Promise版本
const mysql = require('mysql2/promise');
// 導入dotenv，並執行裡面的config功能來讀取.env檔案，注意.env要跟package放在一起
require('dotenv').config();

// 建立連線池 (Connection Pool)
const pool = mysql.createPool({
    host: process.env.DB_HOST,      // 通常是 localhost
    user: process.env.DB_USER,      // MySQL 帳號，通常是 root
    password: process.env.DB_PASSWORD, // 你的 MySQL 密碼
    database: process.env.DB_NAME,  // 你的資料庫名稱
    port: process.env.DB_PORT || 3306, // MySQL 預設通訊埠是 3306
    
    // 以下是連線池的優化設定（選填，但建議加上）
    waitForConnections: true,    // 當連線滿了，是否等待排隊
    connectionLimit: 10,         // 同時最多維持 10 個連線
    queueLimit: 0                // 排隊數量不設限
});

// 測試連線是否成功 (這段可以在開發初期保留，確認連線沒問題)
pool.getConnection()
    .then(connection => {
        console.log('✅ 成功連線到 MySQL 資料庫！');
        connection.release(); // 記得要把連線放回池子
    })
    .catch(err => {
        console.error('❌ 資料庫連線失敗，請檢查 .env 設定或 MySQL 是否有啟動。');
        console.error('錯誤訊息：', err.message);
    });

// =====================================================================
// // 測試連線的函式
// async function testConnection() {
//     try {
//         // 向資料庫要一個簡單的資料：現在的時間
//         const [rows] = await pool.query('SELECT NOW() AS currentTime');
//         console.log('✅ 連線成功！');
//         console.log('資料庫現在時間是：', rows[0].currentTime);
//     } catch (err) {
//         console.error('❌ 連線失敗，請檢查以下原因：');
//         console.error('1. MySQL 是否有啟動？');
//         console.error('2. .env 的密碼與資料庫名稱是否正確？');
//         console.error('3. 錯誤訊息：', err.message);
//     }
// }

// // 執行測試
// testConnection();
// =====================================================================

// 導出 pool，讓其他的 Controller 或 Service 可以使用
module.exports = pool;