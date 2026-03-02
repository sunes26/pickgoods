#!/usr/bin/env python3
"""
상대 경로 이미지 URL을 절대 경로로 변환
"""

import json
from pathlib import Path

def fix_image_urls():
    products_path = Path("public/products.json")

    with open(products_path, 'r', encoding='utf-8') as f:
        products = json.load(f)

    fixed_count = 0

    for product in products:
        image_url = product.get('image_url')

        if image_url and image_url.startswith('//'):
            # 상대 경로를 절대 경로로 변환
            product['image_url'] = 'https:' + image_url
            fixed_count += 1

    # 저장
    with open(products_path, 'w', encoding='utf-8') as f:
        json.dump(products, f, ensure_ascii=False, indent=2)

    print(f"[SUCCESS] {fixed_count}개의 이미지 URL을 절대 경로로 변환했습니다.")

if __name__ == "__main__":
    fix_image_urls()
