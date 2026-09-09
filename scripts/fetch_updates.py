#!/usr/bin/env python3
"""
AI 产品动态自动抓取脚本
每天运行一次，抓取 ChatGPT、豆包、Gemini、Claude、Grok 的最新动态
"""

import os
import re
import sqlite3
import hashlib
from datetime import datetime, timezone
from typing import Optional
from urllib.parse import urljoin, urlparse

import requests
from bs4 import BeautifulSoup

DB_PATH = os.environ.get("DB_PATH", os.path.join(os.path.dirname(__file__), "..", "data", "ai-tracker.db"))
USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"


def init_db():
    """初始化数据库结构"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    cursor.executescript(
        """
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
        """
    )

    products = [
        ("chatgpt", "ChatGPT", "OpenAI 推出的对话式 AI 助手，支持文本、代码、图像等多种任务。", "https://chatgpt.com", "", "#10A37F"),
        ("doubao", "豆包", "字节跳动推出的 AI 助手，覆盖对话、写作、学习、工作等场景。", "https://www.doubao.com", "", "#3A7DFF"),
        ("gemini", "Gemini", "Google DeepMind 开发的多模态 AI 模型，集成搜索与生产力工具。", "https://gemini.google.com", "", "#4285F4"),
        ("claude", "Claude", "Anthropic 开发的 AI 助手，以安全、长上下文和推理能力著称。", "https://claude.ai", "", "#CC785C"),
        ("grok", "Grok", "xAI 开发的 AI 助手，强调实时信息、幽默风格和批判性思维。", "https://grok.x.ai", "", "#000000"),
    ]

    cursor.executemany(
        """
        INSERT OR IGNORE INTO products (slug, name, description, website_url, icon_url, color)
        VALUES (?, ?, ?, ?, ?, ?)
        """,
        products,
    )

    conn.commit()
    conn.close()


def get_product_map():
    """获取产品 slug 到 id 的映射"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT id, slug FROM products")
    product_map = {row[1]: row[0] for row in cursor.fetchall()}
    conn.close()
    return product_map


