'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  X,
  CaretLeft,
  CaretRight,
  FlowerLotus,
  Sparkle,
  Heart,
  CheckCircle,
  ArrowRight,
} from '@phosphor-icons/react';

export interface MindfulExpectationModalProps {
  isOpen: boolean;
  onClose: () => void;
  /**
   * Optional callback when user clicks the primary CTA to enter
   */
  onEnterPortal?: () => void;
}

export interface StorySlide {
  id: number;
  chapterBadge: string;
  headline: string;
  imageSrc: string;
  imageAlt: string;
  takeaway: string;
  accentColor: string;
}

export const STORY_SLIDES: StorySlide[] = [
  {
    id: 1,
    chapterBadge: 'Chapter I • The Question',
    headline: 'Time & Healing',
    imageSrc: '/images/oxrabbit/slide-1-bridge.jpg',
    imageAlt: 'The Ox, the Oxherd Boy, and the Rabbit crossing a bridge near a waterfall',
    takeaway: 'Time by itself is passive. Healing begins when we actively choose what we do with our time.',
    accentColor: 'from-amber-500/20 to-rose-500/10 border-amber-500/30 text-amber-300',
  },
  {
    id: 2,
    chapterBadge: 'Chapter II • The Space',
    headline: 'Expanding Perspective',
    imageSrc: '/images/oxrabbit/slide-2-space.jpg',
    imageAlt: 'The Rabbit reflecting on space and perspective',
    takeaway: 'Time offers space. We can use this gentle space to broaden our view and discover how to heal.',
    accentColor: 'from-rose-500/20 to-purple-500/10 border-rose-500/30 text-rose-300',
  },
  {
    id: 3,
    chapterBadge: 'Chapter III • The Trap',
    headline: 'Breaking the Painful Loop',
    imageSrc: '/images/oxrabbit/slide-3-trap.jpg',
    imageAlt: 'The Rabbit warning against the trap of repeating pain',
    takeaway: 'Without compassionate understanding, time can become a trap where we repeat the same painful loops.',
    accentColor: 'from-purple-500/20 to-indigo-500/10 border-purple-500/30 text-purple-300',
  },
  {
    id: 4,
    chapterBadge: 'Chapter IV • The Habit',
    headline: 'Healing Old Wounds',
    imageSrc: '/images/oxrabbit/slide-4-habits.jpg',
    imageAlt: 'The Rabbit reminding us that we care and must build healing habits',
    takeaway: 'Time does not care what we do with it. We care. It is up to us to build new habits that heal old wounds.',
    accentColor: 'from-cyan-500/20 to-blue-500/10 border-cyan-500/30 text-cyan-300',
  },
  {
    id: 5,
    chapterBadge: 'Chapter V • The Sacred Goal',
    headline: 'Healing Together',
    imageSrc: '/images/oxrabbit/slide-5-wellbeing.jpg',
    imageAlt: 'The Rabbit sharing faith in well-being and caring community',
    takeaway: 'We can do it together. The true destination of this experience is to leave in a better, lighter mental state than when you arrived.',
    accentColor: 'from-emerald-500/20 to-amber-500/10 border-emerald-500/30 text-emerald-300',
  },
];

