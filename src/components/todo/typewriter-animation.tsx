"use client";

import { WeedoLogo } from '../icons';

export function LoadingAnimation() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4 gap-8">
        <WeedoLogo className="w-24 h-24 text-primary slim-pulse-logo" />
        <p className="text-lg font-semibold text-foreground">Loading Weedo...</p>
    </div>
  );
}
