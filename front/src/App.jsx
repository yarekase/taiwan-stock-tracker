import { useState, useEffect } from 'react';
import './App.css';
import TradePage from '../pages/TradePage.jsx';
import HistoryPage from '../pages/HistoryPage.jsx';
import AuthPage from '../pages/AuthPage.jsx';
import {fetchStockList, fetchRecords, deleteRecord, postRecord} from './api.js'

function App() {
// 1. 狀態管理 ============================================================
  // 目前所在的頁面 (預設為第一頁 'trade')
  const [activeTab, setActiveTab] = useState('trade');
  // 定義records做交易紀錄
  const [records, setRecords] = useState([]);
  // 定義stockList做台股分析
  const [stockList, setStockList] = useState([]);
  // 定義token，從瀏覽器資料庫讀取，如果沒有則為null
  const [token, setToken] = useState(localStorage.getItem('stock_token') || null);

  // ==========================================================================

// 2. 驗證身分及登出的處理
  // 儲存token以驗證身分
  const handleAuthSuccess = (newToken) => {
    localStorage.setItem('stock_token', newToken); // getItem(key, value)
    setToken(newToken); // 更新狀態，觸發 React 重新渲染切換頁面
  };
  // 最開始沒有token，token會預設為null
  // 當newToken產生時，handleAuthSuccess會把newToken的值存入localStorage(命名為stock_token)，並且重新渲染token的值
  // 下次重整網頁時，預設值便能從localStorage讀取到stock_token對應的值

  // 登出並移除token
  const handleLogout = () => {
    if (window.confirm('確定要登出嗎？')) {
      localStorage.removeItem('stock_token'); // 清除瀏覽器資料庫的Token
      setToken(null); // 將token紀錄移除
      setRecords([]); // 清空紀錄資料
    }
  };

  // ==========================================================================

// 3. 自動存檔
  // 當網站一開啟，先判斷有沒有token
  // 若有，則執行initData去後端資料庫抓取紀錄跟台股紀錄
  useEffect(() => {
    // 如果沒有token，直接跳出
    if (!token) return;

    // 若有token，則代入token來進行動作
    const initData = async () =>{
      try {
        const [recordData, stockListData] = await Promise.all([
          fetchRecords(token),
          fetchStockList()
        ]);

        setRecords(recordData);
        setStockList(stockListData);
      } catch (error) {
        console.error("讀取紀錄失敗，請確認後端",error);
        // 若後端回傳401或過期資訊，則清空token 
        if (error.message.includes("401")|| error.message.includes("過期")){
          setToken(null);
          localStorage.removeItem("stock_token");
        }       
      };
    };

    initData();
  }, [token]);
  // 當token改變時，就得觸發initDate

 // ========================================================================== 

  //  4. 定義新增紀錄的方法handleAddRecord，此方法將交給子組件TradePage處理取得newRecord
  const handleAddRecord = async(newRecord) => {
    try{
      const response = await postRecord(newRecord, token);
      const recordWithId = {
        ...newRecord,
        id:response.recordId
        // 從後端傳來的recordId，在這裡加入放進newRecord裡面
      };
      setRecords(prev=>[...prev,recordWithId]);
      alert("已收到李正華小姐的紀錄，祝你發財！");
    } catch(err){
      console.error("儲存失敗",error);
      alert(`儲存失敗：${error.message}`);
    }};

  // ==========================================================================

  //  5. 定義刪除紀錄的方法handleDeleteRecord，，此方法將交給子組件HistroyPage處理取得newRecord
  const handleDeleteRecord = async (id) => {
  if (window.confirm('確定要刪除這筆交易紀錄嗎？')) {
    // window.confirm('內容')讓瀏覽器跳出一個帶有"內容"的視窗，等待使用者按下確認或取消
    // 使用 filter 過濾掉該 ID 的資料，產生一個全新的陣列
    try{
      // 呼叫後端刪除資料庫裡的資料
      await deleteRecord(id,token);
      // 處理前端渲染的資料
      setRecords(prev => [...prev.filter(record => Number(record.id) !== Number(id))]);
      console.log(`record的數量有${records.length}個`);
    } catch(error){
      alert ('刪除失敗，請確認狀態');
      console.error(error);
    };
    
  }
};

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

  // 如果沒有token，跳轉到登入/註冊頁面
  if (!token) {
    return <AuthPage onAuthSuccess={handleAuthSuccess} />;
  }
  

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

        {/* 登出按鈕 */}
        <div className="sidebar-footer">
          <button className="logout-button" onClick={handleLogout}>
            登出系統
          </button>
        </div>

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