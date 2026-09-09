import re
html = open('dist/index.html', encoding='utf-8').read()
# find 总动态 followed by text-3xl div
pattern = r'总动态.*?<div[^>]*class="text-3xl[^"]*"[^>]*>(.*?)</div>'
match = re.search(pattern, html, re.S)
print('Match:', match.group(1) if match else 'NOT FOUND')
print('Contains 96?', '96' in html)
