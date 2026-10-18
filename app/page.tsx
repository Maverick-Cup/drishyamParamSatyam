'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  FlowerLotus,
  Sparkle,
  ArrowRight,
  CaretLeft,
  CaretRight,
  CheckCircle,
  Heart,
  FastForward,
} from '@phosphor-icons/react';
import { STORY_SLIDES } from '@/components/MindfulExpectationModal';

export default function Home() {
  const router = useRouter();
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const touchStartXRef = useRef<number | null>(null);

  const totalSlides = STORY_SLIDES.length;
  const currentSlide = STORY_SLIDES[currentSlideIndex];
  const isFinalSlide = currentSlideIndex === totalSlides - 1;

  // Navigate to main presence companion
  const handleEnterMainPage = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('param_mindful_story_seen', 'true');
    }
    router.push('/experience/presence');
  }, [router]);

  // Stepper handlers
  const nextSlide = useCallback(() => {
    if (currentSlideIndex < totalSlides - 1) {
      setCurrentSlideIndex((prev) => prev + 1);
    } else {
      handleEnterMainPage();
    }
  }, [currentSlideIndex, totalSlides, handleEnterMainPage]);

  const prevSlide = useCallback(() => {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex((prev) => prev - 1);
    }
  }, [currentSlideIndex]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') nextSlide();
      if (e.key === 'ArrowLeft') prevSlide();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextSlide, prevSlide]);

  // Touch swipe support for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const deltaX = touchStartXRef.current - touchEndX;

    if (deltaX > 45) {
      // Swiped left -> Next
      nextSlide();
    } else if (deltaX < -45) {
      // Swiped right -> Previous
      prevSlide();
    }
    touchStartXRef.current = null;
  };

  return (
    <div className="flex-1 flex flex-col justify-between p-3 sm:p-5 relative z-10 max-w-4xl mx-auto w-full h-full min-h-0 overflow-hidden">
      {/* Top Navigation & Direct Skip Bar */}
      <header className="flex items-center justify-between py-1.5 sm:py-2 px-1 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-tr from-cyan-500 via-purple-500 to-amber-400 p-[1.5px] flex items-center justify-center shadow-md shadow-purple-500/20">
            <div className="w-full h-full bg-[#080c14]/90 rounded-full flex items-center justify-center">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-violet-300 font-bold text-sm sm:text-base leading-none">
                P
              </span>
            </div>
          </div>
          <div>
            <span className="text-sm sm:text-base font-semibold tracking-wider text-slate-100 flex items-center gap-1.5">
              ParamSathya
            </span>
            <p className="text-[10px] sm:text-[11px] text-slate-400 font-mono tracking-wide hidden sm:block">
              GriefTech Portal • Healing &amp; Memory Preservation
            </p>
          </div>
        </div>

        {/* Prominent Direct Skip Button */}
        <button
          onClick={handleEnterMainPage}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/90 text-rose-200 hover:text-white border border-rose-500/30 text-xs sm:text-sm font-medium transition-all shadow-md shadow-rose-950/30 active:scale-95 cursor-pointer group"
          title="Skip directly to the main companion page"
          aria-label="Skip directly to main page"
        >
          <span className="font-sans">Skip directly to Main Page</span>
          <FastForward className="w-3.5 h-3.5 text-amber-300 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </header>

      {/* Center Stage: The Healing Goal Card Deck */}
      <main className="flex-1 flex items-center justify-center min-h-0 py-1 sm:py-2">
        <div
          className="w-full max-w-md sm:max-w-lg max-h-[82vh] sm:max-h-[86vh] flex flex-col rounded-3xl bg-gradient-to-b from-slate-900/95 via-[#180f16]/95 to-slate-950 border border-rose-500/25 shadow-2xl shadow-rose-950/50 overflow-hidden"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* Card Header Bar */}
          <div className="flex items-center justify-between px-4 sm:px-6 py-2.5 sm:py-3 border-b border-white/10 shrink-0 bg-slate-950/50">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-full bg-rose-500/10 text-rose-400">
                <FlowerLotus className="w-4 h-4 text-amber-300" />
              </span>
              <span className="text-[11px] sm:text-xs font-mono font-medium tracking-wider uppercase text-slate-300">
                {currentSlide.chapterBadge}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[10px] sm:text-xs font-mono text-slate-400 px-2 py-0.5 rounded-full bg-white/5 border border-white/5">
                {currentSlideIndex + 1} / {totalSlides}
              </span>
            </div>
          </div>

          {/* Card Visual & Takeaway Stage */}
          <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-2 sm:py-3 flex flex-col items-center justify-between gap-2.5 sm:gap-3 text-center">
            {/* Illustration Stage - Mobile Viewport Optimized */}
            <div className="relative w-full max-w-[320px] sm:max-w-[390px] aspect-[4/5] sm:aspect-square max-h-[38vh] sm:max-h-[44vh] rounded-2xl overflow-hidden bg-black/40 border border-white/10 shadow-inner flex items-center justify-center shrink-0">
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent pointer-events-none z-10" />
              <img
                src={currentSlide.imageSrc}
                alt={currentSlide.imageAlt}
                className="w-full h-full object-contain select-none transition-transform duration-300 hover:scale-[1.02]"
                loading="eager"
              />
            </div>

            {/* Narrative & Takeaway */}
            <div className="w-full max-w-sm sm:max-w-md px-1 space-y-1 sm:space-y-1.5">
              <h2 className="text-sm sm:text-base font-semibold text-slate-100 flex items-center justify-center gap-1.5">
                <span>{currentSlide.headline}</span>
                {isFinalSlide && <Sparkle className="w-4 h-4 text-amber-400 animate-pulse" />}
              </h2>
              <p className="text-xs sm:text-[13px] leading-relaxed text-slate-300 font-light italic">
                &ldquo;{currentSlide.takeaway}&rdquo;
              </p>

              {/* Slide 5 Sacred Goal Callout */}
              {isFinalSlide && (
                <div className="mt-2 p-2.5 sm:p-3 rounded-xl bg-gradient-to-r from-emerald-950/70 via-rose-950/70 to-purple-950/70 border border-amber-500/30 text-amber-200 text-[11px] sm:text-xs leading-snug shadow-md animate-fade-in flex items-center gap-2 text-left">
                  <Heart className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>
                    <strong>Our Sacred Goal:</strong> You are here to heal and reflect. Take comfort, release heavy weights, and leave in a lighter, healthier state of mind.
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Card Bottom Controls */}
          <div className="px-4 sm:px-6 py-2.5 sm:py-3 border-t border-white/10 shrink-0 bg-slate-950/60 flex flex-col gap-2">
            {/* Stepper Dots & Arrow Controls */}
            <div className="flex items-center justify-between w-full">
              <button
                onClick={prevSlide}
                disabled={currentSlideIndex === 0}
                className={`p-2 rounded-full border transition flex items-center justify-center ${
                  currentSlideIndex === 0
                    ? 'border-white/5 text-slate-600 opacity-30 cursor-not-allowed'
                    : 'border-white/10 text-slate-300 hover:text-white hover:bg-white/5 active:scale-95 cursor-pointer'
                }`}
                title="Previous card"
                aria-label="Previous card"
              >
                <CaretLeft className="w-4 h-4" />
              </button>

              {/* 5 Dots Indicator */}
              <div className="flex items-center gap-1.5">
                {STORY_SLIDES.map((slide, idx) => (
                  <button
                    key={slide.id}
                    onClick={() => setCurrentSlideIndex(idx)}
                    className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                      idx === currentSlideIndex
                        ? 'w-6 bg-gradient-to-r from-amber-400 to-rose-400 shadow-sm shadow-rose-400/50'
                        : 'w-2 bg-slate-700 hover:bg-slate-500'
                    }`}
                    aria-label={`Jump to healing goal card ${idx + 1}`}
                  />
                ))}
              </div>

              <button
                onClick={nextSlide}
                disabled={isFinalSlide}
                className={`p-2 rounded-full border transition flex items-center justify-center ${
                  isFinalSlide
                    ? 'border-white/5 text-slate-600 opacity-30 cursor-not-allowed'
                    : 'border-white/10 text-slate-300 hover:text-white hover:bg-white/5 active:scale-95 cursor-pointer'
                }`}
                title="Next card"
                aria-label="Next card"
              >
                <CaretRight className="w-4 h-4" />
              </button>
            </div>

            {/* Action Buttons */}
            {isFinalSlide ? (
              <button
                onClick={handleEnterMainPage}
                className="w-full py-2.5 sm:py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 hover:from-amber-400 hover:to-purple-500 text-slate-950 font-semibold text-xs sm:text-sm shadow-lg shadow-rose-500/25 active:scale-[0.98] transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <CheckCircle className="w-4 h-4 text-slate-950" />
                <span>I am Ready to Heal &mdash; Enter Main Page</span>
                <ArrowRight className="w-4 h-4 text-slate-950" />
              </button>
            ) : (
              <div className="flex flex-col gap-1.5">
                <button
                  onClick={nextSlide}
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-100 font-medium text-xs sm:text-sm border border-white/10 active:scale-[0.98] transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>Continue Story</span>
                  <CaretRight className="w-3.5 h-3.5 text-slate-400" />
                </button>
                <div className="flex items-center justify-center">
                  <button
                    onClick={handleEnterMainPage}
                    className="text-[11px] text-slate-400 hover:text-rose-300 transition underline underline-offset-2 cursor-pointer"
                  >
                    Skip directly to Main Page &rarr;
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer Utility Bar */}
      <footer className="py-1 px-2 border-t border-white/5 shrink-0 flex items-center justify-between text-[10px] sm:text-[11px] text-slate-400 font-mono tracking-wide">
        <span>Enterprise Guardrails Active</span>
        <Link
          href="/playground/indic"
          className="text-amber-400/80 hover:text-amber-300 underline underline-offset-2 transition"
        >
          Indic Language Studio &rarr;
        </Link>
      </footer>
    </div>
  );
}
