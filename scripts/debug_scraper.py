#!/usr/bin/env python3
"""
디버깅용 스크립트 - 특정 상품 페이지의 HTML 구조 확인
"""

import time
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

def debug_page(product_url):
    """상품 페이지 HTML 구조 디버깅"""
    driver = setup_driver()

    try:
        print(f"[INFO] 페이지 로딩: {product_url}")
        driver.get(product_url)

        # 페이지 로드 대기
        time.sleep(5)  # 충분한 대기 시간

        print("\n[1] og:image 메타 태그 확인:")
        try:
            og_image = driver.find_element(By.XPATH, "//meta[@property='og:image']")
            print(f"    FOUND: {og_image.get_attribute('content')}")
        except Exception as e:
            print(f"    NOT FOUND: {e}")

        print("\n[2] 모든 img 태그 확인:")
        try:
            imgs = driver.find_elements(By.TAG_NAME, "img")
            print(f"    총 {len(imgs)}개 이미지 발견")
            for i, img in enumerate(imgs[:10]):  # 처음 10개만
                src = img.get_attribute('src')
                alt = img.get_attribute('alt')
                class_name = img.get_attribute('class')
                print(f"    [{i+1}] src={src[:80] if src else 'None'}")
                print(f"        class={class_name}, alt={alt}")
        except Exception as e:
            print(f"    ERROR: {e}")

        print("\n[3] 특정 셀렉터 확인:")
        selectors = [
            ".item_photo_view img",
            ".thumb_image img",
            "#objImg",
            ".item_photo img",
            ".detail_img img",
            ".box__viewer-container img",
            ".box__viewer img"
        ]

        for selector in selectors:
            try:
                element = driver.find_element(By.CSS_SELECTOR, selector)
                src = element.get_attribute('src')
                print(f"    {selector}: FOUND - {src[:80] if src else 'None'}")
            except:
                print(f"    {selector}: NOT FOUND")

        print("\n[4] 페이지 소스 샘플 (처음 2000자):")
        print(driver.page_source[:2000])

    except Exception as e:
        print(f"[ERROR] {e}")

    finally:
        driver.quit()

if __name__ == "__main__":
    # 실패한 상품 테스트
    test_urls = [
        "http://item.gmarket.co.kr/Item?goodscode=4683846769",  # 마사지건 (실패)
        "http://item.gmarket.co.kr/Item?goodscode=4680795046",  # 식품 (실패)
        "http://item.gmarket.co.kr/Item?goodscode=4683836432",  # 커튼 (성공)
    ]

    for url in test_urls:
        print("\n" + "="*80)
        debug_page(url)
        print("="*80 + "\n")
        time.sleep(3)
