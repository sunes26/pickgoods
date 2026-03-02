#!/usr/bin/env python3
"""
수정된 크롤러 테스트 - 실패했던 상품들로 테스트
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

        # 페이지 로드 충분히 대기 (JavaScript 실행 대기)
        time.sleep(3)
        wait = WebDriverWait(driver, 10)

        # 여러 방법으로 이미지 URL 추출 시도
        image_url = None

        # 방법 1: og:image 메타 태그 (가장 신뢰성 높음)
        try:
            wait.until(EC.presence_of_element_located((By.XPATH, "//meta[@property='og:image']")))
            og_image = driver.find_element(By.XPATH, "//meta[@property='og:image']")
            image_url = og_image.get_attribute('content')
            if image_url:
                # 상대 경로면 https: 추가
                if image_url.startswith('//'):
                    image_url = 'https:' + image_url
                return image_url
        except Exception as e:
            print(f"    [DEBUG] og:image 실패: {e}")

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
        print(f"    [ERROR] 이미지 추출 실패: {str(e)}")
        return None

# 실패했던 상품들 테스트
test_products = [
    {"id": "4683846769", "name": "롤링 마사지건 (41번 - 실패)"},
    {"id": "4680795046", "name": "ToB 허니버터 (식품 - 실패)"},
    {"id": "4680770412", "name": "캐논 토너 (컴퓨터 - 실패)"},
    {"id": "4683836432", "name": "레이스 커튼 (성공 예상)"},
]

print("="*80)
print("수정된 크롤러 테스트 시작")
print("="*80)

driver = setup_driver()

for product in test_products:
    url = f"http://item.gmarket.co.kr/Item?goodscode={product['id']}"
    print(f"\n[TEST] {product['name']}")
    print(f"  URL: {url}")

    image_url = extract_image_url(driver, url)

    if image_url:
        print(f"  [SUCCESS] {image_url}")
    else:
        print(f"  [FAIL] 이미지를 찾을 수 없습니다.")

driver.quit()

print("\n" + "="*80)
print("테스트 완료")
print("="*80)
