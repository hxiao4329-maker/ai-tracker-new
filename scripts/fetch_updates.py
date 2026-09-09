#!/usr/bin/env python3
"""
AI 产品动态自动抓取脚本
每天运行一次，抓取 ChatGPT、豆包、Gemini、Claude、Grok 的最新动态

用法:
  python scripts/fetch_updates.py              # 增量抓取(保留现有数据)
  python scripts/fetch_updates.py --reset      # 清空并重新生成全部数据
  python scripts/fetch_updates.py --skip-fetch # 只重新生成历史+标记最新,不联网抓取
"""

import os
import sys
import json
import random
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
            "icon": "💬",
            "color": "#10A37F"
        },
        {
            "id": 2,
            "slug": "doubao",
            "name": "豆包",
            "description": "字节跳动推出的 AI 助手，覆盖对话、写作、学习、工作等场景。",
            "website_url": "https://www.doubao.com",
            "icon_url": "",
            "icon": "🥟",
            "color": "#3A7DFF"
        },
        {
            "id": 3,
            "slug": "gemini",
            "name": "Gemini",
            "description": "Google DeepMind 开发的多模态 AI 模型，集成搜索与生产力工具。",
            "website_url": "https://gemini.google.com",
            "icon_url": "",
            "icon": "♊",
            "color": "#4285F4"
        },
        {
            "id": 4,
            "slug": "claude",
            "name": "Claude",
            "description": "Anthropic 开发的 AI 助手，以安全、长上下文和推理能力著称。",
            "website_url": "https://claude.ai",
            "icon_url": "",
            "icon": "🧠",
            "color": "#CC785C"
        },
        {
            "id": 5,
            "slug": "grok",
            "name": "Grok",
            "description": "xAI 开发的 AI 助手，强调实时信息、幽默风格和批判性思维。",
            "website_url": "https://grok.x.ai",
            "icon_url": "",
            "icon": "🚀",
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
        "%b %d, %Y · %I:%M %p %Z",
    ]
    for fmt in formats:
        try:
            return datetime.strptime(date_str.strip(), fmt)
        except ValueError:
            continue
    return None


def extract_article_date(soup: BeautifulSoup, url: str) -> Optional[datetime]:
    """从文章页面提取真实发布日期"""
    if not soup:
        return None
    
    # 1. 尝试 meta 标签
    for meta_name in ["article:published_time", "published_time", "datePublished", "og:article:published_time"]:
        meta = soup.find("meta", property=meta_name) or soup.find("meta", attrs={"name": meta_name})
        if meta and meta.get("content"):
            date = parse_date(meta["content"])
            if date:
                return date
    
    # 2. 尝试 JSON-LD
    for script in soup.find_all("script", type="application/ld+json"):
        try:
            data = json.loads(script.string or "{}")
            if isinstance(data, dict):
                date_str = data.get("datePublished") or data.get("dateCreated")
                if date_str:
                    date = parse_date(date_str)
                    if date:
                        return date
            elif isinstance(data, list):
                for item in data:
                    if isinstance(item, dict):
                        date_str = item.get("datePublished") or item.get("dateCreated")
                        if date_str:
                            date = parse_date(date_str)
                            if date:
                                return date
        except Exception:
            pass
    
    # 3. 尝试时间元素
    time_el = soup.find("time")
    if time_el and time_el.get_text(strip=True):
        date = parse_date(time_el.get_text(strip=True))
        if date:
            return date
        datetime_attr = time_el.get("datetime")
        if datetime_attr:
            date = parse_date(datetime_attr)
            if date:
                return date
    
    # 4. Anthropic 特殊处理
    for text in soup.stripped_strings:
        # 匹配 "Jul 27, 2026" 格式
        match = re.search(r'([A-Za-z]{3}\s+\d{1,2},\s+\d{4})', text)
        if match:
            date = parse_date(match.group(1))
            if date:
                return date
    
    return None


def clean_title(title: str) -> str:
    """通用标题清理"""
    # 移除多余空白
    title = re.sub(r'\s+', ' ', title).strip()
    # 移除常见的前缀标记
    title = re.sub(r'^(New\s+|Update:\s*|Blog:\s*|News:\s*)', '', title, flags=re.IGNORECASE)
    return title


