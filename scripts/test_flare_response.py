#!/usr/bin/env python3
"""
FlareSolverr 응답 테스트 - 실제 HTML 확인
"""
import json
import requests
import re
import uuid

FLARESOLVERR_URL = "http://localhost:8191/v1"

def test_product(product_id, product_url):
    """단일 상품 테스트 및 HTML 저장"""
    session_id = f"test_session_{uuid.uuid4().hex[:8]}"

    print(f"\n{'='*60}")
    print(f"테스트 상품 ID: {product_id}")
    print(f"테스트 URL: {product_url}")
    print(f"세션 ID: {session_id}")
    print(f"{'='*60}\n")

    # 세션 생성
    create_payload = {
        "cmd": "sessions.create",
        "session": session_id
    }

    try:
        print("[1] 세션 생성 중...")
        response = requests.post(FLARESOLVERR_URL, json=create_payload, timeout=10)
        print(f"    상태: {response.status_code}")

        # 페이지 요청
        print("\n[2] 페이지 요청 중...")
        payload = {
            "cmd": "request.get",
            "url": product_url,
            "session": session_id,
            "maxTimeout": 60000
        }

        response = requests.post(FLARESOLVERR_URL, json=payload, timeout=70)
        data = response.json()

        if data.get("status") == "ok":
            html = data["solution"]["response"]

            # HTML 파일로 저장
            html_filename = f"test_product_{product_id}.html"
            with open(html_filename, 'w', encoding='utf-8') as f:
                f.write(html)
            print(f"    HTML 저장: {html_filename}")
            print(f"    HTML 길이: {len(html):,} bytes")

            # og:image 추출
            print("\n[3] og:image 추출 중...")
            match = re.search(r'<meta property="og:image" content="([^"]+)"', html)
            if match:
                image_url = match.group(1)
                print(f"    발견: {image_url}")

                if image_url.startswith('//'):
                    image_url = 'https:' + image_url
                    print(f"    변환: {image_url}")

                # og:image 주변 컨텍스트 확인
                print("\n[4] og:image 태그 주변 확인...")
                og_image_pos = html.find('og:image')
                if og_image_pos != -1:
                    context_start = max(0, og_image_pos - 200)
                    context_end = min(len(html), og_image_pos + 300)
                    context = html[context_start:context_end]
                    print(f"    컨텍스트:\n{context}")
            else:
                print("    [ERROR] og:image를 찾을 수 없습니다")

                # 대체 방법 시도
                print("\n[4] 대체 이미지 검색 중 (gdimg.gmarket.co.kr)...")
                all_matches = re.findall(r'(https?://gdimg\.gmarket\.co\.kr/[^\s"\'<>]+)', html)
                if all_matches:
                    print(f"    발견된 이미지 URL 수: {len(all_matches)}")
                    for idx, url in enumerate(all_matches[:5], 1):
                        print(f"    [{idx}] {url}")
                else:
                    print("    [ERROR] gdimg URL도 찾을 수 없습니다")

            # 상품명 확인 (올바른 페이지인지 검증)
            print("\n[5] 상품 정보 확인...")
            title_match = re.search(r'<meta property="og:title" content="([^"]+)"', html)
            if title_match:
                print(f"    상품명: {title_match.group(1)}")

            url_match = re.search(r'<meta property="og:url" content="([^"]+)"', html)
            if url_match:
                print(f"    og:url: {url_match.group(1)}")

        else:
            print(f"    [ERROR] FlareSolverr 응답 실패: {data}")

        # 세션 종료
        print("\n[6] 세션 종료 중...")
        destroy_payload = {
            "cmd": "sessions.destroy",
            "session": session_id
        }
        requests.post(FLARESOLVERR_URL, json=destroy_payload, timeout=10)
        print("    완료")

    except Exception as e:
        print(f"\n[ERROR] 예외 발생: {str(e)}")
        # 세션 정리
        try:
            destroy_payload = {
                "cmd": "sessions.destroy",
                "session": session_id
            }
            requests.post(FLARESOLVERR_URL, json=destroy_payload, timeout=5)
        except:
            pass

if __name__ == "__main__":
    # products.json에서 테스트할 상품 로드
    with open('public/products.json', 'r', encoding='utf-8') as f:
        products = json.load(f)

    # 41번째 상품 (인덱스 40)
    test_product_1 = products[40]
    test_product(test_product_1['id'], test_product_1['product_url'])

    print("\n\n" + "="*60)
    print("다른 상품으로 비교 테스트")
    print("="*60)

    # 50번째 상품 (인덱스 49)
    test_product_2 = products[49]
    test_product(test_product_2['id'], test_product_2['product_url'])
