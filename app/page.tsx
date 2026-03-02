'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { BreadcrumbSchema } from './components/BreadcrumbSchema';

// --- Icons (Inline SVGs) ---
const IconSearch = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
);

const IconExternalLink = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
);

const IconImagePlaceholder = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
);

const IconTrending = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/>
    <polyline points="16 7 22 7 22 13"/>
  </svg>
);

const IconTrophy = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/>
    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/>
    <path d="M4 22h16"/>
    <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/>
    <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/>
    <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>
  </svg>
);

const IconChevronLeft = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6"/>
  </svg>
);

const IconChevronRight = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6"/>
  </svg>
);

const CATEGORIES = ["전체", "실시간 랭킹", "식품", "컴퓨터", "건강의료용품", "의류", "패션잡화", "문구/사무용품", "홈인테리어/가구", "기타"];

const TRENDING_KEYWORDS = [
  "#자취필수템",
  "#부모님생신선물",
  "#데스크테리어",
  "#캠핑입문장비",
  "#1인가구식탁",
  "#집들이감성조명"
];

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

// --- Step Components (Moved outside App to prevent re-creation) ---

interface HomeStepProps {
  allProductsLength: number;
  rankingProducts: Product[];
  formData: { situation: string; priority: string; budget: number };
  onStart: () => void;
  onShowAllProducts: () => void;
  onFormChange: (data: any) => void;
  onSelectCategory: (category: string) => void;
}

