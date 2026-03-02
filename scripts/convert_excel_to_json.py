#!/usr/bin/env python3
"""
goods-list-result.xlsx를 products.json으로 변환하는 스크립트
"""

import pandas as pd
import json
from pathlib import Path

def convert_excel_to_json():
    # 엑셀 파일 읽기
    excel_path = Path("goods-list-result.xlsx")
    if not excel_path.exists():
        print(f"[ERROR] 파일을 찾을 수 없습니다: {excel_path}")
        return

    print(f"[INFO] 엑셀 파일 읽는 중: {excel_path}")
    df = pd.read_excel(excel_path, engine='openpyxl')

    # 판매 가능한 상품만 필터링
    df_active = df[df['판매상태'] == '판매가능'].copy()
    print(f"[SUCCESS] 총 {len(df)}개 중 판매가능 상품 {len(df_active)}개 필터링 완료")

    # 가격을 숫자로 변환
    df_active['판매가_숫자'] = df_active['판매가'].astype(str).str.replace(',', '').astype(float).astype(int)

    # 대카테고리 추출
    df_active['대카테고리'] = df_active['카테고리'].str.split(' > ').str[0]

    # JSON 형식으로 변환
    products = []
    for idx, row in df_active.iterrows():
        product_id = str(row['상품번호'])

        # 카테고리 매핑
        category_map = {
            '식품': '식품',
            '컴퓨터': '컴퓨터',
            '건강의료용품': '건강의료용품',
            '의류': '의류',
            '패션잡화': '패션잡화',
            '문구/사무용품': '문구/사무용품',
            '홈인테리어/가구': '홈인테리어/가구',
            '리빙': '리빙',
            '뷰티': '뷰티',
            '유아동': '유아동',
        }

        main_category = row['대카테고리']
        mapped_category = category_map.get(main_category, '기타')

        # 상품명에서 간단한 태그 추출 (공백 기준)
        name_keywords = row['상품명'].split()[:5]  # 상품명 첫 5단어

        product = {
            "id": product_id,
            "name": row['상품명'],
            "price": int(row['판매가_숫자']),
            "category": mapped_category,
            "original_category": row['카테고리'],
            "image_url": None,  # 크롤러로 추가 예정
            "product_url": f"http://item.gmarket.co.kr/Item?goodscode={product_id}",
            "tags": name_keywords,
            "description": "",  # 크롤러로 추가 예정
            "status": "판매가능",
            "brand": row.get('브랜드', '') if pd.notna(row.get('브랜드')) else '',
        }

        products.append(product)

    # JSON 파일로 저장
    output_path = Path("public/products.json")
    output_path.parent.mkdir(parents=True, exist_ok=True)

    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(products, f, ensure_ascii=False, indent=2)

    print(f"[SUCCESS] JSON 파일 생성 완료: {output_path}")
    print(f"[INFO] 총 {len(products)}개 상품 저장됨")

    # 카테고리별 통계
    category_stats = df_active['대카테고리'].value_counts()
    print("\n[STATS] 카테고리별 상품 수:")
    for cat, count in category_stats.head(10).items():
        print(f"  {cat}: {count}개")

    # 가격대별 통계
    print("\n[STATS] 가격대별 분포:")
    price_ranges = [
        (0, 20000, "2만원 미만"),
        (20000, 50000, "2~5만원"),
        (50000, 100000, "5~10만원"),
        (100000, 200000, "10~20만원"),
        (200000, float('inf'), "20만원 이상")
    ]

    for min_p, max_p, label in price_ranges:
        count = len(df_active[(df_active['판매가_숫자'] >= min_p) & (df_active['판매가_숫자'] < max_p)])
        print(f"  {label}: {count}개")

if __name__ == "__main__":
    convert_excel_to_json()