export const MindfulExpectationModal: React.FC<MindfulExpectationModalProps> = ({
  isOpen,
  onClose,
  onEnterPortal,
}) => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const touchStartXRef = useRef<number | null>(null);

  const totalSlides = STORY_SLIDES.length;
  const currentSlide = STORY_SLIDES[currentSlideIndex];
  const isFinalSlide = currentSlideIndex === totalSlides - 1;

  // Handle slide navigation
  const nextSlide = useCallback(() => {
    if (currentSlideIndex < totalSlides - 1) {
      setCurrentSlideIndex((prev) => prev + 1);
    }
  }, [currentSlideIndex, totalSlides]);

  const prevSlide = useCallback(() => {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex((prev) => prev - 1);
    }
  }, [currentSlideIndex]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') nextSlide();
      if (e.key === 'ArrowLeft') prevSlide();
      if (e.key === 'Escape') handleDismiss();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, nextSlide, prevSlide]);

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

  const handleDismiss = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('param_mindful_story_seen', 'true');
      if (dontShowAgain) {
        localStorage.setItem('param_mindful_story_dont_show', 'true');
      }
    }
    onClose();
  };

  const handleFinishAndEnter = () => {
    handleDismiss();
    if (onEnterPortal) {
      onEnterPortal();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-xl transition-all duration-300 animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-label="Mindful Purpose & Expectations Guidance"
    >
      {/* Outer Click Backdrop */}
      <div className="absolute inset-0" onClick={handleDismiss} />

      {/* Main Responsive Card Container */}
      <div
        className="relative z-10 w-full max-w-md sm:max-w-lg max-h-[94vh] sm:max-h-[90vh] flex flex-col rounded-3xl bg-gradient-to-b from-slate-900/95 via-[#180f16]/95 to-slate-950 border border-rose-500/25 shadow-2xl shadow-rose-950/50 overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-white/10 shrink-0 bg-slate-950/40">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-full bg-rose-500/10 text-rose-400">
              <FlowerLotus className="w-4 h-4 text-amber-300" />
            </span>
            <span className="text-[11px] sm:text-xs font-mono font-medium tracking-wider uppercase text-slate-300">
              {currentSlide.chapterBadge}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-slate-400">
              {currentSlideIndex + 1} / {totalSlides}
            </span>
            <button
              onClick={handleDismiss}
              className="p-1.5 rounded-full text-slate-400 hover:text-slate-100 hover:bg-white/10 transition cursor-pointer"
              title="Close story overlay"
              aria-label="Close story overlay"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Carousel Content Body */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-3 flex flex-col items-center justify-between gap-3 text-center">
          {/* Illustration Stage - Sized cleanly for Mobile Viewport */}
          <div className="relative w-full max-w-[340px] sm:max-w-[400px] aspect-[4/5] sm:aspect-square max-h-[42vh] sm:max-h-[46vh] rounded-2xl overflow-hidden bg-black/40 border border-white/10 shadow-inner flex items-center justify-center shrink-0">
            {/* Visual ambient halo */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent pointer-events-none z-10" />

            <img
              src={currentSlide.imageSrc}
              alt={currentSlide.imageAlt}
              className="w-full h-full object-contain select-none transition-transform duration-300 hover:scale-[1.02]"
              loading="eager"
            />
          </div>

          {/* Emotional Takeaway Text */}
          <div className="w-full max-w-sm sm:max-w-md px-1 space-y-1.5">
            <h3 className="text-sm sm:text-base font-semibold text-slate-100 flex items-center justify-center gap-1.5">
              <span>{currentSlide.headline}</span>
              {isFinalSlide && <Sparkle className="w-4 h-4 text-amber-400 animate-pulse" />}
            </h3>
            <p className="text-xs sm:text-[13px] leading-relaxed text-slate-300 font-light italic">
              &ldquo;{currentSlide.takeaway}&rdquo;
            </p>

            {/* Sacred Goal Highlight on Slide 5 */}
            {isFinalSlide && (
              <div className="mt-2 p-2.5 rounded-xl bg-gradient-to-r from-emerald-950/70 via-rose-950/70 to-purple-950/70 border border-amber-500/30 text-amber-200 text-[11px] leading-snug shadow-md animate-fade-in flex items-center gap-2 text-left">
                <Heart className="w-4 h-4 text-rose-400 shrink-0" />
                <span>
                  <strong>Our Sacred Goal:</strong> You are here to heal and reflect. Take comfort, release heavy weights, and leave in a lighter, healthier state of mind.
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Navigation & Action Footer */}
        <div className="px-4 sm:px-6 py-3 border-t border-white/10 shrink-0 bg-slate-950/60 flex flex-col gap-2.5">
          {/* Progress Indicators & Arrows */}
          <div className="flex items-center justify-between w-full">
            <button
              onClick={prevSlide}
              disabled={currentSlideIndex === 0}
              className={`p-2 rounded-full border transition flex items-center justify-center ${
                currentSlideIndex === 0
                  ? 'border-white/5 text-slate-600 opacity-40 cursor-not-allowed'
                  : 'border-white/10 text-slate-300 hover:text-white hover:bg-white/5 active:scale-95 cursor-pointer'
              }`}
              title="Previous chapter"
              aria-label="Previous chapter"
            >
              <CaretLeft className="w-4 h-4" />
            </button>

            {/* 5 Dot Stepper */}
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
                  aria-label={`Jump to slide ${idx + 1}`}
                />
              ))}
            </div>

            <button
              onClick={nextSlide}
              disabled={isFinalSlide}
              className={`p-2 rounded-full border transition flex items-center justify-center ${
                isFinalSlide
                  ? 'border-white/5 text-slate-600 opacity-40 cursor-not-allowed'
                  : 'border-white/10 text-slate-300 hover:text-white hover:bg-white/5 active:scale-95 cursor-pointer'
              }`}
              title="Next chapter"
              aria-label="Next chapter"
            >
              <CaretRight className="w-4 h-4" />
            </button>
          </div>

          {/* Primary Action Button */}
          {isFinalSlide ? (
            <button
              onClick={handleFinishAndEnter}
              className="w-full py-2.5 sm:py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 hover:from-amber-400 hover:to-purple-500 text-slate-950 font-semibold text-xs sm:text-sm shadow-lg shadow-rose-500/25 active:scale-[0.98] transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <CheckCircle className="w-4 h-4 text-slate-950" />
              <span>I am Ready to Heal &mdash; Enter ParamSathya</span>
              <ArrowRight className="w-4 h-4 text-slate-950" />
            </button>
          ) : (
            <button
              onClick={nextSlide}
              className="w-full py-2.5 sm:py-3 px-4 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-100 font-medium text-xs sm:text-sm border border-white/10 active:scale-[0.98] transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Continue Story</span>
              <CaretRight className="w-3.5 h-3.5 text-slate-400" />
            </button>
          )}

          {/* Subtext and "Don't show again" toggle */}
          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
            <label className="flex items-center gap-1.5 cursor-pointer select-none hover:text-slate-300">
              <input
                type="checkbox"
                checked={dontShowAgain}
                onChange={(e) => setDontShowAgain(e.target.checked)}
                className="w-3.5 h-3.5 rounded bg-slate-900 border-slate-700 text-rose-500 focus:ring-0 focus:ring-offset-0 cursor-pointer"
              />
              <span>Don&apos;t show on next visit</span>
            </label>

            <button
              onClick={handleDismiss}
              className="text-slate-400 hover:text-slate-200 underline underline-offset-2 transition"
            >
              Skip to Portal
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MindfulExpectationModal;
