import React from 'react';

const SkeletonCard = () => {
  return (
    <div className="relative overflow-hidden bg-white/40 backdrop-blur-md border border-white/20 rounded-2xl p-4 mb-4 animate-pulse">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 bg-white/60 rounded-full"></div>
        <div className="flex-1 space-y-3">
          <div className="h-4 bg-white/60 rounded-md w-3/4"></div>
          <div className="h-3 bg-white/40 rounded-md w-1/2"></div>
        </div>
      </div>
      <div className="mt-4 pt-4 border-t border-white/40 flex justify-between">
        <div className="h-3 bg-white/40 rounded-md w-20"></div>
        <div className="h-3 bg-white/40 rounded-md w-20"></div>
      </div>
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/40 to-transparent"></div>
    </div>
  );
};

export default SkeletonCard;
