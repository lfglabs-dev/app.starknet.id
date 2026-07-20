import { useAccount } from "@starknet-react/core";
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { decodeError } from "@/lib/chain/errors";
import { rpcRequest, RpcClientError } from "@/lib/chain/rpc";
import { normalizeAddress } from "@/lib/core/address";
import type {
  SubmittedTransaction,
  TransactionIntent,
} from "@/lib/core/types";
import { applyIdentityCacheHints } from "@/lib/identity/cache";
import {
  loadSubmittedTransactions,
  saveSubmittedTransactions,
} from "@/lib/transactions/storage";
import { classifyReceipt } from "@/lib/transactions/receipt";
import { preflightIntent } from "@/lib/transactions/preflight";
import { SN_MAIN_CHAIN } from "@/lib/chain/manifest";

type TransactionsContextValue = {
  transactions: SubmittedTransaction[];
  submit: (intent: TransactionIntent) => Promise<string>;
};

const TransactionsContext = createContext<TransactionsContextValue>({
  transactions: [],
  submit: async () => {
    throw new Error("Transaction provider is unavailable");
  },
});

export function TransactionsProvider({ children }: { children: ReactNode }) {
  const { account, address, chainId } = useAccount();
  const [transactions, setTransactions] = useState<SubmittedTransaction[]>([]);
  const addressRef = useRef<string>();

  useEffect(() => {
    if (!address) {
      addressRef.current = undefined;
      setTransactions([]);
      return;
    }
    const normalized = normalizeAddress(address);
    addressRef.current = normalized;
    setTransactions(loadSubmittedTransactions(normalized));
  }, [address]);

  useEffect(() => {
    const activeAddress = addressRef.current;
    if (
      !activeAddress ||
      transactions.some((transaction) => transaction.account !== activeAddress)
    ) return;
    saveSubmittedTransactions(activeAddress, transactions);
  }, [transactions]);

  const poll = useCallback(async (): Promise<void> => {
    const activeAddress = addressRef.current;
    if (!activeAddress) return;
    const pending = transactions.filter(
      (transaction) =>
        transaction.status === "pending" && transaction.account === activeAddress
    );
    if (!pending.length) return;
    const updates = new Map<string, SubmittedTransaction>();
    await Promise.all(
      pending.map(async (transaction) => {
        try {
          const receipt = await rpcRequest<unknown>(
            "starknet_getTransactionReceipt",
            [transaction.hash]
          );
          const receiptState = classifyReceipt(receipt);
          if (receiptState.status === "reverted") {
            updates.set(transaction.hash, {
              ...transaction,
              status: "reverted",
              revertReason: receiptState.revertReason,
            });
          } else if (receiptState.status === "accepted") {
            updates.set(transaction.hash, { ...transaction, status: "accepted" });
            applyIdentityCacheHints(activeAddress, transaction.cacheHints);
          }
        } catch (error) {
          if (!(error instanceof RpcClientError && error.code === 29)) {
            // Transient receipt errors remain pending and are retried.
          }
        }
      })
    );
    if (!updates.size || addressRef.current !== activeAddress) return;
    setTransactions((current) =>
      current.map((transaction) => updates.get(transaction.hash) ?? transaction)
    );
    if (Array.from(updates.values()).some((transaction) => transaction.status === "accepted")) {
      window.dispatchEvent(new Event("starknet-id:transaction-accepted"));
    }
  }, [transactions]);

  useEffect(() => {
    void poll();
    const timer = window.setInterval(() => void poll(), 6_000);
    return () => window.clearInterval(timer);
  }, [poll]);

  const submit = useCallback(
    async (intent: TransactionIntent): Promise<string> => {
      if (!account || !address) throw new Error("Connect Braavos first");
      if (chainId !== SN_MAIN_CHAIN.id) throw new Error("Switch Braavos to Starknet mainnet");
      try {
        const result = await account.execute(intent.calls);
        const hash = result.transaction_hash;
        const transaction: SubmittedTransaction = {
          hash,
          account: normalizeAddress(address),
          kind: intent.kind,
          status: "pending",
          submittedAt: Date.now(),
          cacheHints: intent.cacheHints,
        };
        setTransactions((current) => [...current, transaction].slice(-50));
        return hash;
      } catch (error) {
        throw new Error(decodeError(error));
      }
    },
    [account, address, chainId]
  );

  return (
    <TransactionsContext.Provider value={{ transactions, submit }}>
      {children}
    </TransactionsContext.Provider>
  );
}

export function useTransactions(): TransactionsContextValue {
  return useContext(TransactionsContext);
}

export function usePreparedTransaction(): (
  prepare: () => Promise<TransactionIntent>
) => Promise<string> {
  const { account } = useAccount();
  const { submit } = useTransactions();

  return useCallback(
    async (prepare: () => Promise<TransactionIntent>): Promise<string> => {
      if (!account) throw new Error("Connect Braavos first");
      const intent = await prepare();
      const report = await preflightIntent(account, intent);
      if (!report.ok) {
        throw new Error(report.revertReason ?? "The transaction simulation failed");
      }
      return submit(intent);
    },
    [account, submit]
  );
}
