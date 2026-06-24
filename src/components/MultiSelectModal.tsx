import React, { useState, useEffect } from "react";
import { X, Check } from "lucide-react";

interface MultiSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  options: string[];
  initialSelected: string[];
  minSelections?: number;
  maxSelections?: number;
  onSave: (selected: string[]) => void;
}

export default function MultiSelectModal({
  isOpen,
  onClose,
  title,
  options,
  initialSelected,
  minSelections = 1,
  maxSelections = 5,
  onSave,
}: MultiSelectModalProps) {
  const [selected, setSelected] = useState<string[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      setSelected(initialSelected || []);
      setError("");
    }
  }, [isOpen, initialSelected]);

  if (!isOpen) return null;

  const toggleOption = (option: string) => {
    setError("");
    setSelected((prev) => {
      if (prev.includes(option)) {
        return prev.filter((item) => item !== option);
      }
      if (prev.length >= maxSelections) {
        setError(`You can select a maximum of ${maxSelections} options.`);
        return prev;
      }
      return [...prev, option];
    });
  };

  const handleSave = () => {
    if (selected.length < minSelections) {
      setError(`Please select at least ${minSelections} option(s).`);
      return;
    }
    if (selected.length > maxSelections) {
      setError(`You can select a maximum of ${maxSelections} options.`);
      return;
    }
    onSave(selected);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md bg-black border border-white/10 rounded-3xl p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-white/5 hover:bg-white/10 rounded-full transition"
        >
          <X className="w-4 h-4" />
        </button>

        <h3 className="text-xl font-black tracking-tighter mb-2">{title}</h3>
        <p className="text-xs text-white/50 mb-6 uppercase tracking-widest font-bold">
          Select {minSelections} to {maxSelections} options.
          <span className="block mt-1 text-primary">
            Selected values can be changed at anytime from your profile.
          </span>
        </p>

        <div className="space-y-2 max-h-[40vh] overflow-y-auto custom-scrollbar pr-2 mb-6">
          {options.map((option) => {
            const isSelected = selected.includes(option);
            return (
              <button
                key={option}
                onClick={() => toggleOption(option)}
                className={`w-full flex items-center justify-between p-4 rounded-xl text-sm font-bold transition-all border ${
                  isSelected
                    ? "bg-primary/20 border-primary text-white shadow-[0_0_15px_rgba(255,0,127,0.2)]"
                    : "bg-white/5 border-white/5 text-white/60 hover:bg-white/10"
                }`}
              >
                {option}
                {isSelected && <Check className="w-4 h-4 text-primary" />}
              </button>
            );
          })}
        </div>

        {error && (
          <p className="text-xs font-bold text-red-500 bg-red-500/10 p-3 rounded-lg mb-4 text-center">
            {error}
          </p>
        )}

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-4 bg-white/5 hover:bg-white/10 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 py-4 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-[0_0_20px_rgba(255,0,127,0.3)] hover:scale-[1.02] transition"
          >
            Save Selection ({selected.length})
          </button>
        </div>
      </div>
    </div>
  );
}
