import React from 'react';

const BASE_SHIMMER = 'animate-pulse bg-slate-200/70';

// Base Primitive
export const Skeleton = ({ className = '', style = {} }) => (
  <div
    className={`${BASE_SHIMMER} ${className}`}
    style={style}
    aria-hidden="true"
  />
);

// Named component exports
export const SkeletonText = ({ lines = 2, className = '' }) => (
  <div className={`space-y-2 ${className}`}>
    {Array.from({ length: lines }).map((_, i) => (
      <Skeleton
        key={i}
        className="h-3.5 rounded-full"
        style={{ width: i === lines - 1 && lines > 1 ? '65%' : '100%' }}
      />
    ))}
  </div>
);

export const SkeletonCard = ({ className = '' }) => (
  <div className={`bg-white border border-slate-100 rounded-2xl p-5 space-y-4 shadow-sm ${className}`}>
    <div className="flex items-center gap-3">
      <Skeleton className="w-11 h-11 rounded-2xl flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-3.5 w-3/4 rounded-full" />
        <Skeleton className="h-3 w-1/2 rounded-full" />
      </div>
    </div>
    <SkeletonText lines={2} />
  </div>
);

export const SkeletonStatGrid = () => (
  <div className="grid grid-cols-3 gap-3">
    {[0, 1, 2].map(i => (
      <div key={i} className="bg-slate-50 border border-slate-100 rounded-2xl p-4 space-y-2 shadow-sm">
        <Skeleton className="w-6 h-6 rounded-xl mx-auto" />
        <Skeleton className="h-5 w-8 rounded-full mx-auto" />
        <Skeleton className="h-2.5 w-10 rounded-full mx-auto" />
      </div>
    ))}
  </div>
);

export const SkeletonHeroCard = () => (
  <div className="w-full bg-slate-800 rounded-[32px] p-6 space-y-4">
    <Skeleton className="h-3 w-24 rounded-full bg-slate-700" />
    <Skeleton className="h-8 w-4/5 rounded-xl bg-slate-700" />
    <Skeleton className="h-8 w-2/3 rounded-xl bg-slate-700" />
    <Skeleton className="h-3.5 w-full rounded-full bg-slate-700" />
    <Skeleton className="h-3.5 w-4/5 rounded-full bg-slate-700" />
    <Skeleton className="h-10 w-36 rounded-full bg-slate-700" />
  </div>
);

export const SkeletonStreakTracker = () => (
  <div className="bg-white border border-slate-100 rounded-2xl p-5 space-y-4 shadow-sm">
    <div className="flex items-center justify-between">
      <Skeleton className="h-3.5 w-28 rounded-full" />
      <Skeleton className="h-3 w-24 rounded-full" />
    </div>
    <div className="flex justify-between items-center px-1">
      {[0, 1, 2, 3, 4, 5, 6].map(i => (
        <div key={i} className="flex flex-col items-center gap-1.5">
          <Skeleton className="w-8 h-8 rounded-full" />
          <Skeleton className="h-2 w-5 rounded-full" />
        </div>
      ))}
    </div>
  </div>
);

export const SkeletonActivityRow = () => (
  <div className="flex items-center justify-between py-3 border-b border-slate-100">
    <div className="flex items-center gap-3.5">
      <Skeleton className="w-11 h-11 rounded-2xl flex-shrink-0" />
      <div className="space-y-2">
        <Skeleton className="h-3.5 w-36 rounded-full" />
        <Skeleton className="h-2.5 w-24 rounded-full" />
      </div>
    </div>
    <Skeleton className="h-4 w-12 rounded-full" />
  </div>
);

export const SkeletonPathRow = () => (
  <div className="relative ml-14">
    <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
      <div className="flex items-center gap-4">
        <Skeleton className="w-12 h-12 rounded-xl flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-2.5 w-16 rounded-full" />
          <Skeleton className="h-3.5 w-3/4 rounded-full" />
        </div>
      </div>
    </div>
    <div className="absolute -left-8 top-6 w-4 h-4 rounded-full bg-slate-100 border-2 border-slate-200" />
  </div>
);

