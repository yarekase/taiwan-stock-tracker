// src/pages/AuthPage.jsx
import { useState } from 'react';
import './AuthPage.css'; // 匯入專用樣式

/**
 * 身分驗證頁面 (登入 & 註冊)
 * @param {function} onAuthSuccess - 認證成功時呼叫的函式 (用來更新 App.jsx 的 Token)
 */

function AuthPage({ onAuthSuccess }) {
  // 1. 狀態管理 ============================================================
  const [isLogin, setIsLogin] = useState(true); // 切換模式 (預設為登入)
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' }); // 用來顯示成功或錯誤訊息
  const [isLoading, setIsLoading] = useState(false); // 防止重複點擊

  // 2. 表單提交邏輯 ==========================================================
  const handleSubmit = async (e) => {
    e.preventDefault(); // 防止網頁重新載入
    setMessage({ type: '', text: '' });
    setIsLoading(true);

    // 基礎格式檢查 (8-15 碼英數字)
    const passwordRegex = /^[A-Za-z0-9]{8,15}$/;
    if (!passwordRegex.test(password)) {
        setMessage({ type: 'error', text: '密碼格式不符 (須為 8-15 碼英數字)' });
        setIsLoading(false);
        return;
    }

    // 根據模式選擇 API 路徑 (這裡請對應你的 Hono 後端網址)
    const apiUrl = isLogin ? 'http://localhost:8787/api/auth/login' : 'http://localhost:8787/api/auth/signup';

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '認證失敗');
      }

      // 成功處理 -----------------------------------------------------------
      if (isLogin) {
        // 登入成功：拿回 JWT Token
        setMessage({ type: 'success', text: '登入成功！正在導向主頁...' });
        // 呼叫 App.jsx 傳下來的函式，將 Token 存入 localStorage 並更新狀態
        setTimeout(() => onAuthSuccess(data.token), 1000);
      } else {
        // 註冊成功：提示去收信
        setMessage({ type: 'success', text: '註冊成功！請至您的信箱收取驗證信，驗證後即可登入。' });
        // 清空表單，切換到登入模式
        setEmail('');
        setPassword('');
        setTimeout(() => setIsLogin(true), 3000);
      }
    } catch (error) {
      console.error('Auth Error:', error);
      setMessage({ type: 'error', text: error.message });
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
          <p>{isLogin ? '歡迎回來，請先登入' : '立即註冊，開始追蹤您的投資'}</p>
        </div>

        {/* 顯示訊息區域 */}
        {message.text && (
          <div className={`auth-message ${message.type}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">電子信箱</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="yoshua@gmail.com"
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
              placeholder="8-15碼英數字"
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