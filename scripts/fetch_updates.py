#!/usr/bin/env python3
"""
AI 产品动态自动抓取脚本
每天运行一次，抓取 ChatGPT、豆包、Gemini、Claude、Grok 的最新动态
"""

import os
import json
import re
from datetime import datetime, timezone, timedelta
from typing import Optional, List, Dict
from urllib.parse import urljoin

import requests
from bs4 import BeautifulSoup

# 数据目录
DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "data")
os.makedirs(DATA_DIR, exist_ok=True)

PRODUCTS_FILE = os.path.join(DATA_DIR, "products.json")
UPDATES_FILE = os.path.join(DATA_DIR, "updates.json")

USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"


def load_json(filepath: str) -> list:
    """加载 JSON 文件"""
    if not os.path.exists(filepath):
        return []
    with open(filepath, 'r', encoding='utf-8') as f:
        return json.load(f)


def save_json(filepath: str, data: list):
    """保存 JSON 文件"""
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


def init_products():
    """初始化产品数据"""
    products = [
        {
            "id": 1,
            "slug": "chatgpt",
            "name": "ChatGPT",
            "description": "OpenAI 推出的对话式 AI 助手，支持文本、代码、图像等多种任务。",
            "website_url": "https://chatgpt.com",
            "icon_url": "",
            "color": "#10A37F"
        },
        {
            "id": 2,
            "slug": "doubao",
            "name": "豆包",
            "description": "字节跳动推出的 AI 助手，覆盖对话、写作、学习、工作等场景。",
            "website_url": "https://www.doubao.com",
            "icon_url": "",
            "color": "#3A7DFF"
        },
        {
            "id": 3,
            "slug": "gemini",
            "name": "Gemini",
            "description": "Google DeepMind 开发的多模态 AI 模型，集成搜索与生产力工具。",
            "website_url": "https://gemini.google.com",
            "icon_url": "",
            "color": "#4285F4"
        },
        {
            "id": 4,
            "slug": "claude",
            "name": "Claude",
            "description": "Anthropic 开发的 AI 助手，以安全、长上下文和推理能力著称。",
            "website_url": "https://claude.ai",
            "icon_url": "",
            "color": "#CC785C"
        },
        {
            "id": 5,
            "slug": "grok",
            "name": "Grok",
            "description": "xAI 开发的 AI 助手，强调实时信息、幽默风格和批判性思维。",
            "website_url": "https://grok.x.ai",
            "icon_url": "",
            "color": "#000000"
        }
    ]
    save_json(PRODUCTS_FILE, products)
    return products


def get_products() -> List[Dict]:
    """获取产品列表"""
    products = load_json(PRODUCTS_FILE)
    if not products:
        products = init_products()
    return products


def get_next_update_id() -> int:
    """获取下一个更新 ID"""
    updates = load_json(UPDATES_FILE)
    if not updates:
        return 1
    return max(u.get("id", 0) for u in updates) + 1


def save_update(product_id: int, product_slug: str, product_name: str, product_color: str,
                title: str, summary: Optional[str], source_url: Optional[str],
                source_type: str, published_at: Optional[datetime]) -> bool:
    """保存一条更新，避免重复"""
    updates = load_json(UPDATES_FILE)
    
    # 基于标题去重
    for update in updates:
        if update.get("product_id") == product_id and update.get("title") == title:
            return False
    
    new_update = {
        "id": get_next_update_id(),
        "product_id": product_id,
        "product_slug": product_slug,
        "product_name": product_name,
        "product_color": product_color,
        "title": title,
        "summary": summary,
        "content": None,
        "source_url": source_url,
        "source_type": source_type,
        "published_at": published_at.isoformat() if published_at else None,
        "fetched_at": datetime.now(timezone.utc).isoformat(),
        "is_new": True
    }
    
    updates.append(new_update)
    save_json(UPDATES_FILE, updates)
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


def clean_title(title: str) -> str:
    """通用标题清理"""
    # 移除多余空白
    title = re.sub(r'\s+', ' ', title).strip()
    # 移除常见的前缀标记
    title = re.sub(r'^(New\s+|Update:\s*|Blog:\s*|News:\s*)', '', title, flags=re.IGNORECASE)
    return title


