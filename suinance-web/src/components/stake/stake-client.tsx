"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";

function Skeleton() {
  return (
    <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]" aria-busy="true" aria-label="Loading staking">
      <div className="h-[420px] animate-pulse rounded-card border-[1.5px] border-ink/20 bg-yellow-wash" />
      <div className="h-[420px] animate-pulse rounded-card border-[1.5px] border-ink/20 bg-paper" />
    </div>
  );
}

// The wallet SDK only runs in the browser, so it is never evaluated during server rendering.
const StakeWithWallet = dynamic(
  async () => {
    const [{ DappProvider }, { StakeApp }] = await Promise.all([import("./dapp-provider"), import("./stake-app")]);
    return function StakeWithWallet() {
      return (
        <DappProvider>
          <Suspense fallback={<Skeleton />}>
            <StakeApp />
          </Suspense>
        </DappProvider>
      );
    };
  },
  { ssr: false, loading: Skeleton },
);

export function StakeClient() {
  return <StakeWithWallet />;
}
