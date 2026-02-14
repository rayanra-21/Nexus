export type TransactionStatus = "success" | "pending" | "failed";

export interface Transaction {
  id: string;
  type: "deposit" | "withdraw" | "transfer" | "funding";
  amount: number;
  sender: string;
  receiver: string;
  status: TransactionStatus;
  date: string;
}

let walletBalance = 2500;

let transactions: Transaction[] = [
  {
    id: "tx1",
    type: "deposit",
    amount: 1000,
    sender: "Stripe",
    receiver: "Wallet",
    status: "success",
    date: new Date().toISOString(),
  },
  {
    id: "tx2",
    type: "transfer",
    amount: 500,
    sender: "Investor A",
    receiver: "Entrepreneur B",
    status: "pending",
    date: new Date().toISOString(),
  },
];

export const getWalletBalance = () => walletBalance;

export const getTransactions = () => transactions;

export const addTransaction = (tx: Transaction) => {
  transactions = [tx, ...transactions];
};

export const updateBalance = (newBalance: number) => {
  walletBalance = newBalance;
};
