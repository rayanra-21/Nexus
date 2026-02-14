import React, { useState } from "react";
import { Card, CardHeader, CardBody } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Badge } from "../../components/ui/Badge";
import { ArrowDownToLine, ArrowUpFromLine, Send, CreditCard, Wallet } from "lucide-react";
import { getWalletBalance, getTransactions, addTransaction, updateBalance, Transaction } from "../../data/wallet";
import { useAuth } from "../../context/AuthContext";

export const WalletPage: React.FC = () => {
  const { user } = useAuth();
  const [balance, setBalance] = useState(getWalletBalance());
  const [transactions, setTransactions] = useState(getTransactions());

  const [activeTab, setActiveTab] = useState<"deposit" | "withdraw" | "transfer" | "funding">("deposit");

  const [amount, setAmount] = useState("");
  const [receiver, setReceiver] = useState("");
  const [dealName, setDealName] = useState("");

  if (!user) return null;

  const createTransaction = (type: Transaction["type"], sender: string, receiverName: string, amt: number) => {
    const tx: Transaction = {
      id: "tx_" + Math.random().toString(36).slice(2),
      type,
      amount: amt,
      sender,
      receiver: receiverName,
      status: "success",
      date: new Date().toISOString(),
    };

    addTransaction(tx);
    setTransactions(getTransactions());
  };

  const handleDeposit = () => {
    const amt = Number(amount);
    if (!amt || amt <= 0) return alert("Enter valid deposit amount");

    const newBal = balance + amt;
    updateBalance(newBal);
    setBalance(newBal);

    createTransaction("deposit", "Stripe", user.name, amt);

    setAmount("");
  };

  const handleWithdraw = () => {
    const amt = Number(amount);
    if (!amt || amt <= 0) return alert("Enter valid withdraw amount");
    if (amt > balance) return alert("Insufficient balance");

    const newBal = balance - amt;
    updateBalance(newBal);
    setBalance(newBal);

    createTransaction("withdraw", user.name, "Bank Account", amt);

    setAmount("");
  };

  const handleTransfer = () => {
    const amt = Number(amount);
    if (!amt || amt <= 0) return alert("Enter valid transfer amount");
    if (!receiver.trim()) return alert("Enter receiver name");
    if (amt > balance) return alert("Insufficient balance");

    const newBal = balance - amt;
    updateBalance(newBal);
    setBalance(newBal);

    createTransaction("transfer", user.name, receiver, amt);

    setAmount("");
    setReceiver("");
  };

  const handleFundingDeal = () => {
    const amt = Number(amount);
    if (!amt || amt <= 0) return alert("Enter valid funding amount");
    if (!receiver.trim()) return alert("Enter entrepreneur name");
    if (!dealName.trim()) return alert("Enter deal name");
    if (amt > balance) return alert("Insufficient balance");

    const newBal = balance - amt;
    updateBalance(newBal);
    setBalance(newBal);

    createTransaction("funding", `${user.name} (Investor)`, `${receiver} (Entrepreneur)`, amt);

    setAmount("");
    setReceiver("");
    setDealName("");
  };

  const getStatusBadge = (status: string) => {
    if (status === "success") return <Badge variant="success">Success</Badge>;
    if (status === "pending") return <Badge variant="secondary">Pending</Badge>;
    return <Badge variant="error">Failed</Badge>;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Wallet & Payments</h1>
          <p className="text-gray-600">Manage deposits, transfers and deal funding</p>
        </div>
      </div>

      {/* Balance */}
      <Card className="bg-gradient-to-r from-primary-600 to-primary-800 text-white border-none">
        <CardBody className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <p className="text-sm opacity-80">Available Balance</p>
            <h2 className="text-3xl font-bold mt-1">${balance.toLocaleString()}</h2>
            <p className="text-sm opacity-80 mt-1">Secure wallet (mock payments)</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-3 rounded-xl">
              <Wallet size={28} />
            </div>
            <div className="bg-white/20 p-3 rounded-xl">
              <CreditCard size={28} />
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        <Button variant={activeTab === "deposit" ? "primary" : "outline"} onClick={() => setActiveTab("deposit")}>
          Deposit
        </Button>

        <Button variant={activeTab === "withdraw" ? "primary" : "outline"} onClick={() => setActiveTab("withdraw")}>
          Withdraw
        </Button>

        <Button variant={activeTab === "transfer" ? "primary" : "outline"} onClick={() => setActiveTab("transfer")}>
          Transfer
        </Button>

        <Button variant={activeTab === "funding" ? "primary" : "outline"} onClick={() => setActiveTab("funding")}>
          Fund Deal
        </Button>
      </div>

      {/* Payment UI */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-gray-900">
            {activeTab === "deposit" && "Deposit Money"}
            {activeTab === "withdraw" && "Withdraw Money"}
            {activeTab === "transfer" && "Transfer Money"}
            {activeTab === "funding" && "Funding Deal Flow"}
          </h2>
        </CardHeader>

        <CardBody className="space-y-4">
          {activeTab === "funding" && (
            <Input
              placeholder="Deal Name (ex: Seed Funding Round)"
              value={dealName}
              onChange={(e) => setDealName(e.target.value)}
              fullWidth
            />
          )}

          {(activeTab === "transfer" || activeTab === "funding") && (
            <Input
              placeholder={activeTab === "funding" ? "Entrepreneur Name" : "Receiver Name"}
              value={receiver}
              onChange={(e) => setReceiver(e.target.value)}
              fullWidth
            />
          )}

          <Input
            placeholder="Enter amount (USD)"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            fullWidth
          />

          <div className="flex gap-3 flex-wrap">
            {activeTab === "deposit" && (
              <Button leftIcon={<ArrowDownToLine size={18} />} onClick={handleDeposit}>
                Deposit
              </Button>
            )}

            {activeTab === "withdraw" && (
              <Button leftIcon={<ArrowUpFromLine size={18} />} onClick={handleWithdraw}>
                Withdraw
              </Button>
            )}

            {activeTab === "transfer" && (
              <Button leftIcon={<Send size={18} />} onClick={handleTransfer}>
                Transfer
              </Button>
            )}

            {activeTab === "funding" && (
              <Button leftIcon={<Send size={18} />} onClick={handleFundingDeal}>
                Fund Deal
              </Button>
            )}
          </div>
        </CardBody>
      </Card>

      {/* Transactions */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-gray-900">Transaction History</h2>
        </CardHeader>

        <CardBody>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-gray-500 border-b">
                <tr>
                  <th className="text-left py-3 px-2">Type</th>
                  <th className="text-left py-3 px-2">Amount</th>
                  <th className="text-left py-3 px-2">Sender</th>
                  <th className="text-left py-3 px-2">Receiver</th>
                  <th className="text-left py-3 px-2">Status</th>
                  <th className="text-left py-3 px-2">Date</th>
                </tr>
              </thead>

              <tbody>
                {transactions.length > 0 ? (
                  transactions.map((tx) => (
                    <tr key={tx.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-2 capitalize">{tx.type}</td>
                      <td className="py-3 px-2 font-semibold text-gray-900">
                        ${tx.amount.toLocaleString()}
                      </td>
                      <td className="py-3 px-2">{tx.sender}</td>
                      <td className="py-3 px-2">{tx.receiver}</td>
                      <td className="py-3 px-2">{getStatusBadge(tx.status)}</td>
                      <td className="py-3 px-2 text-gray-500">
                        {new Date(tx.date).toLocaleString()}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-gray-500">
                      No transactions yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default WalletPage;
