import json

with open('data/updates.json', 'r', encoding='utf-8') as f:
    updates = json.load(f)

print("=== ChatGPT 今日抓取 ===")
for u in updates:
    if u['product_slug'] == 'chatgpt' and u['fetched_at'][:10] == '2026-09-09':
        title = u['title'].encode('utf-8', errors='ignore').decode('utf-8')
        print(f"- {title} | new={u['is_new']} | {u['source_url']}")

print("\n=== 各产品统计 ===")
products = {}
for u in updates:
    products.setdefault(u['product_slug'], []).append(u)
for slug, us in products.items():
    print(f"{slug}: {len(us)} 条, is_new={sum(u['is_new'] for u in us)}")
