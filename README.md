# AI 动态追踪

每天自动追踪主流 AI 产品的最新动态、功能更新与发布内容。

## 追踪的产品

| 产品 | 官网 |
|------|------|
| ChatGPT | https://chatgpt.com |
| 豆包 | https://www.doubao.com |
| Gemini | https://gemini.google.com |
| Claude | https://claude.ai |
| Grok | https://grok.x.ai |

## 技术栈

- **前端**: Next.js 14 + Tailwind CSS + TypeScript
- **数据库**: SQLite（单文件，易维护）
- **爬虫**: Python + requests + BeautifulSoup
- **定时调度**: GitHub Actions（每天自动运行）
- **部署**: Vercel（静态导出）

## 自动化流程

1. GitHub Actions 每天 UTC 02:00（北京时间 10:00）运行 Python 爬虫
2. 抓取各产品最新动态 → 写入 SQLite 数据库
3. 变更提交到仓库
4. Vercel 自动重新部署展示最新内容

## 本地开发

```bash
# 安装依赖
npm install

# 运行开发服务器
npm run dev

# 构建
npm run build

# 运行爬虫（手动触发）
pip install -r scripts/requirements.txt
python scripts/fetch_updates.py
```

## 部署

1. Fork 此仓库到 GitHub
2. 在 Vercel 导入项目
3. 配置环境变量（如需自定义数据库路径）
4. 每次爬虫运行后自动重新部署
