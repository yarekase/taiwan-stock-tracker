// 匯入crawlerForCF的函式=============================
// 對應檔案裡匯出的形式module.exports = { updateAllStocks };
const {updateAllStocks} = require('./crawlerForCF');


export default{
    // 1.進行HTTP請求處理
    async fetch(request, env, ctx){
        return new Response('抓取證交所資料程式正在進行');
    },

    // 2.定時任務處理
    async scheduled(event, env, ctx){
        // evb.DB對應的是wrangler裡的名字
        const db = env.DB;
        ctx.waitUntil(updateAllStocks(db));
    }
};