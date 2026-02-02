import React, { useState } from 'react';
import StockSearch from '../components/StockSearch';
import TradeForm from '../components/TradeForm';
import './TradePage.css';

function TradePage({ onAddRecord, stockList }) {

// ==========================================================================

  // 1. 狀態管理：儲存「目前選中的股票」。一開始是 null，所以第二行會被隱藏。
  const [selectedStock, setSelectedStock] = useState(null);

// ==========================================================================

  // 2. 邏輯處理：當第一行 StockSearch 點擊了某支股票
  const handleSelectStock = (stock) => {
    // 把子組件StockSearch傳上來的 stock 物件存進 State
    // 這會觸發重新渲染，並讓下面的 {selectedStock && ...} 條件成立
    setSelectedStock(stock);
  };

// ==========================================================================

  // 當第二行 TradeForm 按下買入或賣出並送出紀錄時
  const handleFormSubmit = (newRecord) => {
    // 將App傳下來的方法，用nweRecord去執行，新增交易紀錄
    onAddRecord(newRecord);
    
    // 存檔完後的 UX 處理：
    // 清空選中的股票，讓第二行表單消失，回到乾淨的搜尋畫面
    setSelectedStock(null);
  };

// ==========================================================================

  return (
    <div className="trade-page-container">
      <header className="page-header">
        <h1>股票買賣紀錄</h1>
        <p>請先搜尋股票，再輸入交易資料</p>
      </header>

      {/* 第一行：搜尋輸入區 (固定顯示) */}
      <section className="search-section">
        <StockSearch onSelect={handleSelectStock} stockList={stockList}/>
        {/* 呼喚子組件StockSearch，給一個包裝handleSelectStock的函式給參數onSelect讓子組件StockSearch使用 */}
      </section>

      {/* 第二行：交易表單區 (條件渲染) */}
      {/* 只有當 selectedStock 不是 null 的時候，TradeForm 才會被渲染出來 */}
      <section className="form-section">
        {selectedStock ? (
          <TradeForm selectedStock={selectedStock} onSubmit={handleFormSubmit} 
          />
        ) : (
          // 如果還沒選股票，顯示一個淺色的提示框 (優化視覺)
          <div className="empty-form-placeholder">
            等待選定股票...
          </div>
        )}
      </section>

      
    </div>
  );
}

export default TradePage;