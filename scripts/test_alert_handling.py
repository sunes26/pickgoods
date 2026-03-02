#!/usr/bin/env python3
"""
Alert 처리 테스트 - 41번 제품 (실패했던 제품)
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

# products.json에서 41-45번 제품 테스트
products_path = Path("public/products.json")
with open(products_path, 'r', encoding='utf-8') as f:
    products = json.load(f)

# 이미지가 없는 제품 중 처음 5개
test_products = [p for p in products if not p.get('image_url')][:5]

print("="*80)
print("Alert 처리 테스트 시작")
print("="*80)

driver = setup_driver()

for i, product in enumerate(test_products, 1):
    print(f"\n[{i}/5] 테스트: {product['name'][:40]}...")
    print(f"  URL: {product['product_url']}")

    image_url = extract_image_url(driver, product['product_url'])

    if image_url:
        print(f"  [SUCCESS] {image_url}")
    else:
        print(f"  [FAIL] 이미지 없음 (Alert 또는 페이지 오류)")

driver.quit()

print("\n" + "="*80)
print("테스트 완료")
print("="*80)
