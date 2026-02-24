// 導入各個套件及資料庫=============================
const express = require('express');
const cors = require('cors');
const db = require('./config/db');
require('dotenv').config();

// ==========================================================

// 將express套件功能物件化
const app= express();

// 執行cors物件，產生允許跨領域請求的物件，拿來給app使用
app.use(cors());
// 呼叫express內建的json解析工具，
// 將前端傳來的json格式字串，轉化為JavaScript物件，拿來給app使用
app.use(express.json());

// 查詢==========================================================

// 動態路由，":"是佔位符號，將後續的網址/api/stock/後面接的任何字放入id這個變數裡
// app.get('/api/stock/:id',async(req,res)=>{
//     const stockId = req.params.id      //req.params抓取網址/api/stock/後面存入id變數的值
//     try{
//         const [rows] = await db.query(   //等待db資料庫去搜尋
//             'SELECT * FROM stockList WHERE stock_id = ?',[stockId]
//         );
//         // 如果有找到
//         if (rows.length>0){
//             res.json(rows[0]);
//         } else {
//             res.status(404).json({message:'找不到股票資訊'});
//         }
//     } catch (error){
//         res.status(500).json({error:'查詢失敗'});
//     }
// });
// 讀取紀錄==========================================================
app.get('/api/records',async(req,res)=>{
    try {
        const sql=`
            SELECT 
                id,
                trade_date AS date,
                stock_id AS stockId,
                stock_name AS stockName,
                action AS type,
                price,
                quantity            
            FROM records ORDER BY trade_date DESC
            `;
        const [rows] = await db.query(sql);
        res.json(rows);
    } catch (error) {
        res.status(500).json({error:"取得記錄失敗"});
    }
});

// 存入紀錄==========================================================
app.post('/api/records',async(req,res)=>{
    // req.body是從前端表單填寫的內容拿取過來的資料
    const {date, stockId, stockName, price, quantity, type} = req.body;

    try{
        // SQL指令，將資料放入資料庫裡
        const sql = `
        INSERT INTO records(trade_date, stock_id, stock_name, action, price, quantity)
        VALUES (?, ?, ?, ?, ?, ?)
        `;
        // 將指令放入execute中，帶入後面[]的值
        // execute得到兩個結果[results,fields]，這裡只要得到results，並取名為result
        // 在INSERT功能下，results會是更新資料後的結果回報，fields則是欄位資訊
        const [result] = await db.execute(sql, [
            date,
            stockId,
            stockName,
            type,
            price,
            quantity
        ]);
        // insertId代表新增加的ID號碼
        res.status(201).json({message:'儲存完畢',recordId : result.insertId});
    }catch(error){
        res.status(500).json({error:`儲存失敗：${error.message}，請檢查資料`});
    };
});

// 刪除紀錄==========================================================
app.delete('/api/records/:id',async(req,res)=>{
    const {id} = req.params;
    const sql = `
    DELETE FROM records WHERE id =?
    `;

    try{
        const [result] = await db.query(sql,[id]);
        // 先確認真的有找到紀錄
        if (result.affectedRows ===0){
            return res.status(404).json({error:'找不到該筆紀錄'});
        }
        
        console.log(`ID${id}刪除成功`);
        res.json({message:'刪除成功'});
    }catch(err){
        console.error('刪除失敗',err);
        res.status(500).json({error:'刪除失敗'});
    }
});

// 抓台股資訊==========================================================
app.get('/api/stocks',async (req,res)=>{
    const sql = `
    SELECT stock_id, stock_name, current_price FROM stockList
    `;
    try{
        const [result] = await db.query(sql);
        res.json(result);
    }catch(err){
        es.status(500).json({error:'抓取台股資訊失敗'});
    }        
    });

// 啟動==========================================================
const PORT = process.env.PORT || 5000;
app.listen(PORT,()=>{
    console.log(`伺服器啟動於:http://localhost:${PORT}`);
});