export const SkeletonProfileStat = () => (
  <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Skeleton className="w-11 h-11 rounded-xl" />
        <Skeleton className="h-3.5 w-32 rounded-full" />
      </div>
      <Skeleton className="h-8 w-10 rounded-xl" />
    </div>
  </div>
);

// Composed Page Skeletons
export const HomeScreenSkeleton = () => (
  <div className="px-6 py-4 space-y-6 animate-pulse">
    <div className="space-y-1.5">
      <Skeleton className="h-2.5 w-24 rounded-full" />
      <Skeleton className="h-8 w-40 rounded-xl" />
    </div>
    <SkeletonHeroCard />
    <SkeletonStatGrid />
    <SkeletonStreakTracker />
    <div className="space-y-3">
      <Skeleton className="h-3 w-28 rounded-full" />
      <SkeletonCard />
    </div>
  </div>
);

export const ActivityScreenSkeleton = () => (
  <div className="px-6 py-4 space-y-6 animate-pulse">
    <div className="space-y-1.5">
      <Skeleton className="h-8 w-48 rounded-xl" />
      <Skeleton className="h-3 w-56 rounded-full" />
    </div>
    <div className="flex gap-2">
      {[0, 1, 2].map(i => <Skeleton key={i} className="h-7 w-16 rounded-xl" />)}
    </div>
    <div className="space-y-0">
      {[0, 1, 2, 3, 4].map(i => <SkeletonActivityRow key={i} />)}
    </div>
    <SkeletonCard />
  </div>
);

export const PathScreenSkeleton = () => (
  <div className="px-6 py-6 space-y-6 animate-pulse">
    <div className="space-y-1.5">
      <Skeleton className="h-8 w-44 rounded-xl" />
      <Skeleton className="h-3 w-52 rounded-full" />
    </div>
    <div className="bg-violet-50 border border-violet-100 rounded-2xl p-5">
      <div className="flex items-center gap-3">
        <Skeleton className="w-12 h-12 rounded-xl bg-violet-100" />
        <div className="space-y-2">
          <Skeleton className="h-3.5 w-24 rounded-full bg-violet-100" />
          <Skeleton className="h-3 w-32 rounded-full bg-violet-100" />
        </div>
      </div>
    </div>
    <div className="space-y-5">
      {[0, 1, 2].map(i => <SkeletonPathRow key={i} />)}
    </div>
  </div>
);

export const ProfileScreenSkeleton = () => (
  <div className="px-6 py-6 space-y-6 animate-pulse">
    <div className="space-y-1.5">
      <Skeleton className="h-8 w-28 rounded-xl" />
      <Skeleton className="h-3 w-44 rounded-full" />
    </div>
    <div className="bg-violet-50 border border-violet-100 rounded-2xl p-5 flex flex-col items-center gap-3">
      <Skeleton className="w-20 h-20 rounded-full" />
      <Skeleton className="h-5 w-28 rounded-full" />
      <Skeleton className="h-3 w-36 rounded-full" />
    </div>
    <div className="space-y-3">
      <Skeleton className="h-3 w-20 rounded-full" />
      {[0, 1, 2].map(i => <SkeletonProfileStat key={i} />)}
    </div>
    <Skeleton className="h-12 w-full rounded-2xl" />
  </div>
);

// Attach properties to Skeleton function for backwards compatibility
Skeleton.Text = SkeletonText;
Skeleton.Card = SkeletonCard;
Skeleton.StatGrid = SkeletonStatGrid;
Skeleton.HeroCard = SkeletonHeroCard;
Skeleton.StreakTracker = SkeletonStreakTracker;
Skeleton.ActivityRow = SkeletonActivityRow;
Skeleton.PathRow = SkeletonPathRow;
Skeleton.ProfileStat = SkeletonProfileStat;
Skeleton.HomeScreen = HomeScreenSkeleton;
Skeleton.ActivityScreen = ActivityScreenSkeleton;
Skeleton.PathScreen = PathScreenSkeleton;
Skeleton.ProfileScreen = ProfileScreenSkeleton;
