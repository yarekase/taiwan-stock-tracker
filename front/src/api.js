// 所有跟後端溝通的程式碼都放在這裡
const api_url = 'http://localhost:5000/api';

// 讀取台股總紀錄=========================================================
export const fetchStockList = async () =>{
    const response = await fetch(`${api_url}/stocks`);
    // fetch預設為get，因此這裡不用寫{method:'get'}
    if(!response.ok) throw new Error("抓取台股總資料失敗");
    return response.json();
};

// 取得股票資訊=========================================================
export const fetchStock = async (stockId) =>{
    const response = await fetch(`${api_url}/stock/${stockId}`);

    if(!response.ok) throw new Error("找不到股票資訊");
    return response.json();
};


// 讀取股票紀錄=========================================================
export const fetchRecords = async () => {
    const response = await fetch(`${api_url}/records`); // 對應後端的 GET /api/records
    if(!response.ok) throw new Error("取得紀錄失敗");
    return response.json();
};


// 儲存股票紀錄=========================================================
export const postRecord = async (record) =>{
    // await fetch(url, options)
    // fetch完成以後，會回傳一個物件給response
    const response = await fetch(`${api_url}/records`,{
        method: 'POST',     //讓後端知道這是要做傳送
        headers: {'Content-Type':'application/json'},  //讓後端知道裡面是json格式的文字
        body: JSON.stringify(record),       //把JS物件轉換成字串傳送出去
    });
    // 檢查fetch回傳的物件有沒有問題
    if (!response.ok) throw new Error("存入資料失敗");
    // 將fetch物件轉為json物件
    return response.json();
};

// 刪除股票紀錄=========================================================
export const deleteRecord = async (id) => {
    const response = await fetch(`${api_url}/records/${id}`,{
        method: 'DELETE',
    });

    if (!response.ok) throw new Error("刪除資料失敗");
    return response.json();
};