const HomeStep = ({ allProductsLength, rankingProducts, formData, onStart, onShowAllProducts, onFormChange, onSelectCategory }: HomeStepProps) => {
  // 화살표 버튼 스크롤 기능
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScrollButtons = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  };

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const scrollAmount = 300; // 스크롤 이동 거리
    const newScrollLeft = direction === 'left'
      ? scrollRef.current.scrollLeft - scrollAmount
      : scrollRef.current.scrollLeft + scrollAmount;

    scrollRef.current.scrollTo({
      left: newScrollLeft,
      behavior: 'smooth'
    });
  };

  useEffect(() => {
    checkScrollButtons();
    const scrollElement = scrollRef.current;
    if (scrollElement) {
      scrollElement.addEventListener('scroll', checkScrollButtons);
      return () => scrollElement.removeEventListener('scroll', checkScrollButtons);
    }
  }, [rankingProducts]);

  return (
    <div className="flex flex-col items-center justify-center text-center px-4 animate-in fade-in duration-700">
      {/* Hero Section */}
      <div className="mb-10">
        <div className="mb-6 p-4 bg-indigo-100 rounded-full text-indigo-600 shadow-inner inline-block">
          <IconSearch />
        </div>
        <h1 className="text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">
          고민되는 쇼핑, <span className="text-indigo-600">PickGoods</span>가 해결해드려요
        </h1>
        <p className="text-lg text-slate-600 mb-8 max-w-md leading-relaxed mx-auto">
          수많은 상품 중 당신의 상황에 꼭 맞는 단 하나를 AI가 직접 골라드릴게요.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm mx-auto">
          <button
            onClick={onStart}
            className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-2xl shadow-lg transition-all active:scale-95"
          >
            맞춤 추천 시작
          </button>
          <button
            onClick={onShowAllProducts}
            className="flex-1 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold py-4 rounded-2xl shadow-sm transition-all"
          >
            전체 상품 보기
          </button>
        </div>
      </div>

      {/* 실시간 인기 키워드 */}
      <div className="w-full max-w-4xl bg-white border border-slate-100 rounded-3xl p-8 mb-10 shadow-sm">
        <div className="flex items-center gap-2 mb-6 text-slate-900">
          <IconTrending />
          <h2 className="text-lg font-black uppercase tracking-tight">지금 다른 사람들은?</h2>
        </div>
        <div className="flex flex-wrap gap-3 justify-center">
          {TRENDING_KEYWORDS.map((kw, idx) => (
            <button
              key={idx}
              onClick={() => {
                onFormChange({...formData, situation: kw.replace('#', '') + ' 추천해줘'});
                onStart();
              }}
              className="px-5 py-2.5 bg-slate-50 hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 rounded-xl text-sm font-bold transition-all border border-transparent hover:border-indigo-200"
            >
              {kw}
            </button>
          ))}
        </div>
        <p className="mt-6 text-xs text-slate-400 font-medium text-center">
          실시간 검색량 기반 트렌드 (1시간마다 갱신)
        </p>
      </div>

      {/* TOP 10 랭킹 */}
      <div className="w-full max-w-6xl">
        <div className="flex justify-between items-center mb-6 px-2">
          <div className="flex items-center gap-2 text-slate-900">
            <IconTrophy />
            <h2 className="text-xl font-black uppercase tracking-tight">PickGoods 인기 랭킹 TOP 10</h2>
          </div>
          <button
            onClick={() => {
              onShowAllProducts();
              onSelectCategory("실시간 랭킹");
            }}
            className="text-sm font-bold text-indigo-600 hover:underline"
          >
            전체 순위 보기
          </button>
        </div>

        <div className="relative group/carousel">
          {/* 왼쪽 화살표 버튼 */}
          {canScrollLeft && (
            <button
              onClick={() => scroll('left')}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white hover:bg-indigo-50 border border-slate-200 rounded-full shadow-lg flex items-center justify-center text-slate-600 hover:text-indigo-600 transition-all opacity-0 group-hover/carousel:opacity-100"
              aria-label="이전 상품"
            >
              <IconChevronLeft />
            </button>
          )}

          {/* 오른쪽 화살표 버튼 */}
          {canScrollRight && (
            <button
              onClick={() => scroll('right')}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white hover:bg-indigo-50 border border-slate-200 rounded-full shadow-lg flex items-center justify-center text-slate-600 hover:text-indigo-600 transition-all opacity-0 group-hover/carousel:opacity-100"
              aria-label="다음 상품"
            >
              <IconChevronRight />
            </button>
          )}

          {/* 상품 스크롤 영역 */}
          <div
            ref={scrollRef}
            className="flex overflow-x-auto gap-4 pb-6 no-scrollbar scroll-smooth"
          >
            {rankingProducts.map((item, idx) => (
              <a
                key={item.id}
                href={item.product_url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-[200px] md:w-[240px] group flex-shrink-0"
              >
                <div className="relative w-full aspect-square bg-slate-50 rounded-2xl overflow-hidden mb-3 border border-slate-100 group-hover:shadow-lg transition-shadow">
                  {/* 순위 배지 */}
                  <div className="absolute top-3 left-3 z-10 w-9 h-9 bg-indigo-600 text-white rounded-xl flex items-center justify-center font-black text-base shadow-lg">
                    {idx + 1}
                  </div>
                  {/* 상품 이미지 */}
                  {item.image_url ? (
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = '/placeholder.svg';
                      }}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <IconImagePlaceholder />
                    </div>
                  )}
                </div>
                <h3 className="text-sm font-bold text-slate-800 line-clamp-2 h-10 leading-snug group-hover:text-indigo-600 transition-colors">
                  {item.name}
                </h3>
                <p className="text-indigo-600 font-black text-sm mt-1">
                  {item.price.toLocaleString()}원
                </p>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

interface InputStepProps {
  formData: {
    situation: string;
    priority: string;
    budget: number;
  };
  onFormChange: (data: any) => void;
  onSubmit: (e: React.FormEvent) => void;
  onBack: () => void;
}

const InputStep = ({ formData, onFormChange, onSubmit, onBack }: InputStepProps) => (
  <div className="max-w-xl mx-auto w-full px-4 py-8 animate-in slide-in-from-bottom-8 duration-500">
    <button onClick={onBack} className="text-sm text-slate-400 mb-6 hover:text-indigo-600">← 뒤로가기</button>
    <h2 className="text-2xl font-bold text-slate-900 mb-6">어떤 상황에 계신가요?</h2>
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="space-y-2">
        <label className="text-sm font-semibold text-slate-500">상황 또는 고민 입력</label>
        <textarea
          required
          className="w-full bg-white border border-slate-200 rounded-2xl p-4 min-h-[120px] focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm"
          placeholder="예: 자취를 처음 시작해서 주방 용품이 필요해요, 친구 집들이 선물로 3만원대 실용적인 걸 찾아요."
          value={formData.situation}
          onChange={(e) => onFormChange({...formData, situation: e.target.value})}
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-semibold text-slate-500">중요하게 생각하는 가치</label>
        <div className="grid grid-cols-3 gap-2">
          {['price', 'balanced', 'premium'].map(id => (
            <button
              key={id}
              type="button"
              onClick={() => onFormChange({...formData, priority: id})}
              className={`py-3 rounded-xl border-2 font-bold text-sm transition-all ${
                formData.priority === id ? 'border-indigo-600 bg-indigo-50 text-indigo-600' : 'border-slate-100 bg-white text-slate-400'
              }`}
            >
              {id === 'price' ? '가성비' : id === 'balanced' ? '밸런스' : '디자인'}
            </button>
          ))}
        </div>
      </div>
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <label className="text-sm font-semibold text-slate-500">예산 범위</label>
          <span className="text-indigo-600 font-bold">~ {formData.budget.toLocaleString()}원</span>
        </div>
        <input
          type="range" min="10000" max="200000" step="5000"
          className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
          value={formData.budget}
          onChange={(e) => onFormChange({...formData, budget: parseInt(e.target.value)})}
        />
      </div>
      <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-2xl shadow-xl transition-all active:scale-95">
        분석 결과 보기
      </button>
    </form>
  </div>
);

interface AllProductsViewProps {
  allProducts: Product[];
  filteredProducts: Product[];
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

const AllProductsView = ({ allProducts, filteredProducts, selectedCategory, onCategoryChange }: AllProductsViewProps) => {
  const siteUrl = typeof window !== 'undefined' ? window.location.origin : 'https://pickgoods.com';

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 animate-in fade-in duration-500">
      {selectedCategory !== "전체" && (
        <BreadcrumbSchema
          items={[
            { name: "홈", url: siteUrl },
            { name: selectedCategory, url: `${siteUrl}?category=${encodeURIComponent(selectedCategory)}` }
          ]}
        />
      )}
      <div className="flex flex-col gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">전체 상품 목록</h2>
        </div>

      {/* Category Filter Bar */}
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => onCategoryChange(cat)}
            className={`whitespace-nowrap px-4 py-2 rounded-xl text-sm font-bold transition-all border inline-flex items-center gap-1.5 ${
              selectedCategory === cat
              ? 'bg-indigo-600 border-indigo-600 text-white shadow-md'
              : 'bg-white border-slate-200 text-slate-500 hover:border-indigo-300'
            }`}
          >
            {cat === "실시간 랭킹" && <IconTrophy />}
            {cat}
          </button>
        ))}
      </div>
    </div>

    {filteredProducts.length > 0 ? (
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {filteredProducts.map((item, idx) => (
          <a
            key={item.id}
            href={item.product_url}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group relative cursor-pointer block"
          >
            <div className="aspect-square bg-slate-50 flex items-center justify-center relative">
               {/* 순위 배지 (실시간 랭킹 카테고리에만 표시) */}
               {selectedCategory === "실시간 랭킹" && (
                 <div className="absolute top-2 left-2 z-10 w-8 h-8 bg-indigo-600 text-white rounded-lg flex items-center justify-center font-black text-sm shadow-lg">
                   {idx + 1}
                 </div>
               )}
               {item.image_url ? (
                 <img
                   src={item.image_url}
                   alt={item.name}
                   className="w-full h-full object-cover"
                   onError={(e) => {
                     e.currentTarget.src = '/placeholder.svg';
                   }}
                 />
               ) : (
                 <IconImagePlaceholder />
               )}
               <div className={`absolute top-2 ${selectedCategory === "실시간 랭킹" ? "right-2" : "left-2"} bg-white/80 backdrop-blur-sm px-1.5 py-0.5 rounded text-[8px] font-bold text-slate-400 uppercase`}>
                  {item.category}
               </div>
               <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
            </div>
            <div className="p-3">
              <h3 className="text-xs font-bold text-slate-800 line-clamp-2 h-8 leading-snug">{item.name}</h3>
              <div className="flex justify-between items-center mt-2">
                <span className="text-xs font-black text-indigo-600">{item.price.toLocaleString()}원</span>
                <div className="p-1 text-slate-300 group-hover:text-indigo-600 transition-colors">
                  <IconExternalLink />
                </div>
              </div>
            </div>
          </a>
        ))}
      </div>
    ) : (
      <div className="py-20 text-center text-slate-400">
        이 카테고리에는 아직 등록된 상품이 없습니다.
      </div>
    )}
    </div>
  );
};

