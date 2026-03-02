#!/usr/bin/env python3
"""
여러 개의 goods-list-result 엑셀 파일을 하나의 products.json으로 변환
- 상품번호가 'F'로 시작하는 옥션 상품은 제외
- 중복 제거
"""

import pandas as pd
import json
from pathlib import Path

def convert_multiple_excel_to_json():
    # 엑셀 파일 목록
    excel_files = [
        "goods-list-result1.xlsx",
        "goods-list-result2.xlsx"
    ]

    all_products = []
    seen_product_ids = set()  # 중복 확인용

    for excel_file in excel_files:
        excel_path = Path(excel_file)

        if not excel_path.exists():
            print(f"[WARNING] 파일을 찾을 수 없습니다: {excel_path}")
            continue

        print(f"\n[INFO] 파일 읽는 중: {excel_file}")
        df = pd.read_excel(excel_path, engine='openpyxl')
        print(f"[INFO] 총 {len(df)}개 상품 로드")

        # 판매 가능한 상품만 필터링
        df_active = df[df['판매상태'] == '판매가능'].copy()
        print(f"[INFO] 판매가능 상품: {len(df_active)}개")

        # 'F'로 시작하는 옥션 상품 제외
        df_gmarket = df_active[~df_active['상품번호'].astype(str).str.startswith('F')].copy()
        excluded_count = len(df_active) - len(df_gmarket)
        print(f"[INFO] 옥션 상품 제외: {excluded_count}개")
        print(f"[INFO] 지마켓 상품: {len(df_gmarket)}개")

        # 가격을 숫자로 변환
        df_gmarket['판매가_숫자'] = df_gmarket['판매가'].astype(str).str.replace(',', '').astype(float).astype(int)

        # 대카테고리 추출
        df_gmarket['대카테고리'] = df_gmarket['카테고리'].str.split(' > ').str[0]

        # JSON 형식으로 변환
        for idx, row in df_gmarket.iterrows():
            product_id = str(row['상품번호'])

            # 중복 체크
            if product_id in seen_product_ids:
                continue
            seen_product_ids.add(product_id)

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

            # 상품명에서 간단한 태그 추출
            name_keywords = row['상품명'].split()[:5]

            product = {
                "id": product_id,
                "name": row['상품명'],
                "price": int(row['판매가_숫자']),
                "category": mapped_category,
                "original_category": row['카테고리'],
                "image_url": None,  # 크롤러로 추가 예정
                "product_url": f"http://item.gmarket.co.kr/Item?goodscode={product_id}",
                "tags": name_keywords,
                "description": "",
                "status": "판매가능",
                "brand": row.get('브랜드', '') if pd.notna(row.get('브랜드')) else '',
            }

            all_products.append(product)

    # JSON 파일로 저장
    output_path = Path("public/products.json")
    output_path.parent.mkdir(parents=True, exist_ok=True)

    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(all_products, f, ensure_ascii=False, indent=2)

    print(f"\n{'='*60}")
    print(f"[SUCCESS] JSON 파일 생성 완료: {output_path}")
    print(f"[INFO] 총 {len(all_products)}개 상품 저장됨 (중복 제거 완료)")
    print(f"{'='*60}")

    # 카테고리별 통계
    category_count = {}
    for product in all_products:
        cat = product['category']
        category_count[cat] = category_count.get(cat, 0) + 1

    print("\n[STATS] 카테고리별 상품 수:")
    for cat, count in sorted(category_count.items(), key=lambda x: x[1], reverse=True):
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
        count = sum(1 for p in all_products if min_p <= p['price'] < max_p)
        print(f"  {label}: {count}개")

if __name__ == "__main__":
    convert_multiple_excel_to_json()
