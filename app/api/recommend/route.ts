import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  original_category: string;
  image_url: string | null;
  product_url: string;
  tags: string[];
  description: string;
  status: string;
  brand: string;
}

interface RecommendRequest {
  situation: string;
  priority: string;
  budget: number;
}

export async function POST(request: NextRequest) {
  try {
    const body: RecommendRequest = await request.json();
    const { situation, priority, budget } = body;

    // OpenAI 클라이언트 초기화 (런타임에만 실행)
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // products.json 로드
    const productsPath = path.join(process.cwd(), 'public', 'products.json');
    const productsData = fs.readFileSync(productsPath, 'utf-8');
    const allProducts: Product[] = JSON.parse(productsData);

    // 예산 필터링 (예산의 80% ~ 120% 범위)
    const minPrice = budget * 0.5;
    const maxPrice = budget * 1.5;
    const filteredProducts = allProducts.filter(
      p => p.price >= minPrice && p.price <= maxPrice
    );

    console.log(`총 ${allProducts.length}개 중 ${filteredProducts.length}개 상품이 예산 범위 내`);

    // GPT에게 전달할 상품 목록 (최대 50개로 제한, 토큰 절약)
    const sampleProducts = filteredProducts
      .sort(() => Math.random() - 0.5)
      .slice(0, 50)
      .map(p => ({
        id: p.id,
        name: p.name,
        price: p.price,
        category: p.category,
        description: p.description,
        tags: p.tags,
      }));

    // 우선순위 설명
    const priorityText = {
      price: '가성비 (저렴하고 실용적인 제품)',
      balanced: '밸런스 (가격과 품질의 균형)',
      premium: '디자인 (세련되고 고급스러운 제품)',
    }[priority] || '밸런스';

    // GPT 프롬프트
    const prompt = `당신은 지마켓 쇼핑 큐레이터입니다. 고객의 상황에 가장 적합한 상품 3개를 추천해주세요.

**고객 정보:**
- 상황: ${situation}
- 우선순위: ${priorityText}
- 예산: ~${budget.toLocaleString()}원

**상품 목록 (${sampleProducts.length}개):**
${JSON.stringify(sampleProducts, null, 2)}

**중요 지시사항:**
1. **상황과 카테고리 매칭을 최우선으로 고려하세요:**
   - "데스크테리어" → 홈인테리어/가구, 문구/사무용품, 컴퓨터 관련 상품
   - "자취필수템" → 식품, 주방용품, 생활용품
   - "집들이선물" → 홈인테리어/가구, 식품
   - "캠핑" → 야외용품, 식품
   - 의류, 패션잡화는 상황과 명확히 관련이 있을 때만 선택

2. **상품의 name, description, category를 모두 확인**하여 상황과 실제로 부합하는지 판단하세요.

3. 각 상품마다 "왜 이 상황에 필요한지" 2~3문장으로 설명하되, **사회적 증거를 포함**하세요:
   - 예: "최근 재택근무족들 사이에서 검색량이 급증한 인기 아이템입니다."
   - 예: "실시간 랭킹 상위권을 유지하고 있는 검증된 제품입니다."
   - 예: "누적 구매수 1,000건을 돌파한 가성비 제품입니다."

4. 우선순위(${priorityText})를 고려하세요.

5. 응답은 반드시 아래 JSON 형식으로만 작성하세요:

\`\`\`json
[
  {
    "product_id": "상품ID",
    "reason": "추천 이유 (2~3문장, 사회적 증거 포함)"
  },
  {
    "product_id": "상품ID",
    "reason": "추천 이유 (2~3문장, 사회적 증거 포함)"
  },
  {
    "product_id": "상품ID",
    "reason": "추천 이유 (2~3문장, 사회적 증거 포함)"
  }
]
\`\`\`

중요: JSON 형식만 출력하고, 다른 텍스트는 포함하지 마세요.`;

    // GPT API 호출
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: '당신은 쇼핑 큐레이터입니다. 항상 JSON 형식으로만 응답하세요.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const gptResponse = completion.choices[0].message.content || '';
    console.log('GPT 응답:', gptResponse);

    // JSON 파싱 (코드 블록 제거)
    let recommendations: Array<{ product_id: string; reason: string }> = [];
    try {
      const jsonMatch = gptResponse.match(/```json\s*([\s\S]*?)\s*```/) ||
                        gptResponse.match(/\[[\s\S]*\]/);
      const jsonString = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : gptResponse;
      recommendations = JSON.parse(jsonString);
    } catch (e) {
      console.error('JSON 파싱 실패:', e);
      // Fallback: 랜덤 3개 선택
      recommendations = sampleProducts.slice(0, 3).map(p => ({
        product_id: p.id,
        reason: '이 상황에 적합한 상품입니다.',
      }));
    }

    // 추천된 상품의 전체 정보 가져오기
    const result = recommendations.map(rec => {
      const product = allProducts.find(p => p.id === rec.product_id);
      if (!product) return null;
      return {
        id: product.id,
        name: product.name,
        price: product.price,
        image_url: product.image_url,
        product_url: product.product_url,
        category: product.category,
        reason: rec.reason,
      };
    }).filter(Boolean);

    return NextResponse.json({
      success: true,
      recommendations: result,
    });

  } catch (error) {
    console.error('추천 API 오류:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate recommendations' },
      { status: 500 }
    );
  }
}
