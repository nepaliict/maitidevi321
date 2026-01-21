import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Filter,
  Download,
  Search,
  CreditCard,
  Clock,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface Transaction {
  id: string;
  type: "deposit" | "withdrawal" | "bonus" | "bet_win" | "bet_loss";
  amount: number;
  method: string;
  date: string;
  status: "success" | "pending" | "failed";
  reference?: string;
}

const transactions: Transaction[] = [
  { id: "1", type: "deposit", amount: 5000, method: "eSewa", date: "2024-01-15 14:30", status: "success", reference: "ESW123456" },
  { id: "2", type: "bet_win", amount: 2500, method: "Aviator", date: "2024-01-15 12:15", status: "success" },
  { id: "3", type: "withdrawal", amount: -3000, method: "Khalti", date: "2024-01-14 18:45", status: "pending", reference: "KHL789012" },
  { id: "4", type: "bet_loss", amount: -1000, method: "Teen Patti", date: "2024-01-14 16:20", status: "success" },
  { id: "5", type: "bonus", amount: 500, method: "Referral Bonus", date: "2024-01-13 10:00", status: "success" },
  { id: "6", type: "deposit", amount: 10000, method: "Bank Transfer", date: "2024-01-12 09:30", status: "success", reference: "BNK345678" },
  { id: "7", type: "bet_win", amount: 8500, method: "Roulette", date: "2024-01-11 22:45", status: "success" },
  { id: "8", type: "withdrawal", amount: -5000, method: "eSewa", date: "2024-01-10 14:00", status: "success", reference: "ESW901234" },
];

interface WalletSectionProps {
  walletBalance: number;
  onRequestWithdraw: () => void;
}

export function WalletSection({ walletBalance, onRequestWithdraw }: WalletSectionProps) {
  const [filter, setFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const filteredTransactions = transactions.filter((t) => {
    if (filter !== "all" && t.type !== filter) return false;
    if (searchQuery && !t.method.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "deposit":
        return <ArrowDownRight className="w-4 h-4 text-neon-green" />;
      case "withdrawal":
        return <ArrowUpRight className="w-4 h-4 text-neon-red" />;
      case "bonus":
        return <CreditCard className="w-4 h-4 text-accent" />;
      case "bet_win":
        return <ArrowUpRight className="w-4 h-4 text-neon-green" />;
      case "bet_loss":
        return <ArrowDownRight className="w-4 h-4 text-neon-red" />;
      default:
        return <CreditCard className="w-4 h-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "success":
        return (
          <span className="flex items-center gap-1 text-xs text-neon-green bg-neon-green/10 px-2 py-1 rounded-full">
            <Check className="w-3 h-3" /> Success
          </span>
        );
      case "pending":
        return (
          <span className="flex items-center gap-1 text-xs text-accent bg-accent/10 px-2 py-1 rounded-full">
            <Clock className="w-3 h-3" /> Pending
          </span>
        );
      case "failed":
        return (
          <span className="flex items-center gap-1 text-xs text-neon-red bg-neon-red/10 px-2 py-1 rounded-full">
            <X className="w-3 h-3" /> Failed
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Balance Cards */}
      <div className="grid sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="glass rounded-xl p-4 sm:p-6 bg-gradient-to-br from-primary/10 to-primary/5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-primary/20 flex items-center justify-center">
              <Wallet className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
            </div>
            <div>
              <p className="text-xs sm:text-sm text-muted-foreground">Available Balance</p>
              <p className="text-xl sm:text-3xl font-bold font-mono">₹{walletBalance.toLocaleString()}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Link to="/deposit" className="flex-1">
              <Button variant="neon" size="sm" className="w-full gap-1 text-xs sm:text-sm">
                <Plus className="w-4 h-4" /> Add Funds
              </Button>
            </Link>
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1 gap-1 text-xs sm:text-sm"
              onClick={onRequestWithdraw}
            >
              <ArrowUpRight className="w-4 h-4" /> Withdraw
            </Button>
          </div>
        </div>

        <div className="glass rounded-xl p-4 sm:p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-neon-green/20 flex items-center justify-center">
              <ArrowDownRight className="w-4 h-4 sm:w-5 sm:h-5 text-neon-green" />
            </div>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mb-1">Total Deposits</p>
          <p className="text-lg sm:text-2xl font-bold font-mono text-neon-green">₹1,25,000</p>
          <p className="text-xs text-muted-foreground mt-1">This month</p>
        </div>

        <div className="glass rounded-xl p-4 sm:p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-neon-red/20 flex items-center justify-center">
              <ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5 text-neon-red" />
            </div>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mb-1">Total Withdrawals</p>
          <p className="text-lg sm:text-2xl font-bold font-mono">₹85,000</p>
          <p className="text-xs text-muted-foreground mt-1">This month</p>
        </div>
      </div>

      {/* Transaction History */}
      <div className="glass rounded-xl p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <h2 className="text-lg font-semibold">Transaction History</h2>
          <div className="flex flex-wrap gap-2">
            <div className="relative flex-1 sm:flex-none">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 w-full sm:w-40"
              />
            </div>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="h-9 px-3 rounded-lg bg-muted border border-border text-sm"
            >
              <option value="all">All Types</option>
              <option value="deposit">Deposits</option>
              <option value="withdrawal">Withdrawals</option>
              <option value="bonus">Bonuses</option>
              <option value="bet_win">Wins</option>
              <option value="bet_loss">Losses</option>
            </select>
            <Button variant="outline" size="sm" className="gap-1">
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Export</span>
            </Button>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Type</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Method/Game</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Date</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Status</th>
                <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground">Amount</th>
              </tr>
            </thead>
            <tbody>
              {paginatedTransactions.map((t) => (
                <tr key={t.id} className="border-b border-border/50 hover:bg-muted/30">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        t.type.includes("win") || t.type === "deposit" || t.type === "bonus"
                          ? "bg-neon-green/10"
                          : "bg-neon-red/10"
                      }`}>
                        {getTypeIcon(t.type)}
                      </div>
                      <span className="capitalize text-sm">{t.type.replace("_", " ")}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <p className="text-sm">{t.method}</p>
                    {t.reference && (
                      <p className="text-xs text-muted-foreground font-mono">{t.reference}</p>
                    )}
                  </td>
                  <td className="py-3 px-4 text-sm text-muted-foreground">{t.date}</td>
                  <td className="py-3 px-4">{getStatusBadge(t.status)}</td>
                  <td className={`py-3 px-4 text-right font-mono font-medium ${
                    t.amount > 0 ? "text-neon-green" : "text-neon-red"
                  }`}>
                    {t.amount > 0 ? "+" : ""}₹{Math.abs(t.amount).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
            <p className="text-sm text-muted-foreground">
              Showing {(currentPage - 1) * itemsPerPage + 1}-
              {Math.min(currentPage * itemsPerPage, filteredTransactions.length)} of{" "}
              {filteredTransactions.length}
            </p>
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(page)}
                  className="w-8"
                >
                  {page}
                </Button>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
