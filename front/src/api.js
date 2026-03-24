// 所有跟後端溝通的程式碼都放在這裡
const api_url = 'https://stock-tracker.ejimtpck.workers.dev/api';

// 讀取台股總紀錄=========================================================
export const fetchStockList = async () =>{
    const response = await fetch(`${api_url}/stocks`);
    // fetch預設為get，因此這裡不用寫{method:'get'}
    if(!response.ok) throw new Error("抓取台股總資料失敗");
    return response.json();
};

// 註冊 API =========================================================
export const postSignup = async (email, password) => {
    const response = await fetch(`${api_url}/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "註冊失敗");
    return data;
};

// 登入 API =========================================================
export const postLogin = async (email, password) => {
    const response = await fetch(`${api_url}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "登入失敗");
    return data; // 這裡會回傳 { token: "..." }
};


// 取得股票資訊=========================================================
export const fetchStock = async (stockId) =>{
    const response = await fetch(`${api_url}/stock/${stockId}`);

    if(!response.ok) throw new Error("找不到股票資訊");
    return response.json();
};


// 讀取股票紀錄=========================================================
export const fetchRecords = async (token) => {
    const response = await fetch(`${api_url}/auth/records`,{
        method: 'GET',
        headers: {'Authorization': `Bearer ${token}` }
    }); //需要攜帶token才能讀取紀錄
    
    if(!response.ok) throw new Error("取得紀錄失敗");
    return response.json();
};


// 儲存股票紀錄=========================================================
export const postRecord = async (record, token) =>{
    // await fetch(url, options)
    // fetch完成以後，會回傳一個物件給response
    const response = await fetch(`${api_url}/auth/records`,{
        method: 'POST',     //讓後端知道這是要做傳送
        headers: {
            'Content-Type':'application/json',  //讓後端知道裡面是json格式的文字
            'Authorization': `Bearer ${token}`
        },  
        body: JSON.stringify(record),       //把JS物件轉換成字串傳送出去
    });
    // 檢查fetch回傳的物件有沒有問題
    if (!response.ok) throw new Error("存入資料失敗");
    // 將fetch物件轉為json物件
    return response.json();
};

// 刪除股票紀錄=========================================================
export const deleteRecord = async (id, token) => {
    const response = await fetch(`${api_url}/auth/records/${id}`,{
        method: 'DELETE',
        headers: {'Authorization': `Bearer ${token}` }
    });

    if (!response.ok){
        const errorData = await response.json();
        throw new Error(errorData.error || "刪除資料失敗，權限不足");}
    return response.json();
};