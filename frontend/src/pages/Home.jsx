import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function Home() {
  const { user } = useAuth();
  const [isYearly, setIsYearly] = useState(false);
  const [openIndex, setOpenIndex] = useState(null);

  const faqsData = [
    {
      question: 'Lightning-Fast Performance',
      answer: 'Built with speed — minimal load times and optimized rendering.'
    },
    {
      question: 'Fully Customizable Components',
      answer: 'Easily adjust styles, structure, and behavior to match your project needs.'
    },
    {
      question: 'Responsive by Default',
      answer: 'Every component are responsive by default — no extra CSS required.'
    },
    {
      question: 'Tailwind CSS Powered',
      answer: 'Built using Tailwind utility classes — no extra CSS or frameworks required.'
    },
    {
      question: 'Dark Mode Support',
      answer: 'All components come ready with light and dark theme support out of the box.'
    }
  ];

  const pricingData = [
    {
      name: "Free",
      pricing: 0,
      features: ['Static sites only', '1 website', '500 MB SSD storage', 'Free SSL Certificate', 'Community support', 'No custom domain']
    },
    {
      name: "Pro plan",
      pricing: 19,
      mostPopular: true,
      features: ['Static & dynamic sites', 'Unlimited websites', '10 GB SSD storage', 'Free SSL Certificate', 'Free custom domain', 'Email support', 'Basic analytics']
    },
    {
      name: "Enterprise",
      pricing: 49,
      features: ['Static & dynamic sites', 'Unlimited websites', 'Unlimited SSD storage', 'Free SSL Certificate', 'Free custom domain', 'Priority 24/7 support']
    }
  ];

  const cardsData = [
    {
      image: "https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=200",
      name: "Briar Martin",
      handle: "@neilstellar",
    },
    {
      image: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200",
      name: "Avery Johnson",
      handle: "@averywrites",
    },
    {
      image: "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=200&auto=format&fit=crop&q=60",
      name: "Jordan Lee",
      handle: "@jordantalks",
    },
    {
      image: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=200&auto=format&fit=crop&q=60",
      name: "Avery Johnson",
      handle: "@averywrites",
    },
  ];

  const CreateCard = ({ card }) => (
    <div className="p-5 rounded-2xl mx-4 border border-slate-200/50 bg-white/60 shadow-sm backdrop-blur dark:border-slate-800/50 dark:bg-slate-900/30 hover:-translate-y-1 hover:shadow-md transition-all duration-300 w-72 shrink-0">
      <div className="flex gap-3">
        <img className="h-11 w-11 rounded-full object-cover shadow-sm" src={card.image} alt="User Image" />
        <div className="flex flex-col justify-center">
          <div className="flex items-center gap-1.5">
            <p className="font-bold text-slate-800 dark:text-white text-sm">{card.name}</p>
            <svg className="fill-purple-500" width="14" height="14" viewBox="0 0 12 12" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" clipRule="evenodd" d="M4.555.72a4 4 0 0 1-.297.24c-.179.12-.38.202-.59.244a4 4 0 0 1-.38.041c-.48.039-.721.058-.922.129a1.63 1.63 0 0 0-.992.992c-.071.2-.09.441-.129.922a4 4 0 0 1-.041.38 1.6 1.6 0 0 1-.245.59 3 3 0 0 1-.239.297c-.313.368-.47.551-.56.743-.213.444-.213.96 0 1.404.09.192.247.375.56.743.125.146.187.219.24.297.12.179.202.38.244.59.018.093.026.189.041.38.039.48.058.721.129.922.163.464.528.829.992.992.2.071.441.09.922.129.191.015.287.023.38.041.21.042.411.125.59.245.078.052.151.114.297.239.368.313.551.47.743.56.444.213.96.213 1.404 0 .192-.09.375-.247.743-.56.146-.125.219-.187.297-.24.179-.12.38-.202.59-.244a4 4 0 0 1 .38-.041c.48-.039.721-.058.922-.129.464-.163.829-.528.992-.992.071-.2.09-.441.129-.922a4 4 0 0 1 .041-.38c.042-.21.125-.411.245-.59.052-.078.114-.151.239-.297.313-.368.47-.551.56-.743.213-.444.213-.96 0-1.404-.09-.192-.247-.375-.56-.743a4 4 0 0 1-.24-.297 1.6 1.6 0 0 1-.244-.59 3 3 0 0 1-.041-.38c-.039-.48-.058-.721-.129-.922a1.63 1.63 0 0 0-.992-.992c-.2-.071-.441-.09-.922-.129a4 4 0 0 1-.38-.041 1.6 1.6 0 0 1-.59-.245A3 3 0 0 1 7.445.72C7.077.407 6.894.25 6.702.16a1.63 1.63 0 0 0-1.404 0c-.192.09-.375.247-.743.56m4.07 3.998a.488.488 0 0 0-.691-.69l-2.91 2.91-.958-.957a.488.488 0 0 0-.69.69l1.302 1.302c.19.191.5.191.69 0z" />
            </svg>
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">{card.handle}</span>
        </div>
      </div>
      <p className="text-sm py-4 text-slate-700 dark:text-slate-300 leading-relaxed">
        Radiant made undercutting all of our competitors an absolute breeze.
      </p>
    </div>
  );

  return (
    <div className="relative overflow-hidden bg-slate-50 dark:bg-slate-950 min-h-[calc(100vh-64px)] flex flex-col justify-start pt-24 pb-12">
      {/* Decorative background grid and gradients */}
      <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]" />
      <div className="absolute -top-40 -right-40 h-[600px] w-[600px] rounded-full bg-purple-500/10 dark:bg-purple-950/20 animate-pulse-glow" />
      <div className="absolute -bottom-40 -left-40 h-[600px] w-[600px] rounded-full bg-indigo-500/10 dark:bg-indigo-950/20 animate-pulse-glow delay-200" />
 
      <div className="relative z-10 mx-auto max-w-5xl space-y-16 pb-16">
        {/* Hero Section */}
        <div className="flex flex-col items-center justify-center text-center">
          <div className="flex flex-wrap items-center justify-center gap-3 p-1.5 pr-4 rounded-full border border-slate-300 dark:border-slate-800 bg-white/70 dark:bg-slate-900/40 animate-slide-up">
            <span className="rounded-full bg-purple-600 px-3 py-1 text-xs font-bold text-white uppercase tracking-wider animate-pulse">
              New
            </span>
            <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">Powered by Gemini 1.5 Flash</p>
          </div>
 
          <h1 className="mt-8 text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-6xl max-w-3xl animate-slide-up delay-100">
            AI-Powered GitHub{" "}
            <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent dark:from-purple-400 dark:to-indigo-400">
              Code Auditing
            </span>
          </h1>
          
          <p className="mt-6 max-w-2xl text-lg text-slate-500 dark:text-slate-400 animate-slide-up delay-200">
            Audit your public repositories in seconds. Get modular reports on code quality, security exposures, performance, best practices, and action roadmaps.
          </p>
 
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4 animate-slide-up delay-300">
            {user ? (
              <Link
                to="/dashboard"
                className="flex items-center gap-2 rounded-xl bg-purple-600 px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-purple-500/25 transition hover:bg-purple-700 hover:shadow-purple-500/35 hover:-translate-y-0.5 duration-200"
              >
                Go to Dashboard
                <ArrowRight className="h-4.5 w-4.5" />
              </Link>
            ) : (
              <>
                <Link
                  to="/register"
                  className="cursor-pointer flex items-center gap-2 rounded-xl bg-purple-600 px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-purple-500/25 transition hover:bg-purple-700 hover:shadow-purple-500/35 hover:-translate-y-0.5 duration-200"
                >
                  Get Started Free
                  <ArrowRight className="h-4.5 w-4.5" />
                </Link>
                <Link
                  to="/login"
                  className="flex items-center justify-center cursor-pointer rounded-xl border border-slate-200 bg-white px-8 py-3.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 hover:-translate-y-0.5 duration-200"
                >
                  Log In
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Trust Badges */}
      <div className="relative z-10 w-full pt-4 pb-12 border-b border-slate-200/50 dark:border-slate-800/50">
          <p className="text-center text-xs font-bold tracking-widest text-slate-400 dark:text-slate-500 uppercase mb-6">
              Supports popular languages & frameworks
          </p>
          <div className="flex flex-wrap justify-center gap-6 sm:gap-12 opacity-60 grayscale dark:opacity-40 transition-all hover:grayscale-0 hover:opacity-100 duration-500">
              <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
                  React
              </div>
              <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
                  Python
              </div>
              <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                  Node.js
              </div>
              <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6"><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/></svg>
                  Go
              </div>
              <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
                  Docker
              </div>
          </div>
      </div>

      <div className="relative z-10 w-full space-y-8">
        <style>{`
          @keyframes marqueeScroll {
            0% { transform: translateX(0%); }
            100% { transform: translateX(-50%); }
          }
          .marquee-inner {
            animation: marqueeScroll 25s linear infinite;
          }
          .marquee-reverse {
            animation-direction: reverse;
          }
        `}</style>

        <div className="marquee-row w-full mx-auto max-w-7xl overflow-hidden relative">
          <div className="absolute left-0 top-0 h-full w-24 md:w-48 z-10 pointer-events-none bg-gradient-to-r from-slate-50 to-transparent dark:from-slate-950"></div>
          <div className="marquee-inner flex transform-gpu min-w-[200%] py-4">
            {[...cardsData, ...cardsData].map((card, index) => (
              <CreateCard key={index} card={card} />
            ))}
          </div>
          <div className="absolute right-0 top-0 h-full w-24 md:w-48 z-10 pointer-events-none bg-gradient-to-l from-slate-50 to-transparent dark:from-slate-950"></div>
        </div>

        <div className="marquee-row w-full mx-auto max-w-7xl overflow-hidden relative">
          <div className="absolute left-0 top-0 h-full w-24 md:w-48 z-10 pointer-events-none bg-gradient-to-r from-slate-50 to-transparent dark:from-slate-950"></div>
          <div className="marquee-inner marquee-reverse flex transform-gpu min-w-[200%] py-4">
            {[...cardsData, ...cardsData].map((card, index) => (
              <CreateCard key={`rev-${index}`} card={card} />
            ))}
          </div>
          <div className="absolute right-0 top-0 h-full w-24 md:w-48 z-10 pointer-events-none bg-gradient-to-l from-slate-50 to-transparent dark:from-slate-950"></div>
        </div>
      </div>

      {/* How It Works Timeline */}
      <div className="relative z-10 flex flex-col items-center text-center px-4 py-24 w-full max-w-6xl mx-auto border-t border-slate-200/50 dark:border-slate-800/50 mt-12">
          <p className='text-sm font-bold tracking-widest uppercase text-purple-600 dark:text-purple-400'>Workflow</p>
          <h2 className='text-3xl md:text-4xl font-extrabold mt-2 text-slate-900 dark:text-white'>How It Works</h2>
          <p className='text-sm text-slate-500 dark:text-slate-400 mt-4 max-w-xl'>
              Three simple steps to get actionable insights and improve your codebase quality instantly.
          </p>

          <div className="relative mt-16 grid grid-cols-1 md:grid-cols-3 gap-12 w-full">
              {/* Connecting line for desktop */}
              <div className="hidden md:block absolute top-8 left-[16%] right-[16%] h-[2px] bg-gradient-to-r from-purple-500/0 via-purple-500/50 to-indigo-500/0" />
              
              {/* Step 1 */}
              <div className="relative flex flex-col items-center group">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white dark:bg-slate-900 shadow-xl border border-slate-200 dark:border-slate-800 z-10 transition-transform duration-300 group-hover:scale-110 group-hover:border-purple-500/50">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-7 h-7 text-purple-600 dark:text-purple-400"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>
                  </div>
                  <h3 className="mt-6 text-lg font-bold text-slate-900 dark:text-white">1. Connect GitHub</h3>
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 px-4 text-center">
                      Link your GitHub account or manually enter a public repository URL to get started.
                  </p>
              </div>

              {/* Step 2 */}
              <div className="relative flex flex-col items-center group">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white dark:bg-slate-900 shadow-xl border border-slate-200 dark:border-slate-800 z-10 transition-transform duration-300 group-hover:scale-110 group-hover:border-indigo-500/50">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-7 h-7 text-indigo-600 dark:text-indigo-400"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/></svg>
                  </div>
                  <h3 className="mt-6 text-lg font-bold text-slate-900 dark:text-white">2. AI Scans Code</h3>
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 px-4 text-center">
                      Our Gemini-powered engine deeply analyzes your architecture, security, and performance.
                  </p>
              </div>

              {/* Step 3 */}
              <div className="relative flex flex-col items-center group">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white dark:bg-slate-900 shadow-xl border border-slate-200 dark:border-slate-800 z-10 transition-transform duration-300 group-hover:scale-110 group-hover:border-purple-500/50">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-7 h-7 text-purple-600 dark:text-purple-400"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                  </div>
                  <h3 className="mt-6 text-lg font-bold text-slate-900 dark:text-white">3. Receive Report</h3>
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 px-4 text-center">
                      Get a modular, actionable report with clear steps on how to fix vulnerabilities and optimize.
                  </p>
              </div>
          </div>
      </div>

      {/* Pricing Section */}
      <div className="relative z-10 w-full mx-auto max-w-6xl px-4 py-24 flex flex-col items-center">
        <h2 className="text-3xl md:text-4xl text-center font-bold text-slate-900 dark:text-white mb-4">
          Launch free today. Scale anytime.
        </h2>
        <p className="text-slate-500 dark:text-slate-400 text-center mb-12 text-sm max-w-xl">
          No credit card required. Upgrade only when you need more.
        </p>

        <div className="relative p-1 bg-white/50 dark:bg-slate-900/50 border border-slate-200/50 dark:border-slate-800/50 backdrop-blur rounded-xl inline-flex items-center mb-16 w-64 shadow-sm">
            <div className={`absolute -z-10 w-[calc(50%-4px)] h-[calc(100%-8px)] rounded-lg bg-purple-600 transition-transform duration-300 ease-in-out
                ${isYearly ? 'translate-x-[calc(100%+4px)]' : 'translate-x-0'}`}
            ></div>
            <button
                onClick={() => setIsYearly(false)}
                className={`relative z-10 flex-1 py-2 cursor-pointer rounded-lg text-sm font-semibold transition-colors duration-300
                ${!isYearly ? 'text-white' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}>
                Monthly
            </button>
            <button
                onClick={() => setIsYearly(true)}
                className={`relative z-10 flex-1 py-2 cursor-pointer rounded-lg text-sm font-semibold flex items-center justify-center gap-1 transition-colors duration-300
                ${isYearly ? 'text-white' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}>
                Yearly
                <span className='text-[10px] uppercase tracking-wider opacity-90'>15% off</span>
            </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full items-end">
            {pricingData.map((plan, index) => (
                <div key={index} className={`relative flex flex-col rounded-2xl p-6 transition-all duration-300
                    ${plan.mostPopular 
                        ? 'bg-gradient-to-b from-purple-500/10 to-transparent border-2 border-purple-500 shadow-xl shadow-purple-500/10 scale-105 z-10' 
                        : 'bg-white/60 dark:bg-slate-900/30 border border-slate-200/50 dark:border-slate-800/50 backdrop-blur hover:shadow-lg'}`}>
                    
                    {plan.mostPopular && (
                        <div className='absolute -top-3 left-1/2 -translate-x-1/2 bg-purple-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider'>
                            Most Popular
                        </div>
                    )}
                    
                    <h3 className="text-slate-900 dark:text-white font-bold text-lg mb-2">
                        {plan.name}
                    </h3>
                    <div className="flex items-baseline gap-1 mb-8">
                        <span className="text-4xl font-extrabold text-slate-900 dark:text-white">
                            {isYearly ? `$${plan.pricing - Math.round(plan.pricing * 0.15)}` : `$${plan.pricing}`}
                        </span>
                        <span className="text-slate-500 dark:text-slate-400 text-sm font-medium">/ month</span>
                    </div>
                    
                    <ul className="space-y-4 mb-8 flex-1">
                        {plan.features.map((feature, i) => (
                            <li key={i} className="flex items-start gap-3 text-sm text-slate-700 dark:text-slate-300">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-emerald-500"><circle cx="12" cy="12" r="10" /><path d="m9 12 2 2 4-4" /></svg>
                                {feature}
                            </li>
                        ))}
                    </ul>
                    
                    <button className={`w-full cursor-pointer py-3 rounded-xl font-bold transition-all duration-200 
                        ${plan.mostPopular 
                            ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-md shadow-purple-500/25' 
                            : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-white'}`}>
                        Get Started
                    </button>
                </div>
            ))}
        </div>
      </div>

      {/* FAQ Section */}
      <div className='relative z-10 flex flex-col items-center text-center px-4 py-24 w-full max-w-4xl mx-auto'>
          <p className='text-sm font-bold tracking-widest uppercase text-purple-600 dark:text-purple-400'>FAQ</p>
          <h2 className='text-3xl md:text-4xl font-extrabold mt-2 text-slate-900 dark:text-white'>Frequently Asked Questions</h2>
          <p className='text-sm text-slate-500 dark:text-slate-400 mt-4 max-w-xl'>
              Proactively answering FAQs boosts user confidence and cuts down on support tickets.
          </p>
          <div className='max-w-2xl w-full mt-12 flex flex-col gap-4 items-start text-left'>
              {faqsData.map((faq, index) => (
                  <div key={index} className='flex flex-col items-start w-full group'>
                      <div 
                          className='flex items-center justify-between w-full cursor-pointer border border-slate-200/50 bg-white/60 dark:border-slate-800/50 dark:bg-slate-900/30 backdrop-blur p-5 rounded-2xl transition-all duration-300 hover:shadow-md hover:border-purple-500/30' 
                          onClick={() => setOpenIndex(openIndex === index ? null : index)}
                      >
                          <h3 className='text-sm font-semibold text-slate-800 dark:text-white'>{faq.question}</h3>
                          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" className={`${openIndex === index ? "rotate-180 text-purple-500" : "text-slate-400"} transition-all duration-500 ease-in-out`}>
                              <path d="m4.5 7.2 3.793 3.793a1 1 0 0 0 1.414 0L13.5 7.2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                      </div>
                      <div className={`overflow-hidden transition-all duration-500 ease-in-out w-full ${openIndex === index ? "max-h-[300px] opacity-100 mt-2" : "max-h-0 opacity-0"}`}>
                          <p className='text-sm text-slate-600 dark:text-slate-400 p-5 bg-white/40 dark:bg-slate-900/20 backdrop-blur rounded-xl border border-slate-200/30 dark:border-slate-800/30'>
                              {faq.answer}
                          </p>
                      </div>
                  </div>
              ))}
          </div>
      </div>
    </div>
  );
}