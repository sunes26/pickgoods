#!/usr/bin/env python3
"""
FlareSolverr를 이용한 지마켓 이미지 크롤러
"""
import json
import requests
import time
import re
from pathlib import Path

FLARESOLVERR_URL = "http://localhost:8191/v1"

def solve_cloudflare(product_url, product_id):
    """FlareSolverr로 Cloudflare 우회 후 HTML 가져오기"""
    # 각 요청마다 고유한 세션 ID 사용 (캐시 방지)
    import uuid
    session_id = f"session_{product_id}_{uuid.uuid4().hex[:8]}"

    # 세션 생성
    create_payload = {
        "cmd": "sessions.create",
        "session": session_id
    }

    try:
        # 세션 생성
        requests.post(FLARESOLVERR_URL, json=create_payload, timeout=10)

        # 페이지 요청
        payload = {
            "cmd": "request.get",
            "url": product_url,
            "session": session_id,
            "maxTimeout": 60000
        }

        response = requests.post(FLARESOLVERR_URL, json=payload, timeout=70)
        data = response.json()

        # 세션 종료 (캐시 방지)
        destroy_payload = {
            "cmd": "sessions.destroy",
            "session": session_id
        }
        requests.post(FLARESOLVERR_URL, json=destroy_payload, timeout=10)

        if data.get("status") == "ok":
            html = data["solution"]["response"]

            # 방법 1: box__viewer-container 내부의 메인 이미지 추출 (가장 정확함)
            viewer_match = re.search(r'<div class="box__viewer-container">.*?<img src="([^"]+)"', html, re.DOTALL)
            if viewer_match:
                image_url = viewer_match.group(1)
                # 역슬래시를 슬래시로 변환
                image_url = image_url.replace('\\', '/')
                # 앞의 슬래시 제거 (// 또는 / 시작)
                image_url = image_url.lstrip('/')
                # 프로토콜 추가
                if not image_url.startswith('http'):
                    image_url = 'https://' + image_url
                return image_url

            # 방법 2: og:image 메타 태그 (구버전 페이지용)
            og_match = re.search(r'<meta property="og:image" content="([^"]+)"', html)
            if og_match:
                image_url = og_match.group(1)
                if image_url.startswith('//'):
                    image_url = 'https:' + image_url
                return image_url

            # 방법 3: gdimg.gmarket.co.kr 패턴 직접 검색 (최후 수단)
            gdimg_match = re.search(r'(https?://gdimg\.gmarket\.co\.kr/\d+/still/[^"\s<>]+)', html)
            if gdimg_match:
                return gdimg_match.group(1)

        return None

    except Exception as e:
        print(f"    [ERROR] FlareSolverr 오류: {str(e)[:100]}")
        # 에러 발생 시에도 세션 정리 시도
        try:
            destroy_payload = {
                "cmd": "sessions.destroy",
                "session": session_id
            }
            requests.post(FLARESOLVERR_URL, json=destroy_payload, timeout=5)
        except:
            pass
        return None

def scrape_with_flaresolverr(start_index=0, limit=None, delay=3):
    """FlareSolverr로 이미지 크롤링"""
    products_path = Path("public/products.json")

    with open(products_path, 'r', encoding='utf-8') as f:
        products = json.load(f)

    total = len(products)
    end_index = min(start_index + limit, total) if limit else total

    print(f"[INFO] FlareSolverr 크롤링 시작 ({start_index}~{end_index-1})")
    print(f"[INFO] 총 {total}개 중 {end_index - start_index}개 처리 예정")

    success_count = 0
    fail_count = 0
    already_has_image = 0

    try:
        for idx in range(start_index, end_index):
            product = products[idx]

            if product.get('image_url'):
                already_has_image += 1
                print(f"[{idx+1}/{total}] SKIP - {product['name'][:30]}... (이미 이미지 있음)")
                continue

            print(f"[{idx+1}/{total}] 크롤링 중: {product['name'][:40]}...")

            image_url = solve_cloudflare(product['product_url'], product['id'])

            if image_url:
                products[idx]['image_url'] = image_url
                success_count += 1
                print(f"    [SUCCESS] {image_url[:70]}...")
            else:
                fail_count += 1
                print(f"    [FAIL] 이미지를 찾을 수 없습니다.")

            time.sleep(delay)

            # 10개마다 저장
            if (idx + 1 - start_index) % 10 == 0:
                with open(products_path, 'w', encoding='utf-8') as f:
                    json.dump(products, f, ensure_ascii=False, indent=2)
                print(f"[INFO] 중간 저장 완료 ({idx+1}개 처리)")

    except KeyboardInterrupt:
        print("\n[WARNING] 사용자 중단")

    finally:
        # 최종 저장
        with open(products_path, 'w', encoding='utf-8') as f:
            json.dump(products, f, ensure_ascii=False, indent=2)

        print("\n" + "="*60)
        print("[SUMMARY] FlareSolverr 크롤링 완료")
        print(f"  성공: {success_count}개")
        print(f"  실패: {fail_count}개")
        print(f"  이미 있음: {already_has_image}개")
        print(f"  성공률: {success_count / (success_count + fail_count) * 100:.1f}%" if (success_count + fail_count) > 0 else "  성공률: N/A")
        print("="*60)

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description='FlareSolverr 기반 지마켓 이미지 크롤러')
    parser.add_argument('--start', type=int, default=0, help='시작 인덱스 (기본: 0)')
    parser.add_argument('--limit', type=int, default=None, help='크롤링할 상품 수 (기본: 전체)')
    parser.add_argument('--delay', type=float, default=3, help='요청 간 지연 시간(초) (기본: 3)')
    args = parser.parse_args()

    scrape_with_flaresolverr(args.start, args.limit, args.delay)