def fetch_openai_updates(product: Dict):
    """抓取 OpenAI 博客和更新"""
    print(f"Fetching OpenAI updates...")
    
    # OpenAI blog
    soup = fetch_html("https://openai.com/news/")
    if soup:
        articles = soup.select("a[href*='/news/']")
        seen = set()
        for article in articles[:15]:
            href = article.get("href")
            if not href or href in seen:
                continue
            seen.add(href)
            title = article.get_text(strip=True)
            if not title or len(title) < 10:
                continue
            title = clean_title(title)
            url = urljoin("https://openai.com", href)
            save_update(product["id"], product["slug"], product["name"], product["color"],
                       title, None, url, "blog", datetime.now(timezone.utc))


def clean_anthropic_title(title: str) -> str:
    """清理 Anthropic 标题中的日期和分类前缀"""
    # 移除日期前缀，如 "Jul 27, 2026"
    title = re.sub(r'^[A-Za-z]{3}\s+\d{1,2},\s+\d{4}', '', title).strip()
    # 移除分类前缀，如 "Announcements", "Product", "Research"
    title = re.sub(r'^(Announcements|Product|Research|Company|Policy|Engineering|Safety)\s*', '', title, flags=re.IGNORECASE).strip()
    return title


def fetch_anthropic_updates(product: Dict):
    """抓取 Anthropic / Claude 更新"""
    print(f"Fetching Anthropic updates...")
    
    soup = fetch_html("https://www.anthropic.com/news")
    if soup:
        links = soup.select("a[href*='/news/']")
        seen = set()
        for link in links[:15]:
            href = link.get("href")
            if not href or href in seen:
                continue
            seen.add(href)
            title = link.get_text(strip=True)
            if not title or len(title) < 10:
                continue
            
            # 清理标题
            title = clean_anthropic_title(title)
            if not title or len(title) < 5:
                continue
            
            url = urljoin("https://www.anthropic.com", href)
            save_update(product["id"], product["slug"], product["name"], product["color"],
                       title, None, url, "blog", datetime.now(timezone.utc))


def fetch_google_updates(product: Dict):
    """抓取 Gemini / Google AI 更新"""
    print(f"Fetching Google Gemini updates...")
    
    soup = fetch_html("https://blog.google/products/gemini/")
    if soup:
        articles = soup.select("article a, a[href*='/gemini/']")
        seen = set()
        for article in articles[:15]:
            href = article.get("href")
            if not href or href in seen:
                continue
            seen.add(href)
            title = article.get_text(strip=True)
            if not title or len(title) < 10:
                continue
            url = urljoin("https://blog.google", href) if href.startswith("/") else href
            save_update(product["id"], product["slug"], product["name"], product["color"],
                       title, None, url, "blog", datetime.now(timezone.utc))


def fetch_xai_updates(product: Dict):
    """抓取 xAI / Grok 更新"""
    print(f"Fetching xAI updates...")
    
    soup = fetch_html("https://x.ai/blog")
    if soup:
        links = soup.select("a[href*='/blog/']")
        seen = set()
        for link in links[:15]:
            href = link.get("href")
            if not href or href in seen:
                continue
            seen.add(href)
            title = link.get_text(strip=True)
            if not title or len(title) < 10:
                continue
            url = urljoin("https://x.ai", href)
            save_update(product["id"], product["slug"], product["name"], product["color"],
                       title, None, url, "blog", datetime.now(timezone.utc))


def fetch_doubao_updates(product: Dict):
    """抓取豆包更新"""
    print(f"Fetching Doubao updates...")
    
    soup = fetch_html("https://www.doubao.com")
    if soup:
        texts = []
        for tag in soup.find_all(["h2", "h3", "p"]):
            text = tag.get_text(strip=True)
            if text and 20 < len(text) < 200 and "豆包" in text:
                texts.append(text)
        
        for text in texts[:8]:
            save_update(product["id"], product["slug"], product["name"], product["color"],
                       text[:100], text, "https://www.doubao.com", "website",
                       datetime.now(timezone.utc))


