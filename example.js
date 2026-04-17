import React, { useState, useEffect, useMemo } from 'react';

// --- Icons (Inline SVGs) ---
const IconSearch = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
);

const IconLoader = () => (
  <svg className="animate-spin" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
);

const IconCheck = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
);

const IconExternalLink = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
);

const IconImagePlaceholder = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
);

const IconTrending = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>
);

const IconTrophy = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>
);

const CATEGORIES = ["전체", "실시간 랭킹", "생활/주방", "인테리어", "디지털/가전", "캠핑/레저", "패션/잡화"];
const TRENDING_KEYWORDS = ["#자취필수템", "#부모님생신선물", "#데스크테리어", "#캠핑입문장비", "#1인가구식탁", "#집들이감성조명"];

export default function App() {
  const [view, setView] = useState('curation'); // 'curation' or 'all_products'
  const [step, setStep] = useState('home'); // home, input, loading, result
  const [selectedCategory, setSelectedCategory] = useState("전체");
  const [formData, setFormData] = useState({
    situation: '',
    priority: 'balanced',
    budget: 50000,
  });

  // 데이터 상태
  const [mockResults, setMockResults] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [rankingProducts, setRankingProducts] = useState([]);

  useEffect(() => {
    // 전체 상품 목록 생성 (48개)
    const items = Array.from({ length: 48 }).map((_, i) => ({
      id: i,
      name: `${CATEGORIES[Math.floor(Math.random() * (CATEGORIES.length - 2)) + 2]} 인기 상품 ${i + 1}`,
      price: Math.floor(Math.random() * 10) * 10000 + 15000,
      category: CATEGORIES[Math.floor(Math.random() * (CATEGORIES.length - 2)) + 2],
      image_url: null,
      link: "#",
      clickCount: Math.floor(Math.random() * 1000)
    }));
    setAllProducts(items);

    // 랭킹 TOP 10 선정 (클릭 수 기준 정렬)
    const sorted = [...items].sort((a, b) => b.clickCount - a.clickCount).slice(0, 10);
    setRankingProducts(sorted);
  }, []);

  // 카테고리 필터링
  const filteredProducts = useMemo(() => {
    if (selectedCategory === "전체") return allProducts;
    if (selectedCategory === "실시간 랭킹") return rankingProducts;
    return allProducts.filter(p => p.category === selectedCategory);
  }, [allProducts, rankingProducts, selectedCategory]);

  const handleStart = () => {
    setView('curation');
    setStep('input');
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    setStep('loading');
    
    setTimeout(() => {
      setMockResults([
        {
          name: "무드있는 공간 오로라 조명",
          price: 24900,
          image_url: null,
          reason: "최근 자취생들 사이에서 검색량이 200% 급증한 핫아이템입니다."
        },
        {
          name: "데스크테리어 원목 선반",
          price: 15000,
          image_url: null,
          reason: "누적 구매수 1,500건을 돌파한 검증된 가성비 제품입니다."
        },
        {
          name: "무선 미니 공기청정기",
          price: 48000,
          image_url: null,
          reason: "실시간 랭킹 5위를 기록 중인 스마트 가전입니다."
        }
      ]);
      setStep('result');
    }, 2000);
  };

  const reset = () => {
    setStep('home');
    setFormData({ situation: '', priority: 'balanced', budget: 50000 });
  };

  // --- UI Components ---

  const HomeStep = () => (
    <div className="flex flex-col items-center min-h-[80vh] px-4 pt-12 animate-in fade-in duration-700">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-xs font-bold mb-6 animate-bounce">
          <IconCheck /> AI 분석 기반 실시간 최저가 매칭 완료
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 tracking-tight leading-tight">
          당신의 쇼핑 고민,<br /> <span className="text-indigo-600">데이터</span>가 답해드립니다
        </h1>
        <p className="text-lg text-slate-500 mb-10 max-w-lg mx-auto leading-relaxed">
          850개 지마켓 상품과 AI 알고리즘이 만나<br /> 
          지금 가장 트렌디하고 합리적인 선택을 도와드려요.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm mx-auto">
          <button 
            onClick={handleStart}
            className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-2xl shadow-xl shadow-indigo-100 transition-all active:scale-95"
          >
            맞춤 추천 시작
          </button>
          <button 
            onClick={() => setView('all_products')}
            className="flex-1 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold py-4 rounded-2xl shadow-sm transition-all"
          >
            전체 상품 보기
          </button>
        </div>
      </div>

      {/* Social Proof 1: Trending Keywords */}
      <div className="w-full max-w-4xl bg-white border border-slate-100 rounded-[2rem] p-8 mb-12 shadow-sm">
        <div className="flex items-center gap-2 mb-6 text-slate-900">
          <IconTrending />
          <h2 className="text-lg font-black uppercase tracking-tight">지금 다른 사람들은?</h2>
        </div>
        <div className="flex flex-wrap gap-3">
          {TRENDING_KEYWORDS.map((kw, idx) => (
            <button 
              key={idx}
              onClick={() => {
                setFormData({...formData, situation: kw.replace('#', '') + " 추천해줘"});
                handleStart();
              }}
              className="px-4 py-2.5 bg-slate-50 hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 rounded-xl text-sm font-bold transition-all border border-transparent hover:border-indigo-100"
            >
              {kw}
            </button>
          ))}
        </div>
        <p className="mt-6 text-xs text-slate-400 font-medium">실시간 검색량 기반 트렌드 (1시간마다 갱신)</p>
      </div>

      {/* Social Proof 2: TOP 10 Ranking Preview */}
      <div className="w-full max-w-6xl mb-12">
        <div className="flex justify-between items-end mb-8 px-2">
          <div className="flex items-center gap-2 text-slate-900">
            <IconTrophy />
            <h2 className="text-xl font-black uppercase tracking-tight">PickGoods 인기 랭킹 TOP 10</h2>
          </div>
          <button 
            onClick={() => {setView('all_products'); setSelectedCategory("실시간 랭킹");}}
            className="text-sm font-bold text-indigo-600 hover:underline"
          >
            전체 순위 보기
          </button>
        </div>
        
        <div className="flex overflow-x-auto gap-4 pb-6 no-scrollbar snap-x">
          {rankingProducts.map((item, idx) => (
            <div key={item.id} className="min-w-[200px] md:min-w-[240px] snap-start group cursor-pointer" onClick={() => window.open(item.link, '_blank')}>
              <div className="relative aspect-square bg-slate-50 rounded-2xl overflow-hidden mb-3 border border-slate-100 group-hover:shadow-md transition-shadow">
                <div className="absolute top-3 left-3 z-10 w-8 h-8 bg-indigo-600 text-white rounded-lg flex items-center justify-center font-black text-sm shadow-lg">
                  {idx + 1}
                </div>
                <div className="flex items-center justify-center h-full">
                  <IconImagePlaceholder />
                </div>
              </div>
              <h3 className="text-sm font-bold text-slate-800 line-clamp-1 group-hover:text-indigo-600 transition-colors">{item.name}</h3>
              <p className="text-indigo-600 font-black text-sm mt-1">{item.price.toLocaleString()}원</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const AllProductsView = () => (
    <div className="max-w-6xl mx-auto px-4 py-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-900">탐색하기</h2>
          <p className="text-sm text-slate-500 mt-1">지마켓의 850개 데이터를 실시간으로 모니터링합니다.</p>
        </div>
        
        {/* Category Filter Bar */}
        <div className="flex overflow-x-auto pb-2 gap-2 no-scrollbar">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`whitespace-nowrap px-5 py-2.5 rounded-xl text-sm font-bold transition-all border ${
                selectedCategory === cat 
                ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100' 
                : 'bg-white border-slate-200 text-slate-500 hover:border-indigo-300'
              }`}
            >
              {cat === "실시간 랭킹" ? <span className="flex items-center gap-1.5"><IconTrophy /> {cat}</span> : cat}
            </button>
          ))}
        </div>
      </div>

      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {filteredProducts.map((item, idx) => (
            <div key={item.id} className="bg-white border border-slate-100 rounded-[1.5rem] overflow-hidden shadow-sm hover:shadow-xl transition-all group relative">
              {selectedCategory === "실시간 랭킹" && (
                <div className="absolute top-4 left-4 z-10 w-8 h-8 bg-indigo-600 text-white rounded-lg flex items-center justify-center font-black text-sm shadow-lg">
                  {idx + 1}
                </div>
              )}
              <div className="aspect-square bg-slate-50 flex items-center justify-center relative overflow-hidden">
                 <IconImagePlaceholder />
                 <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-sm px-2 py-0.5 rounded text-[8px] font-bold text-slate-400 uppercase tracking-tighter">
                    {item.category}
                 </div>
              </div>
              <div className="p-4">
                <h3 className="text-xs font-bold text-slate-800 line-clamp-2 h-8 leading-snug mb-3">{item.name}</h3>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-black text-indigo-600">{item.price.toLocaleString()}원</span>
                  <button className="p-2 bg-slate-50 hover:bg-indigo-600 hover:text-white rounded-lg transition-all">
                    <IconExternalLink />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-32 text-center">
          <p className="text-slate-300 font-bold">해당 카테고리의 상품을 불러오는 중입니다.</p>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FDFEFF] text-slate-900 font-sans pb-16 selection:bg-indigo-100 selection:text-indigo-700">
      {/* Navigation */}
      <nav className="p-4 md:p-6 sticky top-0 bg-white/80 backdrop-blur-xl z-50 border-b border-slate-100">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div onClick={reset} className="text-2xl font-black tracking-tighter cursor-pointer select-none group">
            <span className="text-indigo-600 group-hover:text-indigo-700 transition-colors">Pick</span>Goods
          </div>
          <div className="flex gap-2 bg-slate-100/50 p-1.5 rounded-2xl">
            <button 
              onClick={() => {setView('curation'); setStep('home');}}
              className={`px-5 py-2 rounded-xl text-sm font-bold transition-all ${view === 'curation' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
            >
              AI 추천
            </button>
            <button 
              onClick={() => setView('all_products')}
              className={`px-5 py-2 rounded-xl text-sm font-bold transition-all ${view === 'all_products' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
            >
              상품 목록
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto max-w-7xl">
        {view === 'all_products' ? (
          <AllProductsView />
        ) : (
          <div className="pt-4">
            {step === 'home' && <HomeStep />}
            {step === 'input' && <InputStep />}
            {step === 'loading' && (
              <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <div className="relative mb-8">
                  <div className="absolute inset-0 bg-indigo-100 blur-2xl animate-pulse rounded-full"></div>
                  <div className="relative w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
                </div>
                <h2 className="text-2xl font-black text-slate-800 tracking-tight">RAG 분석 엔진 가동 중...</h2>
                <p className="text-slate-400 mt-3 font-medium">850개 지마켓 상품 데이터에서 최적의 매칭을 수행합니다.</p>
              </div>
            )}
            {step === 'result' && (
              <div className="max-w-5xl mx-auto px-4 py-8 animate-in slide-in-from-bottom-8 duration-700">
                <div className="text-center mb-12">
                  <div className="inline-block px-3 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-black rounded-lg mb-4 uppercase tracking-widest">Analysis Result</div>
                  <h2 className="text-3xl font-black text-slate-900 leading-tight">분석 결과, 이 물건들을 <span className="text-indigo-600">Pick</span>했습니다</h2>
                  <p className="text-slate-500 mt-4 italic font-medium">"{formData.situation}"</p>
                </div>
                <div className="grid md:grid-cols-3 gap-8">
                  {mockResults.map((item, i) => (
                    <div key={i} className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col group hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
                      <div className="aspect-video bg-slate-50 flex items-center justify-center border-b border-slate-50 relative overflow-hidden">
                        <IconImagePlaceholder />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent"></div>
                      </div>
                      <div className="p-8 flex-grow flex flex-col">
                        <div className="flex justify-between items-center mb-4">
                          <span className="text-[10px] font-black bg-indigo-600 text-white px-3 py-1 rounded-full shadow-lg shadow-indigo-100">MATCH {i+1}</span>
                          <span className="text-xl font-black text-slate-900 tracking-tighter">{item.price.toLocaleString()}원</span>
                        </div>
                        <h3 className="font-extrabold text-xl text-slate-800 mb-4 line-clamp-2 leading-snug group-hover:text-indigo-600 transition-colors">{item.name}</h3>
                        <div className="bg-slate-50 p-5 rounded-2xl mb-8 border border-slate-100">
                           <p className="text-xs text-slate-500 leading-relaxed font-medium italic">"{item.reason}"</p>
                        </div>
                        <button className="mt-auto w-full bg-slate-900 hover:bg-indigo-600 text-white font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-2 text-sm shadow-xl hover:shadow-indigo-100">
                          지마켓 상세 정보 <IconExternalLink />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-16 text-center">
                   <button onClick={reset} className="px-8 py-4 bg-slate-100 text-slate-500 rounded-2xl font-bold hover:bg-slate-200 transition-colors">다른 상황으로 다시 추천 받기</button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-20 py-16 text-center border-t border-slate-100 bg-slate-50/50">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-8 text-left">
           <div>
              <div className="text-2xl font-black text-slate-800 tracking-tighter mb-4">PickGoods</div>
              <p className="text-sm text-slate-400 leading-relaxed max-w-sm">지마켓의 방대한 데이터를 AI 기술로 정제하여 당신의 현명한 소비를 돕는 마이크로 쇼핑 큐레이션 서비스입니다.</p>
           </div>
           <div className="flex flex-col md:items-end justify-center text-[10px] uppercase tracking-widest font-bold text-slate-400 gap-2">
              <p>© 2024 PickGoods Project • All Rights Reserved.</p>
              <div className="flex gap-4">
                <span className="hover:text-indigo-600 cursor-pointer transition-colors">Privacy</span>
                <span className="hover:text-indigo-600 cursor-pointer transition-colors">Terms</span>
                <span className="hover:text-indigo-600 cursor-pointer transition-colors">Contact</span>
              </div>
           </div>
        </div>
      </footer>
    </div>
  );
}// PRmate 리뷰 테스트 Fri Apr 17 14:21:58     2026
