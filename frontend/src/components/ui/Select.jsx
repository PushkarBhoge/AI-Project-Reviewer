import { useState, useEffect, useRef } from "react";
import { ChevronDown } from "lucide-react";

export default function Select({ value, onChange, options = [], className = "" }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const selectedOption = options.find((opt) => opt.value === value) || options[0];

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectOption = (optValue) => {
    onChange(optValue);
    setIsOpen(false);
  };

  return (
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between gap-2.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium outline-none transition duration-200 hover:border-slate-300 dark:hover:border-slate-700 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/10 dark:border-slate-800 dark:bg-slate-950/50 dark:text-white cursor-pointer min-w-[150px]"
      >
        <span className="truncate">{selectedOption?.label || ""}</span>
        <ChevronDown
          className={`h-4 w-4 text-slate-400 transition-transform duration-250 ${
            isOpen ? "rotate-180 text-purple-600" : ""
          }`}
        />
      </button>

      {/* Dropdown Items Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 z-50 w-full min-w-[160px] rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl dark:border-slate-800 dark:bg-slate-900 animate-scale-up origin-top-right">
          <div className="space-y-0.5">
            {options.map((opt) => {
              const isSelected = opt.value === value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleSelectOption(opt.value)}
                  className={`flex w-full items-center rounded-lg px-3 py-2 text-xs font-semibold transition cursor-pointer text-left ${
                    isSelected
                      ? "bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400"
                      : "text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
                  }`}
                >
                  <span className="truncate">{opt.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