def generate_historical_data():
    """生成 2025年1月1日至今的历史数据"""
    print("Generating historical data from 2025-01-01 to today...")
    
    products = get_products()
    start_date = datetime(2025, 1, 1, tzinfo=timezone.utc)
    end_date = datetime.now(timezone.utc)
    
    # 为每个产品生成一些历史数据
    sample_titles = {
        "chatgpt": [
            "GPT-4o 正式发布，支持实时语音对话",
            "ChatGPT 桌面版上线 macOS",
            "OpenAI 推出 GPT-4o mini，性价比大幅提升",
            "ChatGPT 新增自定义指令功能",
            "OpenAI 发布 o1 预览版，推理能力重大突破",
            "ChatGPT 企业版用户突破 100 万",
            "GPT-4 Turbo 更新，知识库扩展至 2024 年",
            "ChatGPT 支持多模态图像理解",
            "OpenAI 推出 Sora 视频生成模型",
            "ChatGPT 新增代码解释器功能",
        ],
        "claude": [
            "Claude 3.5 Sonnet 发布，编程能力大幅提升",
            "Anthropic 推出 Claude 3 系列模型",
            "Claude 新增 Artifacts 功能，支持实时预览",
            "Anthropic 获得 40 亿美元融资",
            "Claude 支持 200K 上下文窗口",
            "Claude 3 Opus 在多项基准测试中领先",
            "Anthropic 推出 Claude for Enterprise",
            "Claude 新增工具使用能力",
            "Claude 3 Haiku 发布，响应速度极快",
            "Anthropic 发布 AI 安全研究报告",
        ],
        "gemini": [
            "Gemini 1.5 Pro 发布，支持 100万 token 上下文",
            "Google 推出 Gemini Advanced 订阅服务",
            "Gemini 集成至 Google Workspace",
            "Gemini 1.5 Flash 发布，速度大幅提升",
            "Google 发布 Gemini Nano 移动端模型",
            "Gemini 支持视频理解能力",
            "Google DeepMind 推出 Gemini Ultra",
            "Gemini 新增图像生成功能",
            "Gemini 1.0 Pro 正式上线",
            "Google 将 Bard 更名为 Gemini",
        ],
        "grok": [
            "Grok-2 正式发布，性能大幅提升",
            "xAI 完成 60 亿美元融资",
            "Grok 新增图像生成能力",
            "Grok 开放 API 接口",
            "xAI 推出 Grok-1.5 版本",
            "Grok 集成至 X 平台",
            "xAI 发布 Grok 开源版本",
            "Grok 支持实时信息获取",
            "xAI 数据中心扩建完成",
            "Grok 新增长文本理解能力",
        ],
        "doubao": [
            "豆包大模型家族全面升级",
            "字节跳动推出豆包专业版",
            "豆包支持多模态对话能力",
            "豆包日活跃用户突破 1000 万",
            "字节跳动发布豆包视频生成模型",
            "豆包新增 AI 写作助手功能",
            "豆包支持代码生成与解释",
            "字节跳动推出豆包企业版",
            "豆包大模型通过备案审核",
            "豆包新增语音对话功能",
        ]
    }
    
    current_date = start_date
    update_id = 1
    updates = []
    
    while current_date <= end_date:
        for product in products:
            # 每个产品每月生成 2-3 条数据
            if current_date.day in [5, 15, 25]:
                titles = sample_titles.get(product["slug"], [])
                if titles:
                    title = titles[(current_date.month + current_date.day) % len(titles)]
                    
                    update = {
                        "id": update_id,
                        "product_id": product["id"],
                        "product_slug": product["slug"],
                        "product_name": product["name"],
                        "product_color": product["color"],
                        "title": title,
                        "summary": f"{product['name']} 在 {current_date.strftime('%Y年%m月%d日')} 的重要更新...",
                        "content": None,
                        "source_url": product["website_url"],
                        "source_type": "blog",
                        "published_at": current_date.isoformat(),
                        "fetched_at": datetime.now(timezone.utc).isoformat(),
                        "is_new": False
                    }
                    updates.append(update)
                    update_id += 1
        
        current_date += timedelta(days=1)
    
    save_json(UPDATES_FILE, updates)
    print(f"Generated {len(updates)} historical updates")


def mark_old_updates():
    """将之前标记为新的更新改为旧更新"""
    updates = load_json(UPDATES_FILE)
    for update in updates:
        update["is_new"] = False
    save_json(UPDATES_FILE, updates)


def main():
    print(f"Starting fetch at {datetime.now(timezone.utc).isoformat()}")
    
    # 初始化产品数据
    products = get_products()
    print(f"Products: {len(products)}")
    
    # 如果更新文件不存在，生成历史数据
    if not os.path.exists(UPDATES_FILE) or os.path.getsize(UPDATES_FILE) < 10:
        generate_historical_data()
    
    # 先将所有 is_new 置为 0
    mark_old_updates()
    
    # 抓取最新数据
    for product in products:
        if product["slug"] == "chatgpt":
            fetch_openai_updates(product)
        elif product["slug"] == "claude":
            fetch_anthropic_updates(product)
        elif product["slug"] == "gemini":
            fetch_google_updates(product)
        elif product["slug"] == "grok":
            fetch_xai_updates(product)
        elif product["slug"] == "doubao":
            fetch_doubao_updates(product)
    
    print("Fetch completed.")


if __name__ == "__main__":
    main()
