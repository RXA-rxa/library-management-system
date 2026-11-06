#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
豆瓣图书爬虫 - 抓取"计算机"标签下的图书数据

功能：抓取前 10 页图书列表，提取书名、作者、出版社、出版年份、
      豆瓣评分、评分人数、ISBN，保存为 books.csv。
"""

import csv
import re
import random
import time
from urllib.parse import urljoin

import requests
from bs4 import BeautifulSoup

# ---------------------------------------------------------------------------
# 配置
# ---------------------------------------------------------------------------
BASE_URL = "https://book.douban.com/tag/计算机"
OUTPUT = "books.csv"
PAGES = 10
PAGE_SIZE = 20

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/125.0.0.0 Safari/537.36"
    ),
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
}

MIN_DELAY = 2.0    # 最小延时（秒）
MAX_DELAY = 4.0    # 最大延时（秒）


# ---------------------------------------------------------------------------
# 公共工具
# ---------------------------------------------------------------------------

def create_session():
    """创建带重试机制的 requests Session。"""
    session = requests.Session()
    session.headers.update(HEADERS)
    from requests.adapters import HTTPAdapter
    from urllib3.util.retry import Retry
    retry_strategy = Retry(
        total=2,
        backoff_factor=0.5,
        status_forcelist=[500, 502, 503, 504],
    )
    adapter = HTTPAdapter(max_retries=retry_strategy)
    session.mount("https://", adapter)
    session.mount("http://", adapter)
    return session


def random_delay():
    """随机延时，避免触发反爬。"""
    time.sleep(random.uniform(MIN_DELAY, MAX_DELAY))


def safe_get(session, url):
    """安全的 GET 请求，返回 BeautifulSoup 对象或 None。"""
    try:
        resp = session.get(url, timeout=15)
        resp.raise_for_status()
        resp.encoding = "utf-8"
        return BeautifulSoup(resp.text, "html.parser")
    except requests.RequestException as e:
        print(f"  [WARN] 请求失败: {url} — {e}")
        return None


# ---------------------------------------------------------------------------
# 列表页解析
# ---------------------------------------------------------------------------

def parse_list_page(soup):
    """
    从列表页解析出每本书的信息。

    豆瓣列表页结构 (li.subject-item):
      - 书名: h2 > a[title]
      - 详情页链接: h2 > a[href]
      - 出版信息: div.pub (格式: "作者 / 出版社 / 出版年")
      - 评分: span.rating_nums
      - 评价人数: span.pl ("(1234人评价)")
    """
    books = []
    items = soup.select("li.subject-item")
    for item in items:
        book = {}

        # ---- 书名 ----
        title_link = item.select_one("h2 a")
        if title_link:
            book["title"] = title_link.get("title") or title_link.get_text(strip=True)
            book["detail_url"] = urljoin(BASE_URL, title_link.get("href", ""))
        else:
            book["title"] = ""
            book["detail_url"] = ""

        # ---- 出版信息: "作者 / 出版社 / 出版年" ----
        pub_el = item.select_one("div.pub")
        if pub_el:
            parts = [p.strip() for p in pub_el.get_text("/").split("/")]
            book["author"] = parts[0] if len(parts) >= 1 else ""
            book["publisher"] = parts[1] if len(parts) >= 2 else ""
            book["pub_year"] = parts[2] if len(parts) >= 3 else ""
        else:
            book["author"] = ""
            book["publisher"] = ""
            book["pub_year"] = ""

        # ---- 评分 ----
        rating_el = item.select_one("span.rating_nums")
        book["rating"] = rating_el.get_text(strip=True) if rating_el else ""

        # ---- 评价人数 (括号内的数字) ----
        rating_count_el = item.select_one("span.pl")
        if rating_count_el:
            text = rating_count_el.get_text(strip=True)
            m = re.search(r"(\d+)", text.replace(",", ""))
            book["rating_count"] = m.group(1) if m else ""
        else:
            book["rating_count"] = ""

        # ---- ISBN 留空，稍后从详情页补充 ----
        book["isbn"] = ""

        books.append(book)
    return books


# ---------------------------------------------------------------------------
# 详情页解析（补充 ISBN）
# ---------------------------------------------------------------------------

def parse_detail_page(soup):
    """
    从图书详情页解析 ISBN。

    豆瓣详情页结构 (div#info):
      <span class="pl">ISBN:</span> 978-7-xxx-xxxxx-x
    """
    if not soup:
        return ""
    info = soup.select_one("#info")
    if not info:
        return ""

    # 方法1：定位 <span class="pl"> 后取相邻文本
    for span in info.select("span.pl"):
        text = span.get_text(strip=True)
        if "ISBN" in text:
            isbn_text = span.next_sibling
            if isbn_text:
                return re.sub(r"\s+", "", isbn_text)
            break

    # 方法2：全文正则兜底
    m = re.search(r"ISBN[：:]\s*([\d\-Xx]+)", info.get_text())
    if m:
        return m.group(1).strip()

    return ""


# ---------------------------------------------------------------------------
# 主流程
# ---------------------------------------------------------------------------

def main():
    session = create_session()
    all_books = []

    for page in range(PAGES):
        start = page * PAGE_SIZE
        url = f"{BASE_URL}?start={start}&type=T"
        print(f"[{page + 1}/{PAGES}] 正在抓取列表页: {url}")

        soup = safe_get(session, url)
        if soup is None:
            print(f"  [SKIP] 第 {page + 1} 页跳过")
            continue

        books = parse_list_page(soup)
        print(f"  解析出 {len(books)} 本图书")

        # 逐个抓取详情页获取 ISBN
        for i, book in enumerate(books, 1):
            if not book["detail_url"]:
                continue
            print(f"    [{i}/{len(books)}] 获取详情: {book['title'][:20]}…")
            detail_soup = safe_get(session, book["detail_url"])
            isbn = parse_detail_page(detail_soup)
            if isbn:
                book["isbn"] = isbn
            random_delay()  # 详情页之间随机延时

        all_books.extend(books)

        # 翻页延时
        if page < PAGES - 1:
            random_delay()

    # ---- 写出 CSV（utf-8-sig 以便 Excel 直接打开不乱码） ----
    fieldnames = [
        "title", "author", "publisher", "pub_year",
        "rating", "rating_count", "isbn",'detail_url',
    ]
    with open(OUTPUT, "w", newline="", encoding="utf-8-sig") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(all_books)

    print(f"\n完成！共抓取 {len(all_books)} 本图书，数据已保存至 {OUTPUT}")


if __name__ == "__main__":
    main()