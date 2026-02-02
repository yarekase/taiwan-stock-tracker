import React, { useState } from 'react';
import './HistoryPage.css';

function HistoryPage({ records, onDelete, stockList }) { // 從 App 接收資料 (Prop)

// ====================================================================
  // 定義篩選股票的代碼
  const [filterId, setFilterId] = useState(""); // 記錄選中的代碼

// ====================================================================

  // 處理排序
  // 過濾資料：根據搜尋文字過濾 records，並按日期從新到舊排序
  const displayRecords = (filterId 
    ? records.filter(r => r.stockId === filterId):[...records])
    .sort((a, b) => new Date(b.date) - new Date(a.date)); // 日期降序
    // .sort會陣列做排序，把資料a跟資料b做比較，如果運算結果為正，b放前面，為負則a放前面
    // 我用id來做比較，當時是取用date.now()時間戳記獲取值可以精準分出資料的先後順序
    // b-a做比較，若為正數，那b(較大的值)就會放在前面，得到把資料從最新的排到舊的陣列排序
    // 對records篩選後的陣列資料放入displayRecords裡，好拿去做表格處理，不污染原始資料。

// ====================================================================

  // 定義計算總損益的方法
  const profit = displayRecords.reduce((acc, cur) =>{
    // reduce(acc,cur)目的為將多筆資料合而為一，acc是累加器，cur則為目標資料裡的每一筆資料
    // 把資料整理成totalBuy跟totalSell兩個屬性，並且丟進profit
    if (cur.type === "buy") {
      // 用records陣列裡的type來確認資料是買還是賣
      acc.totalBuy += cur.total;
      acc.buyQuantity += cur.quantity;
      // 把cur的資料累加進去買入的acc裡
    }
    else {
      acc.totalSell += cur.total;
      acc.sellQuantity += cur.quantity;
      // 把cur的資料累加進去賣出的acc裡
    }
    return acc;
  },{totalBuy:0,totalSell:0,buyQuantity:0,sellQuantity:0});
  // reduce需要設定參數的屬性初始值，否則計算可能會出問題

  // 然後得到淨投資
  const netProfit = profit.totalSell - profit.totalBuy;
  const reserve = profit.buyQuantity - profit.sellQuantity;

// ====================================================================

  // --- 5. 取得不重複的與購買股票清單 ---
  // records.map(r => r.stockId)把records的股票代碼拉出來排列
  // new Set()組合用法，用set把重複的資料移除，放進new成為物件，此時他只會是一個無序集合
  // [...()]等同於Array.from，將set物件，重新整理成一個陣列
  const ownedStocks = [...(new Set(records.map(r => r.stockId)))]
  // 把排列的代碼分別放入"id"裡，尋找stockId跟id相同的資料，把id跟stockname放進相應的位置產生新的陣列
    .map(id=>{
      const clearRecord = records.find(r=>r.stockId === id);
      return {stockId: id, stockName: clearRecord.stockName};
    });

// ====================================================================

  return (
    <div className="history-page">
      <header className='history-header'>
        <h2>交易歷史紀錄</h2>
      </header>

{/* =================================================================== */}

      {/* 統計看板 */}
      <div className='profit-container'>
        <div className='profit-card'> {/* 買入總額 */}
          <label>累積買入總額</label>
          <div className='value buy'>
            ${profit.totalBuy.toLocaleString()}
          </div>
        </div>

        <div className='profit-card'> {/* 賣出總額 */}
          <label>累積賣出總額</label>
          <div className='value sell'>
            ${profit.totalSell.toLocaleString()}
          </div>
        </div>

        <div className='profit-card'> {/* 結算總獲益 */}
          <label>目前結算總獲益</label>
          <div className='value sell'>
            ${netProfit.toLocaleString()}
          </div>
        </div>

      </div>

{/* =================================================================== */}

      {/* 篩選列 */}
      <div className="filter-section">
        <select placeholder="篩選特定股票" value={filterId} onChange={(e) => setFilterId(e.target.value)}>
            <option value="">全部顯示</option>
            {ownedStocks.map(stock=>(
              <option key={stock.stockId} value={stock.stockId}>
                {stock.stockId} {stock.stockName}
              </option>
            ))}
        </select>

        {/* 當有filterId時，顯示庫存 */}
        {filterId && (
          <span className="reserve-info">
            庫存量：<strong>{reserve.toLocaleString()}</strong> 張
          </span>
          )}

      </div>

{/* =================================================================== */}

      {/* 資料表格 */}{/* <thead>是Table head/<tr>這個標籤裡面為表格裡的同一行/<th>放表格最上面那行標題格子 */}
      <table className="record-table">
        <thead>          
          <tr>
            <th>日期</th>
            <th>股票</th>
            <th>類型</th>
            <th>單價</th>
            <th>張數</th>
            <th>總金額</th>
            <th>刪除</th>
          </tr>          
        </thead>
      {/* Table body */}
        <tbody>  
          {displayRecords.length > 0 ? (
            displayRecords.map((item) => (
                // 對displayRecords(篩選後的Records)做map逐行做處理
                // 用map需要把每個資料做一個key
              <tr key={item.id}> 
                <td>{item.date}</td>
                <td>{item.stockId} {item.stockName}</td>
                <td className={item.type === 'buy' ? 'text-blue' : 'text-black'}>
                  {item.type === 'buy' ? '買入' : '賣出'}
                </td>
                <td>{item.price}</td>
                <td>{item.quantity}</td>
                <td>${item.total.toLocaleString()}</td>
                <td>
                  <button 
                    className="btn-delete" 
                    onClick={() => onDelete(item.id)}>
                    刪除
                  </button>
              </td>
              </tr>
              // {/* toLocaleString用在純數字可以加上千分號，可用可不用 */}
                // {/* <th>放表格最中間那幾行資料格子 */}
            ))
          ) : (
            <tr><td colSpan="6">目前尚無成交紀錄</td></tr>
            // colSpan是合併儲存格，合併六個格子，寫上目前尚無成交紀錄
          )}
        </tbody>
      </table>

{/* =================================================================== */}

    </div>
  );
}

export default HistoryPage;