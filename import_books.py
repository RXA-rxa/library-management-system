#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
将 books.csv 导入 SQL Server library_db.Books 表
使用 Windows 身份验证（Trusted Connection）

CSV 列顺序: title, author, publisher, pub_year, rating, rating_count, isbn, detail_url
Books 表列 (id 自增跳过): id, title, author, category, price, stock, description,
                           like_count, fav_count, created_at, publisher, publish_date,
                           isbn, detail_url, pub_year, rating, rating_count
"""

import csv
import sys

import pyodbc

# ---------------------------------------------------------------------------
# 连接配置 — 按实际情况修改 SERVER
# ---------------------------------------------------------------------------
SERVER = "."                # 本地默认实例；命名实例用 "机器名\\实例名"
DATABASE = "library_db"
CONN_STR = (
    f"DRIVER={{ODBC Driver 17 for SQL Server}};"
    f"SERVER={SERVER};DATABASE={DATABASE};Trusted_Connection=yes"
)

CSV_PATH = r"D:\新建文件夹\Library\books.csv"

# Books 表的所有目标列（不含自增 id；description/publish_date 可 NULL）
TARGET_COLUMNS = [
    "title", "author", "category", "price", "stock", "description",
    "like_count", "fav_count", "created_at", "publisher", "publish_date",
    "isbn", "detail_url", "pub_year", "rating", "rating_count",
]


def build_insert_sql():
    """生成 INSERT 语句，created_at 用 GETDATE()，其余用 ? 占位。"""
    col_parts = []
    for col in TARGET_COLUMNS:
        if col == "created_at":
            col_parts.append("GETDATE()")
        else:
            col_parts.append("?")
    cols = ", ".join(TARGET_COLUMNS)
    vals = ", ".join(col_parts)
    return f"INSERT INTO Books ({cols}) VALUES ({vals})"


def row_to_params(row):
    """
    将 CSV 的一行（dict）映射为 SQL 参数列表。

      - category → '未分类'          price → 0          stock → 0
      - description → None            like_count → 0     fav_count → 0
      - publish_date → None           created_at → 已在 SQL 中处理，此处跳过
      - 其余字段从 row 中获取，留空则传空字符串
    """
    params = []
    for col in TARGET_COLUMNS:
        if col == "created_at":
            continue                     # SQL 中已用 GETDATE() 处理
        elif col == "category":
            params.append("未分类")
        elif col in ("price", "stock", "like_count", "fav_count"):
            params.append(0)
        elif col in ("description", "publish_date"):
            params.append(None)
        else:
            params.append(row.get(col, ""))
    return params


def main():
    conn = None
    try:
        print(f"正在连接 SQL Server ({SERVER}\\{DATABASE}) …")
        conn = pyodbc.connect(CONN_STR, autocommit=False)
        cursor = conn.cursor()
        insert_sql = build_insert_sql()
        print(f"SQL: {insert_sql}")

        total = 0
        success = 0
        errors = 0

        with open(CSV_PATH, encoding="utf-8-sig") as f:
            reader = csv.DictReader(f)   # 自动跳过表头
            for row in reader:
                total += 1
                line_no = reader.line_num
                try:
                    params = row_to_params(row)
                    cursor.execute(insert_sql, params)
                    success += 1

                    # 每 50 行提交一次，避免大事务
                    if success % 50 == 0:
                        conn.commit()
                        print(f"  已提交 {success} 行 …")

                except Exception as exc:
                    errors += 1
                    print(f"  [ERROR] 第 {line_no} 行插入失败: {exc}")

        # 提交剩余数据
        conn.commit()

        print(f"\n{'=' * 45}")
        print(f"处理完成。")
        print(f"  总行数:     {total}")
        print(f"  成功插入:   {success}")
        if errors:
            print(f"  失败:       {errors}")

    except pyodbc.Error as exc:
        print(f"[FATAL] 数据库连接或操作失败: {exc}")
        sys.exit(1)
    finally:
        if conn:
            try:
                conn.close()
            except Exception:
                pass


if __name__ == "__main__":
    main()