def extract_openai_article_info(url: str) -> Optional[Dict[str, str]]:
    """从 OpenAI 文章页提取标题和摘要"""
    soup = fetch_html(url)
    if not soup:
        return None
    
    # 标题
    title = None
    h1 = soup.find("h1")
    if h1:
        title = h1.get_text(strip=True)
    else:
        # 从 title tag 提取
        title_tag = soup.find("title")
        if title_tag:
            title = title_tag.get_text(strip=True).replace(" | OpenAI", "")
    
    if not title or len(title) < 5:
        return None
    
    # 找一段描述/摘要
    summary = None
    desc = soup.find("meta", attrs={"name": "description"})
    if desc and desc.get("content"):
        summary = desc["content"]
    
    return {"title": title, "summary": summary}


def fetch_openai_updates(product: Dict):
    """抓取 OpenAI 博客和更新"""
    print(f"Fetching OpenAI updates...")
    
    # OpenAI blog - 只抓取 /index/ 文章链接，过滤掉 /news/ 分类导航
    soup = fetch_html("https://openai.com/news/")
    seen = set()
    
    if soup:
        # 1. 抓取页面主体中的 /index/ 文章卡片
        articles = soup.select("a[href*='/index/']")
        for article in articles[:25]:
            href = article.get("href")
            if not href or href in seen:
                continue
            seen.add(href)
            title = article.get_text(strip=True)
            if not title or len(title) < 10 or len(title) > 150:
                continue
            
            # 过滤分类/标签标题（兜底）
            skip_keywords = [
                "applied ai", "ai adoption", "careers", "company", "research",
                "safety", "products", "events", "all stories", "load more",
                "research index", "research overview", "economic research",
                "safety approach", "deployment safety", "security & privacy",
                "trust & transparency", "release notes"
            ]
            title_lower = title.lower()
            if title_lower in skip_keywords:
                continue
            
            # 移除标题中附加的分类标签（如 "Applied AISep 8, 2026"）
            title = re.sub(r'(Company|Research|Product|Safety|Security|Engineering|Applied AI|AI Adoption|Intelligence Age|Global Affairs)\s*(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{1,2},\s+\d{4}$', '', title).strip()
            title = clean_title(title)
            if not title:
                continue
            
            url = urljoin("https://openai.com", href)
            save_update(product["id"], product["slug"], product["name"], product["color"],
                       title, None, url, "blog", datetime.now(timezone.utc))
        
        # 2. 抓取 "Latest Advancements" 侧边栏里的模型发布链接 (GPT-6 / GPT-5.6 等)
        advancement_links = soup.select('a[href*="/index/gpt-"]')
        for link in advancement_links[:10]:
            href = link.get("href")
            if not href or href in seen:
                continue
            seen.add(href)
            title = link.get_text(strip=True)
            if not title or len(title) < 3 or len(title) > 100:
                continue
            
            # 把 "GPT-6" 这种短标题扩展成更完整的标题
            slug_title = title.strip()
            if re.match(r'^GPT-[\d\.]+$', slug_title):
                slug_title = f"{slug_title} 正式发布"
            
            url = urljoin("https://openai.com", href)
            save_update(product["id"], product["slug"], product["name"], product["color"],
                       slug_title, None, url, "blog", datetime.now(timezone.utc))
    
    # 3. 额外抓取已知的重大模型发布页面（首页侧边栏可能不显示全部）
    # 顺序：旧版本在前，GPT-6 最后，这样 fetched_at 最新，会被标记为 is_new
    known_model_pages = [
        "https://openai.com/index/introducing-gpt-5-4/",
        "https://openai.com/index/introducing-gpt-5-5/",
        "https://openai.com/index/gpt-6-astra/",
    ]
    for url in known_model_pages:
        if url in seen:
            continue
        seen.add(url)
        info = extract_openai_article_info(url)
        if info and info["title"]:
            title = info["title"].replace(" | OpenAI", "").strip()
            save_update(product["id"], product["slug"], product["name"], product["color"],
                       title, info.get("summary"), url, "blog", datetime.now(timezone.utc))


def clean_anthropic_title(title: str) -> str:
    """清理 Anthropic 标题中的日期和分类前缀"""
    # 移除日期前缀，如 "Jul 27, 2026"
    title = re.sub(r'^[A-Za-z]{3}\s+\d{1,2},\s+\d{4}', '', title).strip()
    # 移除分类前缀，如 "Announcements", "Product", "Research"
    title = re.sub(r'^(Announcements|Product|Research|Company|Policy|Engineering|Safety)\s*', '', title, flags=re.IGNORECASE).strip()
    return title


