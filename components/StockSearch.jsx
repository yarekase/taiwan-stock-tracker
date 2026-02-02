import { useState, useEffect } from 'react';
// 沒加括號的，代表導出react裡預設的封包，因為是預設所以其實命名無所謂，而加入括號則是裡面特定的封包
import './StockSearch.css';

function StockSearch({ onSelect, stockList}) {

// ==========================================================================

  const [query, setQuery] = useState('');
//   每次在輸入框裡所打字，就會把整個字串儲存起來，預設為空字串
  const [results, setResults] = useState([]);
//   把篩選後的結果儲存到results

// ==========================================================================

  // 當使用者輸入時，進行搜尋
  useEffect(() => {
    // 使用.trim()是將前後的無效空格給消除，如果有資料會回傳true執行下列篩選動作
    if ((query.trim()).length <2) {
      setResults([]);
      return;}
    
    // 把搜尋框裡代號開頭相符，或名稱包含在內的股票，放入filtered，並渲染給results
    const filtered = stockList.filter(stock =>
      stock.id.startsWith(query) || stock.name.includes(query)
      ).slice(0,8);
    setResults(filtered);
  }, [query,stockList]); //useEffect的啟動條件

// ==========================================================================
  
  return (
    <div className="search-container">

      {/* ========================================= */}
      
      <div className="search-row">      
        <label>股票搜尋：</label>
        <input 
          type="text" 
          placeholder="輸入代碼或名字..." 
          value={query}
          // 把query的內容傳送給value，這是單純顯示在輸入框上的內容，不是下方的.value
          onChange={(e) => setQuery(e.target.value)}
          // onChange屬性：當有資料變化時觸發此屬性執行此動作
          // 在取得e.target(此處為input本身)的.value的內容時，透過e去執行setQuery(內容)這個動作，最後更新query的值
        />
      </div>

      {/* ========================================= */}

      {/* 第三行顯示列：搜尋結果清單 */}
      {results.length > 0 && (
        // 1.在HTML回傳裡面不能寫if判斷式。2.空集合也會給true，因此需要用資料長度去判斷。
        <ul className="results-dropdown">
          {results.map((stock) => (
            // 用map來整理results
            <li key={stock.id} onClick={() => {
              // 每一筆資料都需要獨一無二的key值，這裡用id來擔任，沒有變動的key就不會去更新渲染
              onSelect(stock); // 選定股票，產生stock，呼叫onSelect傳遞回父組件TradePage
              setResults([]);  // 選完後清空列表
              setQuery('');    // 清空輸入框
            }}>
              <span>{stock.id}</span>
              <span>{stock.name}</span>
              <span className="stock-price">${stock.currentPrice}</span>
              {/* span不會換行，是行內標籤 */}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default StockSearch;