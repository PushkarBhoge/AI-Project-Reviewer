import { Link } from "react-router-dom";

const NotFound = () => {
    return (
        <div className="relative overflow-hidden bg-slate-50 dark:bg-slate-950 min-h-[calc(100vh-64px)] flex flex-col items-center justify-center text-sm px-6">
            {/* Background glowing effects to match theme */}
            <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-purple-500/10 dark:bg-purple-950/20 blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col items-center justify-center text-center">
                <h1 className="text-8xl md:text-9xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600 dark:from-purple-400 dark:to-indigo-400 animate-pulse">404</h1>
                <div className="h-1.5 w-20 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 my-6 md:my-8 shadow-lg shadow-purple-500/30"></div>
                <p className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white">Page Not Found</p>
                <p className="text-sm md:text-base mt-4 text-slate-500 dark:text-slate-400 max-w-md text-center leading-relaxed">
                    The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
                </p>
                
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10 w-full sm:w-auto">
                    <Link to="/" className="w-full sm:w-auto flex items-center justify-center bg-purple-600 hover:bg-purple-700 px-8 py-3.5 text-white font-semibold rounded-xl shadow-lg shadow-purple-500/25 active:scale-95 transition-all duration-200">
                        Return Home
                    </Link>
                    <a href="mailto:support@aicode.reviewer" className="w-full sm:w-auto flex items-center justify-center border border-slate-300 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 backdrop-blur hover:bg-slate-50 dark:hover:bg-slate-800 px-8 py-3.5 text-slate-800 dark:text-slate-200 font-semibold rounded-xl shadow-sm active:scale-95 transition-all duration-200">
                        Contact Support
                    </a>
                </div>
            </div>
        </div>
    );
};

export default NotFound;
