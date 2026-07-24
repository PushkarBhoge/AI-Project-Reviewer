import { Link } from "react-router-dom";
import { Github } from "lucide-react";
import { SignInButton, SignUpButton } from "@clerk/clerk-react";
import { useAuth } from "../context/AuthContext";

export default function Footer() {
    const { user } = useAuth();
    
    return (
        <footer className="relative px-6 md:px-16 lg:px-24 xl:px-32 pt-16 w-full bg-slate-50 dark:bg-slate-950 border-t border-slate-200/50 dark:border-slate-800/50 text-slate-500 dark:text-slate-400">
            <div className="flex flex-col md:flex-row justify-between w-full gap-10 border-b border-slate-200/50 dark:border-slate-800/50 pb-10">
                <div className="md:max-w-96 space-y-6">
                    <Link to="/" className="flex items-center gap-2.5">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-600 text-white font-extrabold shadow-md shadow-purple-500/25">
                            <Github className="h-5 w-5" />
                        </div>
                        <div className="flex flex-col">
                            <span className="font-extrabold text-xl tracking-tight text-slate-900 dark:text-white leading-none">
                                RepoLens<span className="text-purple-600 dark:text-purple-400">.AI</span>
                            </span>
                            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-0.5">
                                Deep AI Audits
                            </span>
                        </div>
                    </Link>
                    <p className="mt-6 text-sm leading-relaxed">
                        RepoLens AI provides developers with deep AI audits on codebase architecture, security disclosures, and performance optimization guides. Deep AI Audits for GitHub Repositories.
                    </p>
                </div>
                
                <div className="flex-1 flex flex-col sm:flex-row items-start md:justify-end gap-12 sm:gap-20">
                    <div>
                        <h2 className="font-semibold mb-5 text-slate-800 dark:text-slate-200 uppercase tracking-wider text-xs">Platform</h2>
                        <ul className="text-sm space-y-3 font-medium">
                            <li><Link to="/" className="hover:text-purple-600 dark:hover:text-purple-400 transition">Home</Link></li>
                            {user ? (
                                <>
                                    <li><Link to="/dashboard" className="hover:text-purple-600 dark:hover:text-purple-400 transition">Dashboard</Link></li>
                                    <li><Link to="/history" className="hover:text-purple-600 dark:hover:text-purple-400 transition">Audit History</Link></li>
                                </>
                            ) : (
                                <>
                                    <li>
                                        <SignInButton mode="modal" forceRedirectUrl="/dashboard" fallbackRedirectUrl="/dashboard">
                                            <button className="hover:text-purple-600 dark:hover:text-purple-400 transition cursor-pointer">
                                                Log In
                                            </button>
                                        </SignInButton>
                                    </li>
                                    <li>
                                        <SignUpButton mode="modal" forceRedirectUrl="/dashboard" fallbackRedirectUrl="/dashboard">
                                            <button className="hover:text-purple-600 dark:hover:text-purple-400 transition cursor-pointer">
                                                Sign Up Free
                                            </button>
                                        </SignUpButton>
                                    </li>
                                </>
                            )}
                            <li><a href="#" className="hover:text-purple-600 dark:hover:text-purple-400 transition">Privacy policy</a></li>
                        </ul>
                    </div>
                    <div className="max-w-xs">
                        <h2 className="font-semibold text-slate-800 dark:text-slate-200 mb-5 uppercase tracking-wider text-xs">Subscribe to our newsletter</h2>
                        <div className="text-sm space-y-4">
                            <p className="leading-relaxed">The latest news, articles, and resources, sent to your inbox weekly.</p>
                            <div className="flex items-center gap-2 pt-2">
                                <input 
                                    className="border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 placeholder-slate-400 dark:placeholder-slate-500 focus:border-purple-500 focus:ring-2 ring-purple-500/20 outline-none w-full max-w-64 h-10 rounded-lg px-3 transition" 
                                    type="email" 
                                    placeholder="Enter your email" 
                                />
                                <button className="bg-purple-600 hover:bg-purple-700 transition w-28 h-10 text-white font-semibold rounded-lg shadow-md shadow-purple-500/20">
                                    Subscribe
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="pt-6 pb-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-medium text-slate-400">
                <p>
                    Copyright {new Date().getFullYear()} © RepoLens AI. All Rights Reserved.
                </p>
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    All systems operational
                </div>
            </div>
        </footer>
    );
}