def save_update(product_id: int, title: str, summary: Optional[str], source_url: Optional[str],
                source_type: str, published_at: Optional[datetime]):
    """保存一条更新，避免重复"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # 基于标题去重
    cursor.execute(
        "SELECT id FROM updates WHERE product_id = ? AND title = ?",
        (product_id, title),
    )
    if cursor.fetchone():
        conn.close()
        return False

    cursor.execute(
        """
        INSERT INTO updates (product_id, title, summary, source_url, source_type, published_at, is_new)
        VALUES (?, ?, ?, ?, ?, ?, 1)
        """,
        (product_id, title, summary, source_url, source_type,
         published_at.isoformat() if published_at else None),
    )

    conn.commit()
    conn.close()
    return True


def fetch_html(url: str) -> Optional[BeautifulSoup]:
    """获取网页并解析为 BeautifulSoup"""
    try:
        headers = {"User-Agent": USER_AGENT}
        response = requests.get(url, headers=headers, timeout=30)
        response.raise_for_status()
        return BeautifulSoup(response.text, "html.parser")
    except Exception as e:
        print(f"Failed to fetch {url}: {e}")
        return None


def parse_date(date_str: str) -> Optional[datetime]:
    """尝试解析多种日期格式"""
    formats = [
        "%Y-%m-%dT%H:%M:%S%z",
        "%Y-%m-%dT%H:%M:%SZ",
        "%Y-%m-%dT%H:%M:%S",
        "%Y-%m-%d",
        "%B %d, %Y",
        "%b %d, %Y",
    ]
    for fmt in formats:
        try:
            return datetime.strptime(date_str.strip(), fmt)
        except ValueError:
            continue
    return None


def fetch_openai_updates(product_id: int):
    """抓取 OpenAI 博客和更新"""
    print("Fetching OpenAI updates...")

    # OpenAI blog
    soup = fetch_html("https://openai.com/news/")
    if soup:
        articles = soup.select("a[href*='/news/']")
        seen = set()
        for article in articles[:10]:
            href = article.get("href")
            if not href or href in seen:
                continue
            seen.add(href)
            title = article.get_text(strip=True)
            if not title or len(title) < 10:
                continue
            url = urljoin("https://openai.com", href)
            save_update(product_id, title, None, url, "blog", datetime.now(timezone.utc))

    # OpenAI changelog
    changelog_soup = fetch_html("https://platform.openai.com/docs/changelog")
    if changelog_soup:
        items = changelog_soup.select("h2, h3")[:5]
        for item in items:
            title = item.get_text(strip=True)
            if title and len(title) > 5:
                save_update(product_id, f"[Changelog] {title}", None,
                           "https://platform.openai.com/docs/changelog", "changelog",
                           datetime.now(timezone.utc))


def fetch_anthropic_updates(product_id: int):
    """抓取 Anthropic / Claude 更新"""
    print("Fetching Anthropic updates...")

    soup = fetch_html("https://www.anthropic.com/news")
    if soup:
        links = soup.select("a[href*='/news/']")
        seen = set()
        for link in links[:10]:
            href = link.get("href")
            if not href or href in seen:
                continue
            seen.add(href)
            title = link.get_text(strip=True)
            if not title or len(title) < 10:
                continue
            url = urljoin("https://www.anthropic.com", href)
            save_update(product_id, title, None, url, "blog", datetime.now(timezone.utc))


def fetch_google_updates(product_id: int):
    """抓取 Gemini / Google AI 更新"""
    print("Fetching Google Gemini updates...")

    # Google AI blog
    soup = fetch_html("https://blog.google/products/gemini/")
    if soup:
        articles = soup.select("article a, a[href*='/gemini/']")
        seen = set()
        for article in articles[:10]:
            href = article.get("href")
            if not href or href in seen:
                continue
            seen.add(href)
            title = article.get_text(strip=True)
            if not title or len(title) < 10:
                continue
            url = urljoin("https://blog.google", href) if href.startswith("/") else href
            save_update(product_id, title, None, url, "blog", datetime.now(timezone.utc))


def fetch_xai_updates(product_id: int):
    """抓取 xAI / Grok 更新"""
    print("Fetching xAI updates...")

    soup = fetch_html("https://x.ai/blog")
    if soup:
        links = soup.select("a[href*='/blog/']")
        seen = set()
        for link in links[:10]:
            href = link.get("href")
            if not href or href in seen:
                continue
            seen.add(href)
            title = link.get_text(strip=True)
            if not title or len(title) < 10:
                continue
            url = urljoin("https://x.ai", href)
            save_update(product_id, title, None, url, "blog", datetime.now(timezone.utc))


def fetch_doubao_updates(product_id: int):
    """抓取豆包更新（官网或新闻源）"""
    print("Fetching Doubao updates...")

    # 豆包官网
    soup = fetch_html("https://www.doubao.com")
    if soup:
        # 尝试抓取页面中可能的公告/更新信息
        texts = []
        for tag in soup.find_all(["h2", "h3", "p"]):
            text = tag.get_text(strip=True)
            if text and 20 < len(text) < 200 and "豆包" in text:
                texts.append(text)

        for text in texts[:5]:
            save_update(product_id, text[:100], text, "https://www.doubao.com", "website",
                       datetime.now(timezone.utc))


def mark_old_updates():
    """将之前标记为新的更新改为旧更新"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("UPDATE updates SET is_new = 0 WHERE is_new = 1")
    conn.commit()
    conn.close()


def main():
    print(f"Starting fetch at {datetime.now(timezone.utc).isoformat()}")
    print(f"Database: {DB_PATH}")

    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    init_db()

    # 先将所有 is_new 置为 0，新抓取的会重新标记为 1
    mark_old_updates()

    product_map = get_product_map()

    fetch_openai_updates(product_map["chatgpt"])
    fetch_anthropic_updates(product_map["claude"])
    fetch_google_updates(product_map["gemini"])
    fetch_xai_updates(product_map["grok"])
    fetch_doubao_updates(product_map["doubao"])

    print("Fetch completed.")


if __name__ == "__main__":
    main()
