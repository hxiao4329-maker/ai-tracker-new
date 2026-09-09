import Database from 'better-sqlite3';
import path from 'path';

const DB_PATH = process.env.DB_PATH || path.join(process.cwd(), 'data', 'ai-tracker.db');

let db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    initSchema(db);
  }
  return db;
}

function initSchema(database: Database.Database) {
  database.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      website_url TEXT,
      icon_url TEXT,
      color TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS sources (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      url TEXT NOT NULL,
      source_type TEXT NOT NULL,
      config TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (product_id) REFERENCES products(id)
    );

    CREATE TABLE IF NOT EXISTS updates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      summary TEXT,
      content TEXT,
      source_url TEXT,
      source_type TEXT NOT NULL,
      published_at DATETIME,
      fetched_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      is_new INTEGER DEFAULT 1,
      FOREIGN KEY (product_id) REFERENCES products(id)
    );

    CREATE INDEX IF NOT EXISTS idx_updates_product_id ON updates(product_id);
    CREATE INDEX IF NOT EXISTS idx_updates_published_at ON updates(published_at DESC);
    CREATE INDEX IF NOT EXISTS idx_updates_fetched_at ON updates(fetched_at DESC);
  `);
}

export function seedProducts() {
  const database = getDb();
  const products = [
    {
      slug: 'chatgpt',
      name: 'ChatGPT',
      description: 'OpenAI 推出的对话式 AI 助手，支持文本、代码、图像等多种任务。',
      website_url: 'https://chatgpt.com',
      icon_url: 'https://upload.wikimedia.org/wikipedia/commons/0/04/ChatGPT_logo.svg',
      color: '#10A37F'
    },
    {
      slug: 'doubao',
      name: '豆包',
      description: '字节跳动推出的 AI 助手，覆盖对话、写作、学习、工作等场景。',
      website_url: 'https://www.doubao.com',
      icon_url: '',
      color: '#3A7DFF'
    },
    {
      slug: 'gemini',
      name: 'Gemini',
      description: 'Google DeepMind 开发的多模态 AI 模型，集成搜索与生产力工具。',
      website_url: 'https://gemini.google.com',
      icon_url: 'https://www.gstatic.com/lamda/images/gemini_sparkle_v002_d4735304ff6292a690345.svg',
      color: '#4285F4'
    },
    {
      slug: 'claude',
      name: 'Claude',
      description: 'Anthropic 开发的 AI 助手，以安全、长上下文和推理能力著称。',
      website_url: 'https://claude.ai',
      icon_url: 'https://upload.wikimedia.org/wikipedia/commons/8/8a/Claude_AI_logo.svg',
      color: '#CC785C'
    },
    {
      slug: 'grok',
      name: 'Grok',
      description: 'xAI 开发的 AI 助手，强调实时信息、幽默风格和批判性思维。',
      website_url: 'https://grok.x.ai',
      icon_url: '',
      color: '#000000'
    }
  ];

  const insert = database.prepare(`
    INSERT OR IGNORE INTO products (slug, name, description, website_url, icon_url, color)
    VALUES (@slug, @name, @description, @website_url, @icon_url, @color)
  `);

  for (const product of products) {
    insert.run(product);
  }
}