def extract_anthropic_date(link) -> Optional[datetime]:
    """从 Anthropic 链接的父元素中提取日期"""
    try:
        parent = link.find_parent()
        for _ in range(5):
            if not parent:
                break
            text = parent.get_text(" ", strip=True)
            # 匹配日期格式如 "Jul 27, 2026"
            match = re.search(r'(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{1,2},\s+\d{4}', text)
            if match:
                return parse_date(match.group(0))
            parent = parent.find_parent()
    except Exception:
        pass
    return None


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
            
            # 提取真实发布日期
            published_at = extract_anthropic_date(link) or datetime.now(timezone.utc)
            
            url = urljoin("https://www.anthropic.com", href)
            save_update(product["id"], product["slug"], product["name"], product["color"],
                       title, None, url, "blog", published_at)


def fetch_google_updates(product: Dict):
    """抓取 Gemini / Google AI 更新"""
    print(f"Fetching Google Gemini updates...")
    
    soup = fetch_html("https://blog.google/products/gemini/")
    if soup:
        articles = soup.select("article a, a[href*='/gemini/']")
        seen = set()
        for article in articles[:20]:
            href = article.get("href")
            if not href or href in seen:
                continue
            seen.add(href)
            title = article.get_text(strip=True)
            if not title or len(title) < 10:
                continue
            
            # 过滤掉 Pixel、Android 等非 Gemini 核心内容
            skip_keywords = [
                "pixel drop", "pixel ", "android ", "june pixel", "march pixel",
                "august pixel", "september pixel", "pixel feature", "made by google"
            ]
            title_lower = title.lower()
            if any(kw in title_lower for kw in skip_keywords):
                continue
            
            url = urljoin("https://blog.google", href) if href.startswith("/") else href
            save_update(product["id"], product["slug"], product["name"], product["color"],
                       title, None, url, "blog", datetime.now(timezone.utc))


def fetch_xai_updates(product: Dict):
    """抓取 xAI / Grok 更新"""
    print(f"Fetching xAI updates...")
    
    # xAI 博客
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
    
    # xAI 官网新闻
    soup = fetch_html("https://x.ai/")
    if soup:
        links = soup.select("a[href]")
        seen = set()
        for link in links[:30]:
            href = link.get("href", "")
            title = link.get_text(strip=True)
            if not href or href in seen or len(title) < 15 or len(title) > 120:
                continue
            seen.add(href)
            # 只保留可能包含新闻/更新的链接
            if any(kw in href.lower() for kw in ["/blog/", "/news", "/article"]):
                url = urljoin("https://x.ai", href)
                save_update(product["id"], product["slug"], product["name"], product["color"],
                           title, None, url, "blog", datetime.now(timezone.utc))


def fetch_doubao_updates(product: Dict):
    """抓取豆包更新"""
    print(f"Fetching Doubao updates...")
    
    # 尝试豆包帮助中心/新闻动态
    urls_to_try = [
        "https://www.doubao.com",
        "https://www.doubao.com/chat/",
        "https://www.volcengine.com/product/doubao"
    ]
    
    seen = set()
    for page_url in urls_to_try:
        soup = fetch_html(page_url)
        if not soup:
            continue
        for tag in soup.find_all(["h2", "h3", "h4", "p", "a"]):
            text = tag.get_text(strip=True)
            if text and 20 < len(text) < 150 and "豆包" in text and text not in seen:
                href = tag.get("href") if tag.name == "a" else None
                source_url = urljoin(page_url, href) if href else page_url
                seen.add(text)
                save_update(product["id"], product["slug"], product["name"], product["color"],
                           text[:80], text[:200], source_url, "website",
                           datetime.now(timezone.utc))
                if len(seen) >= 10:
                    return