export default function App() {
  const [view, setView] = useState('curation'); // 'curation' or 'all_products'
  const [step, setStep] = useState('home'); // home, input, loading, result
  const [selectedCategory, setSelectedCategory] = useState("전체");
  const [formData, setFormData] = useState({
    situation: '',
    priority: 'balanced',
    budget: 50000,
  });

  // 실제 데이터 상태
  const [mockResults, setMockResults] = useState<any[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [rankingProducts, setRankingProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 실제 products.json 데이터 불러오기
    fetch('/products.json')
      .then(res => res.json())
      .then(data => {
        setAllProducts(data);

        // TOP 10 생성: 카테고리 다양성 + 가격 밸런스
        // 제외할 카테고리: 문구/사무용품, 컴퓨터, 기타
        const excludedCategories = ['문구/사무용품', '컴퓨터', '기타'];
        const rankingCandidates = data.filter((p: Product) =>
          !excludedCategories.includes(p.category)
        );

        const categoryCount: Record<string, number> = {};
        const scoredProducts = rankingCandidates.map((p: Product) => {
          const categoryScore = (categoryCount[p.category] || 0);
          categoryCount[p.category] = categoryScore + 1;

          // 카테고리 다양성 점수 (중복 적을수록 높음)
          const diversityScore = 20 - (categoryScore * 3);
          // 가격 밸런스 (30k-80k 중간 가격대 선호)
          const priceScore = (p.price >= 30000 && p.price <= 80000) ? 10 : 0;
          // 약간의 랜덤 요소
          const randomScore = Math.random() * 5;

          return {
            ...p,
            rankScore: diversityScore + priceScore + randomScore
          };
        });

        const top10 = scoredProducts
          .sort((a: any, b: any) => b.rankScore - a.rankScore)
          .slice(0, 10);

        setRankingProducts(top10);
        setIsLoading(false);
      })
      .catch(err => {
        console.error('상품 데이터 로드 실패:', err);
        setIsLoading(false);
      });
  }, []);

  // 카테고리 필터링된 상품 목록
  const filteredProducts = useMemo(() => {
    if (selectedCategory === "전체") return allProducts;
    if (selectedCategory === "실시간 랭킹") return rankingProducts;
    return allProducts.filter(p => p.category === selectedCategory);
  }, [allProducts, rankingProducts, selectedCategory]);

  const handleStart = () => {
    setView('curation');
    setStep('input');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStep('loading');

    try {
      const response = await fetch('/api/recommend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          situation: formData.situation,
          priority: formData.priority,
          budget: formData.budget,
        }),
      });

      const data = await response.json();

      if (data.success && data.recommendations) {
        setMockResults(data.recommendations);
        setStep('result');
      } else {
        console.error('추천 실패:', data.error);
        alert('추천을 생성하는 중 오류가 발생했습니다. 다시 시도해주세요.');
        setStep('input');
      }
    } catch (error) {
      console.error('API 호출 오류:', error);
      alert('서버와 통신하는 중 오류가 발생했습니다.');
      setStep('input');
    }
  };

  const reset = () => {
    setStep('home');
    setFormData({ situation: '', priority: 'balanced', budget: 50000 });
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans pb-12">
      {/* Navigation */}
      <nav className="p-4 md:p-6 sticky top-0 bg-white/80 backdrop-blur-md z-20 border-b border-slate-100">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div onClick={reset} className="text-xl font-black tracking-tighter cursor-pointer select-none">
            <span className="text-indigo-600">Pick</span>Goods
          </div>
          <div className="flex gap-1.5 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => {setView('curation'); setStep('home');}}
              className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${view === 'curation' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              AI 추천
            </button>
            <button
              onClick={() => setView('all_products')}
              className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${view === 'all_products' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              상품 목록
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto">
        {view === 'all_products' ? (
          <AllProductsView
            allProducts={allProducts}
            filteredProducts={filteredProducts}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
          />
        ) : (
          <div className="pt-8">
            {step === 'home' && (
              <HomeStep
                allProductsLength={allProducts.length}
                rankingProducts={rankingProducts}
                formData={formData}
                onStart={handleStart}
                onShowAllProducts={() => setView('all_products')}
                onFormChange={setFormData}
                onSelectCategory={setSelectedCategory}
              />
            )}
            {step === 'input' && (
              <InputStep
                formData={formData}
                onFormChange={setFormData}
                onSubmit={handleSubmit}
                onBack={() => setStep('home')}
              />
            )}
            {step === 'loading' && (
              <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <div className="relative mb-8">
                  {/* 배경 블러 애니메이션 */}
                  <div className="absolute inset-0 bg-indigo-200 blur-3xl animate-pulse rounded-full scale-150 opacity-40"></div>
                  <div className="relative w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
                </div>
                <h2 className="text-2xl font-black text-slate-800 tracking-tight">RAG 분석 엔진 가동 중...</h2>
                <p className="text-slate-400 mt-3 font-medium">
                  {allProducts.length}개 지마켓 상품 데이터에서 최적의 매칭을 수행합니다.
                </p>
              </div>
            )}
            {step === 'result' && (
              <div className="max-w-4xl mx-auto px-4 py-8 animate-in slide-in-from-bottom-8 duration-700">
                <div className="text-center mb-10">
                  <h2 className="text-2xl font-bold">PickGoods 추천 결과</h2>
                  <p className="text-slate-500 mt-2 italic">&quot;{formData.situation}&quot;</p>
                </div>
                <div className="grid md:grid-cols-3 gap-6">
                  {mockResults.map((item, i) => (
                    <div key={i} className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col group hover:shadow-lg transition-all duration-300">
                      <div className="aspect-video bg-slate-50 flex items-center justify-center border-b border-slate-50">
                        {item.image_url ? (
                          <img
                            src={item.image_url}
                            alt={item.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.src = '/placeholder.svg';
                            }}
                          />
                        ) : (
                          <IconImagePlaceholder />
                        )}
                      </div>
                      <div className="p-5 flex-grow flex flex-col">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-[10px] font-bold bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded">BEST MATCH {i+1}</span>
                          <span className="font-bold">{item.price.toLocaleString()}원</span>
                        </div>
                        <h3 className="font-bold text-slate-800 mb-3 line-clamp-2 leading-snug">{item.name}</h3>
                        <p className="text-xs text-slate-500 mb-4 leading-relaxed">{item.reason}</p>
                        <a
                          href={item.product_url || '#'}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-auto w-full bg-slate-900 hover:bg-indigo-600 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 text-sm shadow-md"
                        >
                          지마켓 바로가기 <IconExternalLink />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-12 text-center">
                   <button onClick={reset} className="px-6 py-2 bg-slate-100 text-slate-500 rounded-xl font-bold text-sm hover:bg-slate-200 transition-colors">다시 추천 받기</button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      <footer className="mt-20 py-8 text-center text-slate-300 text-[10px] uppercase tracking-widest border-t border-slate-100">
        © 2026 PickGoods Project • Multi-Platform Curation
      </footer>
    </div>
  );
}
