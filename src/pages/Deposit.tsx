import { useState } from "react";
import { Link } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Wallet, 
  CreditCard, 
  Smartphone, 
  Building2, 
  QrCode,
  Shield,
  Clock,
  Gift,
  ChevronRight,
  Plus,
  Check,
  AlertCircle
} from "lucide-react";

const paymentMethods = [
  { id: "esewa", name: "eSewa", icon: "💳", popular: true },
  { id: "khalti", name: "Khalti", icon: "📱", popular: true },
  { id: "bank", name: "Bank Transfer", icon: "🏦" },
  { id: "upi", name: "UPI", icon: "📲" },
  { id: "card", name: "Credit/Debit Card", icon: "💳" },
];

const quickAmounts = [500, 1000, 2000, 5000, 10000, 25000];

const recentTransactions = [
  { type: "deposit", amount: 5000, method: "eSewa", date: "Today, 2:30 PM", status: "success" },
  { type: "withdrawal", amount: 2500, method: "Khalti", date: "Yesterday", status: "success" },
  { type: "deposit", amount: 10000, method: "Bank", date: "3 days ago", status: "success" },
  { type: "bonus", amount: 500, method: "Referral", date: "1 week ago", status: "success" },
];

export default function Deposit() {
  const [selectedMethod, setSelectedMethod] = useState("esewa");
  const [amount, setAmount] = useState(1000);
  const [step, setStep] = useState(1);

  const handleAmountChange = (value: number) => {
    setAmount(Math.max(100, Math.min(100000, value)));
  };

  const bonus = amount >= 500 ? Math.floor(amount * 0.1) : 0;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-28 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Add Funds</h1>
            <p className="text-muted-foreground">Quick, secure deposits with instant credit</p>
          </div>

          {/* Bonus Banner */}
          <div className="glass rounded-xl p-4 mb-8 bg-gradient-to-r from-neon-green/10 to-accent/10 border-neon-green/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Gift className="w-8 h-8 text-neon-green" />
                <div>
                  <p className="font-semibold">10% Deposit Bonus!</p>
                  <p className="text-sm text-muted-foreground">Minimum deposit ₹500</p>
                </div>
              </div>
              {bonus > 0 && (
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">You'll get</p>
                  <p className="text-xl font-bold text-neon-green">+₹{bonus}</p>
                </div>
              )}
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Step 1: Amount */}
              <div className="glass rounded-xl p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-sm font-bold text-primary-foreground">
                    1
                  </div>
                  <h2 className="text-lg font-semibold">Enter Amount</h2>
                </div>

                <div className="space-y-4">
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-medium">₹</span>
                    <Input
                      type="number"
                      value={amount}
                      onChange={(e) => handleAmountChange(Number(e.target.value))}
                      className="text-center text-3xl font-bold h-16 pl-8"
                    />
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {quickAmounts.map((amt) => (
                      <Button
                        key={amt}
                        variant={amount === amt ? "default" : "outline"}
                        size="sm"
                        onClick={() => setAmount(amt)}
                      >
                        ₹{amt.toLocaleString()}
                      </Button>
                    ))}
                  </div>

                  <div className="flex items-center justify-between text-sm pt-4 border-t border-border">
                    <span className="text-muted-foreground">Min: ₹100</span>
                    <span className="text-muted-foreground">Max: ₹100,000</span>
                  </div>
                </div>
              </div>

              {/* Step 2: Payment Method */}
              <div className="glass rounded-xl p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-sm font-bold text-primary-foreground">
                    2
                  </div>
                  <h2 className="text-lg font-semibold">Select Payment Method</h2>
                </div>

                <div className="grid sm:grid-cols-2 gap-3">
                  {paymentMethods.map((method) => (
                    <button
                      key={method.id}
                      onClick={() => setSelectedMethod(method.id)}
                      className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                        selectedMethod === method.id
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{method.icon}</span>
                        <div className="text-left">
                          <p className="font-medium">{method.name}</p>
                          {method.popular && (
                            <span className="text-xs text-neon-green">Popular</span>
                          )}
                        </div>
                      </div>
                      {selectedMethod === method.id && (
                        <Check className="w-5 h-5 text-primary" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 3: Payment Details */}
              {(selectedMethod === "esewa" || selectedMethod === "khalti") && (
                <div className="glass rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-sm font-bold text-primary-foreground">
                      3
                    </div>
                    <h2 className="text-lg font-semibold">Scan QR Code</h2>
                  </div>

                  <div className="text-center">
                    {/* Placeholder QR Code */}
                    <div className="w-48 h-48 mx-auto bg-white rounded-xl p-4 mb-4">
                      <div className="w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyMSAyMSI+PHBhdGggZD0iTTEgMWg3djdIMXptMiAyaDN2M0gzem0xMi0yaDd2N2gtN3ptMiAyaDN2M2gtM3pNMSAxM2g3djdIMXptMiAyaDN2M0gzem0xMC0yaDJ2MmgtMnptMiAwaDJ2MmgtMnptMi0yaDJ2MmgtMnptMCAyaDJ2MmgtMnptMCAyaDJ2MmgtMnptLTQgMGgydjJoLTJ6bTIgMGgydjJoLTJ6bS00IDJoMnYyaC0yem0yIDBoMnYyaC0yem0yIDBoMnYyaC0yem0tMiAyaDJ2MmgtMnptMiAwaDJ2MmgtMnoiIGZpbGw9IiMwMDAiLz48L3N2Zz4=')] bg-contain bg-center bg-no-repeat" />
                    </div>
                    <p className="text-muted-foreground mb-4">
                      Scan with {selectedMethod === "esewa" ? "eSewa" : "Khalti"} app to pay
                    </p>
                    <div className="flex items-center justify-center gap-2 text-sm">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">QR expires in 10:00</span>
                    </div>
                  </div>
                </div>
              )}

              {selectedMethod === "bank" && (
                <div className="glass rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-sm font-bold text-primary-foreground">
                      3
                    </div>
                    <h2 className="text-lg font-semibold">Bank Transfer Details</h2>
                  </div>

                  <div className="space-y-4">
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <p className="text-sm text-muted-foreground mb-1">Bank Name</p>
                      <p className="font-medium">Nepal Investment Bank</p>
                    </div>
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <p className="text-sm text-muted-foreground mb-1">Account Name</p>
                      <p className="font-medium">KarnaliX Gaming Pvt. Ltd.</p>
                    </div>
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <p className="text-sm text-muted-foreground mb-1">Account Number</p>
                      <p className="font-medium font-mono">01234567890123</p>
                    </div>

                    <div className="p-4 bg-accent/10 rounded-lg border border-accent/30">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                        <p className="text-sm">
                          Please include your username in the transfer remarks for faster processing.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Proceed Button */}
              <Button variant="neon" size="xl" className="w-full gap-2">
                Deposit ₹{amount.toLocaleString()}
                {bonus > 0 && <span className="text-xs">+₹{bonus} bonus</span>}
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Summary */}
              <div className="glass rounded-xl p-6">
                <h3 className="font-semibold mb-4">Summary</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Deposit Amount</span>
                    <span className="font-mono">₹{amount.toLocaleString()}</span>
                  </div>
                  {bonus > 0 && (
                    <div className="flex justify-between text-neon-green">
                      <span>Bonus (10%)</span>
                      <span className="font-mono">+₹{bonus}</span>
                    </div>
                  )}
                  <div className="pt-3 border-t border-border flex justify-between font-semibold">
                    <span>Total Credit</span>
                    <span className="font-mono text-lg">₹{(amount + bonus).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Trust Badges */}
              <div className="glass rounded-xl p-6">
                <h3 className="font-semibold mb-4">Secure Payments</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-neon-green" />
                    <span>256-bit SSL Encryption</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-primary" />
                    <span>Instant Credit</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Wallet className="w-5 h-5 text-accent" />
                    <span>No Hidden Charges</span>
                  </div>
                </div>
              </div>

              {/* Recent Transactions */}
              <div className="glass rounded-xl p-6">
                <h3 className="font-semibold mb-4">Recent Transactions</h3>
                <div className="space-y-3">
                  {recentTransactions.slice(0, 3).map((tx, i) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <div>
                        <p className="font-medium capitalize">{tx.type}</p>
                        <p className="text-xs text-muted-foreground">{tx.method}</p>
                      </div>
                      <div className="text-right">
                        <p className={`font-mono ${tx.type === "withdrawal" ? "text-neon-red" : "text-neon-green"}`}>
                          {tx.type === "withdrawal" ? "-" : "+"}₹{tx.amount.toLocaleString()}
                        </p>
                        <p className="text-xs text-muted-foreground">{tx.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <Button variant="ghost" size="sm" className="w-full mt-4">
                  View All Transactions
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
