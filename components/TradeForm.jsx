import React, { useState, useEffect } from 'react';
import dayjs from "dayjs";
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import './TradeForm.css';

function TradeForm({ selectedStock, onSubmit }) {

  // 使用dayjs要額外載入套件===========================================
  dayjs.extend(utc);
  dayjs.extend(timezone);
  
  // 取得格式為 YYYY-MM-DD 的今日日期==================================
    const getTodayDate = () => {

      // 使用dayjs套件================================================
      return dayjs().tz("Asia/Taipei").format("YYYY-MM-DD");
      // 原始寫法=====================================================
      // const today = new Date();
      // // 先抓當下的時間丟進today，這時候是格林威治標準時間。
      // const formatter = new Intl.DateTimeFormat('en-CA', {
      //   // intl國際時間，en-CA加拿大時區使用YYYY-MM-DD，跟後面要用的相同
      //   // 這裡在做把標準時間做時間轉換，轉換為"以加拿大時區格式寫成的台灣台北時區時間"
      //   timeZone: 'Asia/Taipei',
      //   year: 'numeric',
      //   // 'numeric'會呈現完整數字，2026不會是02026或26
      //   month: '2-digit',
      //   day: '2-digit'
      //   // '2-digit'代表二位數字，如果不足就補0
      // });
      // return formatter.format(today);
      // //把抓到的時間做時間轉換
  };

  // =================================================================

  // --- 狀態管理 (State) ---
  const [date, setDate] = useState(getTodayDate());
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState(1);


  // 當選取的股票改變時，更新預設價格 (目前先模擬，之後串 API)
  useEffect(() => {
    if (selectedStock) {
      // 假設從 API 抓到了今日成交價，這裡先用隨機數模擬
      const defPrice = (selectedStock.currentPrice);
      setPrice(defPrice);
    //   當selectedStock發生變動時，先用defPrice去更新price，後續可以在自己輸入
    }
  }, [selectedStock]);

  
  // 處理按下「買入」或「賣出」的邏輯
  const handleSubmit = (type) => {
    // 防錯機制：確保金額有輸入或避免打成負數
    if (!price || price <= 0) {
      alert("請輸入正確的成交金額");
      return;
    }

    // 打包這筆交易資料
    const newRecord = {
      id: Date.now(), // 用時間戳記當作唯一 ID
      date: date,
      stockId: selectedStock.id,
      stockName: selectedStock.name,
      price: parseFloat(price),
      quantity: parseInt(quantity),
      type: type, // 'buy' 或 'sell'
      total: parseFloat(price) * parseInt(quantity) * 1000 // 台股一張通常是 1000 股
    };

    console.log(`提交交易紀錄 [${type === 'buy' ? '買入' : '賣出'}]:`, newRecord);
    onSubmit(newRecord); // 傳回給父組件儲存
  };

  return (
    <div className="trade-form-row">
      {/* 日期輸入欄 */}
      <div className="form-group">
        <label>日期</label>
        <input 
          type="date" 
        // 當type="date"時，點下去會出現一個日期選擇介面，value值一定是YYYY-MM-DD
          value={date} 
          onChange={(e) => setDate(e.target.value)} 
        // 當日期input的內容有輸入東西時，將內容傳到setDate，去更新date
        />
      </div>

      {/* 顯示目前選定的股票 */}
      <div className="form-group selected-info">
        <strong>{selectedStock.id} {selectedStock.name}</strong>
      </div>



      {/* 價格輸入欄 */}
      <div className="form-group">
        <label>成交金額</label>
        <input 
          type="number" 
          value={price} 
          onChange={(e) => setPrice(e.target.value)} 
        //   原本有預設今日成交金額，但如果input有更動，就會更新price
          placeholder="成交價"
        />
      </div>

      {/* 張數輸入欄 */}
      <div className="form-group">
        <label>張數</label>
        <input 
          type="number" 
          value={quantity} 
          min="1"
          onChange={(e) => setQuantity(e.target.value)} 
        />
      </div>

      {/* 買賣按鈕 */}
      <div className="button-group">
        <button className="btn-buy" onClick={() => handleSubmit('buy')}>買入</button>
        <button className="btn-sell" onClick={() => handleSubmit('sell')}>賣出</button>
      </div>
    </div>
  );
}

export default TradeForm;