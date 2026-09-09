#!/usr/bin/env python3
"""清理重复和格式错误的更新数据"""

import json
import os
from datetime import datetime, timezone

DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "data")
UPDATES_FILE = os.path.join(DATA_DIR, "updates.json")


def load_json(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        return json.load(f)


def save_json(filepath, data):
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


def clean_updates():
    updates = load_json(UPDATES_FILE)
    
    seen = set()
    cleaned = []
    
    for update in updates:
        # 跳过标题过短的
        title = update.get("title", "").strip()
        if len(title) < 5:
            continue
        
        # 去重：基于产品ID + 标题
        key = (update.get("product_id"), title)
        if key in seen:
            continue
        seen.add(key)
        
        # 更新 ID
        update["id"] = len(cleaned) + 1
        update["title"] = title
        cleaned.append(update)
    
    # 按发布时间排序
    cleaned.sort(key=lambda x: x.get("published_at") or x.get("fetched_at") or "", reverse=True)
    
    # 重新编号
    for i, update in enumerate(cleaned, 1):
        update["id"] = i
    
    save_json(UPDATES_FILE, cleaned)
    print(f"Cleaned {len(updates)} -> {len(cleaned)} updates")


if __name__ == "__main__":
    clean_updates()