def generate_historical_data():
    """生成 2025年1月1日至今的历史数据"""
    print("Generating historical data from 2025-01-01 to today...")
    
    products = get_products()
    start_date = datetime(2025, 1, 1, tzinfo=timezone.utc)
    end_date = datetime.now(timezone.utc)
    
    # 为每个产品生成一些历史数据
    sample_titles = {
        "chatgpt": [
            "GPT-6 正式发布：Astra 架构带来更强推理能力",
            "ChatGPT Images 2.5 发布：图像生成质量大幅提升",
            "GPT-5.6 Sol 帮助运行量子计算实验",
            "GPT-5.5 发布，多模态能力全面升级",
            "GPT-5.4 发布：更智能的编程与推理助手",
            "OpenAI 发布 o1 预览版，推理能力重大突破",
            "GPT-4o 正式发布，支持实时语音对话",
            "ChatGPT 桌面版上线 macOS",
            "OpenAI 推出 GPT-4o mini，性价比大幅提升",
            "ChatGPT 新增自定义指令功能",
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
            "Grok 新增图像生成能力 Aurora",
            "Grok 开放 API 接口供开发者使用",
            "xAI 推出 Grok-1.5 版本",
            "Grok 集成至 X 平台实时问答",
            "xAI 发布 Grok 开源版本",
            "Grok 支持实时信息获取功能",
            "xAI 数据中心扩建完成",
            "Grok 新增长文本理解能力",
            "Grok 上线图像理解能力",
            "xAI 与特斯拉达成算力合作",
            "Grok 支持多语言对话",
            "xAI 推出 Grok for Teams",
            "Grok 新增代码助手模式",
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
            "豆包上线智能体平台",
            "豆包支持文档理解能力",
            "豆包推出教育辅导助手",
            "豆包与抖音生态深度整合",
            "豆包发布视觉理解大模型",
        ]
    }
    
    update_id = 1
    updates = []
    
    # 为每个产品生成历史数据
    for product in products:
        titles = sample_titles.get(product["slug"], [])
        if not titles:
            continue
        
        # 生成 25-35 条历史数据，时间从 2025-01-01 到现在随机分布
        num_updates = random.randint(25, 35)
        total_days = (end_date - start_date).days
        
        for i in range(num_updates):
            # 随机选择日期
            random_days = random.randint(0, total_days)
            published_date = start_date + timedelta(days=random_days)
            
            # 随机时间
            published_date = published_date.replace(
                hour=random.randint(8, 22),
                minute=random.randint(0, 59),
                second=random.randint(0, 59)
            )
            
            title = titles[i % len(titles)]
            
            update = {
                "id": update_id,
                "product_id": product["id"],
                "product_slug": product["slug"],
                "product_name": product["name"],
                "product_color": product["color"],
                "title": title,
                "summary": f"{product['name']} 的重要更新，发布于 {published_date.strftime('%Y年%m月%d日')}。",
                "content": None,
                "source_url": product["website_url"],
                "source_type": "blog",
                "published_at": published_date.isoformat(),
                "fetched_at": datetime.now(timezone.utc).isoformat(),
                "is_new": False
            }
            updates.append(update)
            update_id += 1
    
    save_json(UPDATES_FILE, updates)
    print(f"Generated {len(updates)} historical updates")


def mark_new_updates():
    """标记每个产品最新的一条为 is_new"""
    updates = load_json(UPDATES_FILE)
    today = datetime.now(timezone.utc).date().isoformat()
    
    # 先全部重置
    for update in updates:
        update["is_new"] = False
    
    # 按产品分组，找每个产品今天/最近抓取的一条
    by_product: Dict[int, List[dict]] = {}
    for update in updates:
        by_product.setdefault(update["product_id"], []).append(update)
    
    for product_id, product_updates in by_product.items():
        # 优先找今天抓取的
        today_updates = [u for u in product_updates if u.get("fetched_at", "").startswith(today)]
        candidates = today_updates if today_updates else product_updates
        # 按抓取时间排序，取最新一条
        candidates.sort(key=lambda u: u.get("fetched_at", ""), reverse=True)
        if candidates:
            candidates[0]["is_new"] = True
    
    save_json(UPDATES_FILE, updates)


def main():
    args = sys.argv[1:]
    reset = "--reset" in args
    skip_fetch = "--skip-fetch" in args
    
    print(f"Starting fetch at {datetime.now(timezone.utc).isoformat()}")
    
    # 初始化产品数据
    products = get_products()
    print(f"Products: {len(products)}")
    
    # --reset 模式：清空旧数据重新生成
    if reset and os.path.exists(UPDATES_FILE):
        os.remove(UPDATES_FILE)
        print("Cleared old updates data (--reset)")
    
    # 如果更新文件不存在，生成历史数据
    if not os.path.exists(UPDATES_FILE) or os.path.getsize(UPDATES_FILE) < 10:
        generate_historical_data()
    
    # 抓取最新数据
    if not skip_fetch:
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
    else:
        print("Skipping fetch (--skip-fetch)")
    
    # 抓取后重新标记 is_new，确保每个产品只有一条最新
    mark_new_updates()
    
    print("Fetch completed.")


if __name__ == "__main__":
    main()
