import { useState } from 'react';
import { useEffect } from 'react';
import './App.css';
import StockSearch from "../components/StockSearch.jsx";
import TradeForm from "../components/TradeForm.jsx";
import TradePage from '../pages/TradePage.jsx';
import HistoryPage from '../pages/HistoryPage.jsx';
import stockData from './stock.json'

function App() {
  // 1. 狀態管理 ============================================================
  // 目前所在的頁面 (預設為第一頁 'trade')
  const [activeTab, setActiveTab] = useState('trade');
// ==========================================================================

  // 2. 狀態管理：全域交易紀錄record紀錄著所有的交易紀錄
  // useState(()=>{...)只在初次載入時執行一次
  const [records, setRecords] = useState(() => {
    // 在localStorage裡尋找key值'stock_records'的字串資料，然後存入saved常數裡
    const saved = localStorage.getItem('stock_records');
    // console.log(saved)
    // 如果saved有資料，把他從json字串轉換成json陣列物件並且回傳到records裡面，否則給空陣列。
    return saved ? JSON.parse(saved) : [];
  });
  
// ==========================================================================

  // 3. 自動存檔
  // 當records有變化，執行localStorage.setItem
  // 把records陣列先用轉為Json字串後，存入localStorage空間，給予一個key值'stock_records'
  useEffect(() => {
    localStorage.setItem('stock_records', JSON.stringify(records));
  }, [records]);

 // ========================================================================== 

  //  4. 定義新增紀錄的方法handleAddRecord，此方法將交給子組件TradePage處理取得newRecord
  const handleAddRecord = (newRecord) => {
    setRecords(prev=>[...prev,newRecord]);
    alert("已收到李正華小姐的紀錄，祝你發財！");
  };

  // ==========================================================================

  //  5. 定義刪除紀錄的方法handleDeleteRecord，，此方法將交給子組件HistroyPage處理取得newRecord
  const handleDeleteRecord = (id) => {
  if (window.confirm('確定要刪除這筆交易紀錄嗎？')) {
    // window.confirm('內容')讓瀏覽器跳出一個帶有"內容"的視窗，等待使用者按下確認或取消
    // 使用 filter 過濾掉該 ID 的資料，產生一個全新的陣列
    setRecords(prev => prev.filter(record => record.id !== id));
  }
};

// ==========================================================================

  //  6.抓取預先處理好的資料
  // 定義物件資料StockList來儲存台股資訊
  const [stockList] = useState(stockData);

// ==========================================================================

  // 切換頁面的渲染邏輯，顯示主頁面是哪一個
  const renderContent = () => {
    switch (activeTab) {
  // 切換activeTab，是trade就是第一頁，是history是第二頁

      // -----------------------------------------------------
      case 'trade':
        // 把 handleAddRecord 方法(紀錄資料)傳給 TradePage 去處理，並把stockData
        return <TradePage onAddRecord={handleAddRecord} stockList={stockList}/>;
      // -----------------------------------------------------
      case 'history':
        // 這裡要把 App 存的 records 傳下去給第二頁看
        return <HistoryPage records={records} onDelete={handleDeleteRecord} stockList={stockList}/>;
      // -----------------------------------------------------

      default:
        return null;
    }
  };

// ==========================================================================

  return (
    <div className="app-container">
  {/* 先包出一個大邊框，改變裡面的呈現樣貌達成換頁 */}
  {/* 左側邊欄 Sidebar */}
      <nav className="sidebar">

        {/* ====================================================================== */}

        <div className="sidebar-title">台股買賣紀錄本</div>
        {/* 左上角 */}

        {/* ====================================================================== */}

        <button 
          className={`tab-button ${activeTab === 'trade' ? 'active' : ''}`}
                              // 如果activeTab是trade，回傳active，賦予一個屬性，否則回傳空值
                    // 這串讓button的Css設定多一個屬性，可以從tab-button變成tab-button.active
          onClick={() => setActiveTab('trade')}
          // 當點擊按鈕一，執行setActiveTab("trade")
        >
          買賣輸入
        </button>
        {/* 按鈕一 */}

        {/* ====================================================================== */}

        <button 
          className={`tab-button ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          紀錄查詢
        </button>
        {/* 按鈕二 */}

        {/* ====================================================================== */}

      </nav>

  {/* 右側主內容區 */}
      <main className="main-content">
        {renderContent()}
      </main>
    </div>
  );
}

export default App;