import app from '../src/index';

// 強制使用 Edge Runtime (支援 fetch API)
export const config = {
  runtime: 'edge',
};

// 匯出 fetch 方法給 Vercel 呼叫
export default app.fetch;