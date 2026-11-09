"use client";

import { createDAppKit, DAppKitProvider } from "@mysten/dapp-kit-react";
import { SuiGrpcClient } from "@mysten/sui/grpc";
import type { ReactNode } from "react";

const GRPC_URLS = {
  mainnet: process.env.NEXT_PUBLIC_SUI_GRPC_URL ?? "https://fullnode.mainnet.sui.io:443",
} as const;

export const dAppKit = createDAppKit({
  networks: ["mainnet"],
  defaultNetwork: "mainnet",
  autoConnect: true,
  createClient: (network) => new SuiGrpcClient({ network, baseUrl: GRPC_URLS[network] }),
  slushWalletConfig: { appName: "Suinance" },
});

declare module "@mysten/dapp-kit-react" {
  interface Register {
    dAppKit: typeof dAppKit;
  }
}

export function DappProvider({ children }: { children: ReactNode }) {
  return <DAppKitProvider dAppKit={dAppKit}>{children}</DAppKitProvider>;
}
