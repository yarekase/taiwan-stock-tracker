// RecordPage.jsx 結構參考

function RecordPage({ onAddRecord }) {
  
// 1. 這裡需要寫 useState 來接住 input 的值 (股票名稱、價格等)
    const [formData,setFormData] = useState({
    stock:"",
    type:"buy",
    date:new Date().toISOString().split('T')[0],
// toISOString() 將日期轉為ISO標準 YYYY-MM-DDTHH:MM:SS
//split("T")從字串(日期)的T拆分成左右邊，取左邊YYYY-MM-DD
    price:"",
    quantity:1,
    });

// 2. 這裡寫一個 handleAdd 函數，點擊按鈕時觸發 onAddRecord
    const handleAdd = () =>
    {
        if(!formData.price || !formData.stock){
            alert("請輸入股票名稱與價格");
        return;}
// 做一個防呆免得忘了輸入股票或價格
    }

  onAddRecord(newRecord);



return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* 第一行：股票搜尋 (Inline style 練習：讓它填滿寬度) */}
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <label style={{ width: '80px' }}>股票代碼</label>
        <input style={{ flex: 1 }} type="text" placeholder="輸入名稱或代碼" />
      </div>

      {/* 第二行：日期、類型、單價、張數 (Inline style 練習：讓它們排成一橫列) */}
      {/* 提示：這裡的外層 div 需要 display: 'flex' */}
      
      {/* 第三行：紀錄完成按鈕 (套用 CSS 裡的 className="submit-btn") */}
    </div>
  );
}

export default RecordPage
