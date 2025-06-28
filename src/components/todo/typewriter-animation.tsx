"use client";

import { WeedoLogo } from '../icons';

export function TypewriterAnimation() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4 gap-8">
      <div className="typewriter">
        <div className="slide"><i></i></div>
        <div className="paper"></div>
        <div className="keyboard"></div>
      </div>
      <div className="flex items-center gap-4">
        <WeedoLogo className="w-8 h-8 text-primary" />
        <p className="text-lg font-semibold text-foreground">Loading Weedo...</p>
      </div>
    </div>
  );
}
