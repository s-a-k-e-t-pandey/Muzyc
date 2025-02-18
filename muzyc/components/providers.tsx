"use client";

import { SocketContextProvider } from "@/context/socket-context";
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { type ThemeProviderProps } from "next-themes/dist/types";

export function Providers({ children, session }: { children: React.ReactNode, session: any }) {
  return (
    <ConnectionProvider endpoint={"https://api.devnet.solana.com"}>
        <WalletProvider wallets={[]} autoConnect>
            <WalletModalProvider>
              <SessionProvider session={session}>
                <SocketContextProvider>{children}</SocketContextProvider>
              </SessionProvider>
            </WalletModalProvider>
        </WalletProvider>
    </ConnectionProvider>
  );
}

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}