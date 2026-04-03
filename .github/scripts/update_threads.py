import feedparser
import json
import os

# Твой фид из Threads
RSS_URL = "https://rss.app/feeds/C1izttJaInbt7xKb.xml"

def update_threads():
    feed = feedparser.parse(RSS_URL)
    posts = []
    
    # Берем последние 10 постов (или сколько хочешь)
    for entry in feed.entries[:10]:
        posts.append({
            "date": entry.published if 'published' in entry else "Recent",
            "text": entry.summary
        })
    
    # Сохраняем в diary.json, который читает твой index.html
    with open("diary.json", "w", encoding='utf-8') as f:
        json.dump(posts, f, ensure_ascii=False, indent=4)

if __name__ == "__main__":
    update_threads()
