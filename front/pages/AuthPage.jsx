// src/pages/AuthPage.jsx
import { useState } from 'react';
import './AuthPage.css'; // 匯入專用樣式
import { postLogin, postSignup } from '../src/api';

/**
 * 身分驗證頁面 (登入 & 註冊)
 * @param {function} onAuthSuccess - 由APP.jsx傳遞下來的方法，認證成功時呼叫的函式
 */


function AuthPage({ onAuthSuccess }) {
  // 1. 狀態管理 ============================================================
  const [isLogin, setIsLogin] = useState(true); // 切換模式 (預設為登入)
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' }); // 用來顯示成功或錯誤訊息
  // 建立一個loading的狀態，讓點擊下去後的按鈕停止再次被運作
  const [isLoading, setIsLoading] = useState(false);

  // 2. 表單提交邏輯 ==========================================================
  const handleSubmit = async (e) => {
    // 由於<form>標籤的特性是執行的瞬間會對瀏覽器進行重新整理
    // 一旦重新整理，React狀態管理所記憶的值就會全部消失
    // 為了避免此事法生，需要做preventDefault()動作讓
    e.preventDefault(); 
    // 清空訊息並且鎖定按鈕
    setMessage({ type: '', text: '' });
    setIsLoading(true);

    // 基礎格式檢查 (8-15 碼英數字)
    const passwordRegex = /^[A-Za-z0-9]{8,15}$/;
    if (!passwordRegex.test(password)) {
        setMessage({ type: 'error', text: '密碼格式不符 (須為 8-15 碼英數字)' });
        setIsLoading(false);
        return;
    }

    try {
    // 根據是否登入來選擇 API 函式
    const data = isLogin ? await postLogin(email, password) : await postSignup(email, password);

      // 判斷登入狀態與否
      if (isLogin) {
        // 登入成功：取得token
        setMessage({ type: 'success', text: '登入成功！正在導向主頁...' });
        // 顯示訊息，延遲一秒，呼叫 App.jsx 傳下來的函式，將 Token 傳入
        setTimeout(() => onAuthSuccess(data.token), 1000);
      } else {
        // 註冊成功：提示去收信
        setMessage({ type: 'success', text: '註冊成功！請至您的信箱收取驗證信，驗證後即可登入。' });
        // 清空表單，切換到登入模式
        setEmail('');
        setPassword('');
        // 顯示訊息，延遲三秒，跳轉到登入狀態
        setTimeout(() => setIsLogin(true), 3000);
      }
    } catch (error) {
      console.error('Auth Error:', error);
      setMessage({ type: 'error', text: error.message });
      // finally是不管try有沒有成功，都會執行的動作，讓loading狀態鎖定解除
    } finally {
      setIsLoading(false);
    }
  };

  // 3. 渲染畫面 ==============================================================
  return (
    <div className="auth-page-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>台股買賣紀錄本</h1>
          <p>{isLogin ? '歡迎回來，請先登入' : '請使用信箱進行註冊'}</p>
        </div>

        {/* 如果有訊息需要顯示，則顯示訊息 */}
        {message.text && (
          <div className={`auth-message ${message.type}`}>
            {message.text}
          </div>
        )}
        {/* 帳號密碼表單 */}
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            {/*htmlFor在被點擊後，滑鼠游標會自動跳入對應id的輸入框*/}
            <label htmlFor="email">電子信箱</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="請填寫信箱"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">密碼</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="8-15碼英文與數字(區分大小寫)"
              required
            />
          </div>

          <button type="submit" className="auth-submit-btn" disabled={isLoading}>
            {isLoading ? (isLogin ? '登入中...' : '註冊中...') : (isLogin ? '登入' : '註冊')}
          </button>
        </form>

        <div className="auth-footer">
          <button onClick={() => setIsLogin(!isLogin)} className="auth-switch-btn">
            {isLogin ? '還沒有帳號？按此註冊' : '已有帳號？按此登入'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default AuthPage;