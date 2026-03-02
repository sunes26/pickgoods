#!/usr/bin/env python3
"""
지마켓 상품 페이지에서 썸네일 이미지 URL을 크롤링하는 스크립트
"""

import json
import time
from pathlib import Path
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager

def setup_driver():
    """Chrome WebDriver 설정"""
    chrome_options = Options()
    chrome_options.add_argument('--headless')  # 브라우저 창을 띄우지 않음
    chrome_options.add_argument('--no-sandbox')
    chrome_options.add_argument('--disable-dev-shm-usage')
    chrome_options.add_argument('--disable-gpu')
    chrome_options.add_argument('--window-size=1920,1080')
    chrome_options.add_argument('user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36')

    service = Service(ChromeDriverManager().install())
    driver = webdriver.Chrome(service=service, options=chrome_options)
    return driver

def extract_image_url(driver, product_url):
    """상품 페이지에서 이미지 URL 추출"""
    try:
        driver.get(product_url)

        # Alert 팝업 처리 (지마켓 서버 에러)
        try:
            time.sleep(1)
            alert = driver.switch_to.alert
            alert_text = alert.text
            print(f"    [ALERT] {alert_text}")
            alert.accept()  # Alert 닫기
            return None  # Alert 발생 시 이미지 없음
        except:
            pass  # Alert 없으면 계속 진행

        # 페이지 로드 충분히 대기 (JavaScript 실행 대기)
        time.sleep(2)
        wait = WebDriverWait(driver, 10)

        # 여러 방법으로 이미지 URL 추출 시도
        image_url = None

        # 방법 1: og:image 메타 태그 (가장 신뢰성 높음)
        try:
            # Alert 재확인
            try:
                alert = driver.switch_to.alert
                alert.accept()
                return None
            except:
                pass

            wait.until(EC.presence_of_element_located((By.XPATH, "//meta[@property='og:image']")))
            og_image = driver.find_element(By.XPATH, "//meta[@property='og:image']")
            image_url = og_image.get_attribute('content')
            if image_url:
                # 상대 경로면 https: 추가
                if image_url.startswith('//'):
                    image_url = 'https:' + image_url
                return image_url
        except Exception as e:
            # Alert 에러인지 확인
            if "alert" in str(e).lower():
                try:
                    alert = driver.switch_to.alert
                    alert.accept()
                except:
                    pass
            print(f"    [DEBUG] og:image 실패: {str(e)[:100]}")

        # 방법 2: box__viewer-container (신규 지마켓 레이아웃)
        try:
            img_element = wait.until(
                EC.presence_of_element_located((By.CSS_SELECTOR, ".box__viewer-container img"))
            )
            image_url = img_element.get_attribute('src')
            if image_url:
                return image_url
        except:
            pass

        # 방법 3: 상품 메인 이미지 (구 지마켓 레이아웃)
        try:
            img_element = wait.until(
                EC.presence_of_element_located((By.CSS_SELECTOR, ".item_photo_view img, .thumb_image img, #objImg"))
            )
            image_url = img_element.get_attribute('src')
            if image_url:
                return image_url
        except:
            pass

        # 방법 4: 첫 번째 상품 이미지
        try:
            img_element = driver.find_element(By.CSS_SELECTOR, ".item_photo img, .detail_img img")
            image_url = img_element.get_attribute('src')
            if image_url:
                return image_url
        except:
            pass

        return None

    except Exception as e:
        # Alert 처리
        try:
            alert = driver.switch_to.alert
            alert.accept()
        except:
            pass
        print(f"    [ERROR] 이미지 추출 실패: {str(e)[:100]}")
        return None

def scrape_images(start_index=0, limit=None, delay=2):
    """
    상품 이미지 크롤링 메인 함수

    Args:
        start_index: 시작 인덱스 (중단된 위치에서 재개 가능)
        limit: 크롤링할 상품 수 제한 (None이면 전체)
        delay: 요청 간 지연 시간 (초)
    """
    products_path = Path("public/products.json")

    if not products_path.exists():
        print("[ERROR] products.json 파일을 찾을 수 없습니다.")
        return

    # products.json 읽기
    with open(products_path, 'r', encoding='utf-8') as f:
        products = json.load(f)

    total = len(products)
    end_index = min(start_index + limit, total) if limit else total

    print(f"[INFO] 총 {total}개 상품 중 {start_index}~{end_index-1} 범위 크롤링 시작")
    print(f"[INFO] 요청 간 지연: {delay}초")

    # WebDriver 설정
    print("[INFO] Chrome WebDriver 초기화 중...")
    driver = setup_driver()

    success_count = 0
    fail_count = 0
    already_has_image = 0

    try:
        for idx in range(start_index, end_index):
            product = products[idx]
            product_id = product['id']
            product_name = product['name']

            # 이미 이미지가 있는 경우 스킵
            if product.get('image_url'):
                already_has_image += 1
                print(f"[{idx+1}/{total}] SKIP - {product_name[:30]}... (이미 이미지 있음)")
                continue

            print(f"[{idx+1}/{total}] 크롤링 중: {product_name[:30]}...")

            # 이미지 URL 추출
            image_url = extract_image_url(driver, product['product_url'])

            if image_url:
                products[idx]['image_url'] = image_url
                success_count += 1
                print(f"    [SUCCESS] 이미지 URL: {image_url[:60]}...")
            else:
                fail_count += 1
                print(f"    [FAIL] 이미지를 찾을 수 없습니다.")

            # 지연 (서버 부하 방지)
            time.sleep(delay)

            # 10개마다 중간 저장
            if (idx + 1) % 10 == 0:
                with open(products_path, 'w', encoding='utf-8') as f:
                    json.dump(products, f, ensure_ascii=False, indent=2)
                print(f"[INFO] 중간 저장 완료 ({idx+1}개 처리)")

    except KeyboardInterrupt:
        print("\n[WARNING] 사용자가 중단했습니다. 현재까지의 결과를 저장합니다...")

    except Exception as e:
        print(f"\n[ERROR] 예상치 못한 오류 발생: {e}")

    finally:
        # 최종 저장
        with open(products_path, 'w', encoding='utf-8') as f:
            json.dump(products, f, ensure_ascii=False, indent=2)

        driver.quit()

        # 결과 요약
        print("\n" + "="*60)
        print("[SUMMARY] 크롤링 완료")
        print(f"  성공: {success_count}개")
        print(f"  실패: {fail_count}개")
        print(f"  이미 있음: {already_has_image}개")
        print(f"  처리 완료: {success_count + fail_count + already_has_image}/{end_index - start_index}개")
        print("="*60)

if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description='지마켓 상품 이미지 크롤러')
    parser.add_argument('--start', type=int, default=0, help='시작 인덱스 (기본: 0)')
    parser.add_argument('--limit', type=int, default=None, help='크롤링할 상품 수 (기본: 전체)')
    parser.add_argument('--delay', type=float, default=2, help='요청 간 지연 시간(초) (기본: 2)')

    args = parser.parse_args()

    # 테스트를 위해 기본값으로 10개만 크롤링
    if args.limit is None:
        print("[WARNING] limit이 지정되지 않았습니다. 테스트를 위해 처음 10개만 크롤링합니다.")
        print("[INFO] 전체 크롤링을 원하시면 --limit 999 옵션을 사용하세요.")
        args.limit = 10

    scrape_images(start_index=args.start, limit=args.limit, delay=args.delay)
