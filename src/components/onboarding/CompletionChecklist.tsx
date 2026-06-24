"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface ChecklistItem {
  id: string;
  label: string;
  completed: boolean;
}

interface CompletionChecklistProps {
  items: ChecklistItem[];
  onItemClick: (id: string) => void;
}

export default function CompletionChecklist({ items, onItemClick }: CompletionChecklistProps) {
  return (
    <div className="w-full max-w-sm mx-auto mt-8 space-y-3">
      <AnimatePresence>
        {items.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => onItemClick(item.id)}
            className={`group relative flex items-center p-4 rounded-xl border cursor-pointer transition-all duration-300 overflow-hidden ${
              item.completed 
                ? 'bg-purple-500/10 border-purple-500/30 shadow-[0_0_10px_rgba(168,85,247,0.1)]' 
                : 'bg-white/5 border-white/10 hover:bg-white/10'
            }`}
          >
            {/* Completion fill animation */}
            {item.completed && (
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-purple-500/10 to-pink-500/5 z-0"
              />
            )}

            <div className="relative z-10 flex items-center justify-between w-full">
              <span className={`font-medium transition-colors ${item.completed ? 'text-white' : 'text-gray-300 group-hover:text-white'}`}>
                {item.label}
              </span>
              
              {/* Checkbox circle */}
              <div className={`flex items-center justify-center w-6 h-6 rounded-full border transition-all ${
                item.completed 
                  ? 'bg-purple-500 border-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]' 
                  : 'border-gray-500 group-hover:border-white'
              }`}>
                {item.completed && (
                  <motion.svg 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-4 h-4 text-white" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </motion.svg>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
