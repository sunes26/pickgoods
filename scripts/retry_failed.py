#!/usr/bin/env python3
"""
실패한 제품들만 다시 크롤링
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
    chrome_options.add_argument('--headless')
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

# products.json 읽기
products_path = Path("public/products.json")
with open(products_path, 'r', encoding='utf-8') as f:
    products = json.load(f)

# image_url이 null인 제품만 필터링
failed_indices = [i for i, p in enumerate(products) if not p.get('image_url')]

print(f"[INFO] 총 {len(products)}개 중 {len(failed_indices)}개 제품에 이미지 없음")
print(f"[INFO] 실패한 제품만 다시 크롤링 시작...")

driver = setup_driver()

success_count = 0
fail_count = 0

try:
    for count, idx in enumerate(failed_indices, 1):
        product = products[idx]
        product_name = product['name']

        print(f"[{count}/{len(failed_indices)}] 크롤링 중: {product_name[:40]}...")

        # 이미지 URL 추출
        image_url = extract_image_url(driver, product['product_url'])

        if image_url:
            products[idx]['image_url'] = image_url
            success_count += 1
            print(f"    [SUCCESS] {image_url[:60]}...")
        else:
            fail_count += 1
            print(f"    [FAIL] 이미지를 찾을 수 없습니다.")

        # 10개마다 중간 저장
        if count % 10 == 0:
            with open(products_path, 'w', encoding='utf-8') as f:
                json.dump(products, f, ensure_ascii=False, indent=2)
            print(f"[INFO] 중간 저장 완료 ({count}개 처리)")

except KeyboardInterrupt:
    print("\n[WARNING] 사용자가 중단했습니다. 현재까지의 결과를 저장합니다...")

finally:
    # 최종 저장
    with open(products_path, 'w', encoding='utf-8') as f:
        json.dump(products, f, ensure_ascii=False, indent=2)

    driver.quit()

    # 결과 요약
    print("\n" + "="*80)
    print("[SUMMARY] 재크롤링 완료")
    print(f"  성공: {success_count}개")
    print(f"  실패: {fail_count}개")
    print(f"  성공률: {success_count / len(failed_indices) * 100:.1f}%")
    print("="*80)
