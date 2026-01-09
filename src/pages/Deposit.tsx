import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { MobileNav } from "@/components/layout/MobileNav";
import { WhatsAppButton, whatsAppLinks } from "@/components/layout/WhatsAppButton";
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
  AlertCircle,
  MessageCircle,
  Zap,
  Upload,
  Image,
  FileText,
  X
} from "lucide-react";

const paymentMethods = [
  { id: "esewa", name: "eSewa", icon: "💳", popular: true, minLimit: 500, maxLimit: 25000 },
  { id: "khalti", name: "Khalti", icon: "📱", popular: true, minLimit: 100, maxLimit: 50000 },
  { id: "bank", name: "Bank Transfer", icon: "🏦", minLimit: 1000, maxLimit: 100000 },
  { id: "upi", name: "UPI", icon: "📲", minLimit: 100, maxLimit: 100000 },
  { id: "card", name: "Credit/Debit Card", icon: "💳", minLimit: 500, maxLimit: 100000 },
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
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadedPreview, setUploadedPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentMethod = paymentMethods.find(m => m.id === selectedMethod);

  const handleAmountChange = (value: number) => {
    const min = currentMethod?.minLimit || 100;
    const max = currentMethod?.maxLimit || 100000;
    setAmount(Math.max(min, Math.min(max, value)));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'application/pdf'];
      if (!validTypes.includes(file.type)) {
        alert('Please upload PNG, JPG, or PDF file only');
        return;
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }
      setUploadedFile(file);
      
      // Create preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setUploadedPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        setUploadedPreview(null);
      }
    }
  };

  const removeUploadedFile = () => {
    setUploadedFile(null);
    setUploadedPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const bonus = amount >= 500 ? Math.floor(amount * 0.1) : 0;

  return (
    <div className="min-h-screen bg-background pb-16 md:pb-0">
      <Header />
      
      <main className="pt-28 pb-20 md:pb-16">
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
                    <span className="text-muted-foreground">Min: ₹{currentMethod?.minLimit.toLocaleString()}</span>
                    <span className="text-muted-foreground">Max: ₹{currentMethod?.maxLimit.toLocaleString()}</span>
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
                          <div className="flex items-center gap-2">
                            {method.popular && (
                              <span className="text-xs text-neon-green">Popular</span>
                            )}
                            <span className="text-xs text-muted-foreground">
                              ₹{method.minLimit.toLocaleString()}-₹{method.maxLimit.toLocaleString()}
                            </span>
                          </div>
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
                <div className="glass rounded-xl p-4 sm:p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-sm font-bold text-primary-foreground">
                      3
                    </div>
                    <h2 className="text-lg font-semibold">Scan QR Code</h2>
                  </div>

                  <div className="text-center">
                    {/* Payment Limit Notice */}
                    <div className="mb-4 p-3 bg-accent/10 rounded-lg border border-accent/30">
                      <p className="text-sm font-medium text-accent">
                        {selectedMethod === "esewa" ? "eSewa" : "Khalti"} Limit: ₹{currentMethod?.minLimit.toLocaleString()} - ₹{currentMethod?.maxLimit.toLocaleString()}
                      </p>
                    </div>
                    
                    {/* Placeholder QR Code */}
                    <div className="w-40 h-40 sm:w-48 sm:h-48 mx-auto bg-white rounded-xl p-4 mb-4">
                      <div className="w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyMSAyMSI+PHBhdGggZD0iTTEgMWg3djdIMXptMiAyaDN2M0gzem0xMi0yaDd2N2gtN3ptMiAyaDN2M2gtM3pNMSAxM2g3djdIMXptMiAyaDN2M0gzem0xMC0yaDJ2MmgtMnptMiAwaDJ2MmgtMnptMi0yaDJ2MmgtMnptMCAyaDJ2MmgtMnptMCAyaDJ2MmgtMnptLTQgMGgydjJoLTJ6bTIgMGgydjJoLTJ6bS00IDJoMnYyaC0yem0yIDBoMnYyaC0yem0yIDBoMnYyaC0yem0tMiAyaDJ2MmgtMnptMiAwaDJ2MmgtMnoiIGZpbGw9IiMwMDAiLz48L3N2Zz4=')] bg-contain bg-center bg-no-repeat" />
                    </div>
                    <p className="text-muted-foreground mb-2">
                      Scan with {selectedMethod === "esewa" ? "eSewa" : "Khalti"} app to pay
                    </p>
                    <div className="flex items-center justify-center gap-2 text-sm mb-6">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">QR expires in 10:00</span>
                    </div>
                  </div>

                  {/* Payment Screenshot Upload */}
                  <div className="border-t border-border pt-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 rounded-full bg-neon-green/20 flex items-center justify-center text-sm font-bold text-neon-green">
                        4
                      </div>
                      <div>
                        <h3 className="font-semibold">Upload Payment Screenshot</h3>
                        <p className="text-xs text-muted-foreground">After completing payment, upload proof</p>
                      </div>
                    </div>

                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      accept=".png,.jpg,.jpeg,.pdf"
                      className="hidden"
                    />

                    {!uploadedFile ? (
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full p-6 sm:p-8 border-2 border-dashed border-border rounded-xl hover:border-primary/50 transition-colors"
                      >
                        <div className="flex flex-col items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                            <Upload className="w-6 h-6 text-primary" />
                          </div>
                          <div className="text-center">
                            <p className="font-medium">Click to upload screenshot</p>
                            <p className="text-sm text-muted-foreground">PNG, JPG, or PDF (max 5MB)</p>
                          </div>
                        </div>
                      </button>
                    ) : (
                      <div className="p-4 bg-muted/30 rounded-xl">
                        <div className="flex items-center gap-4">
                          {uploadedPreview ? (
                            <img 
                              src={uploadedPreview} 
                              alt="Payment proof" 
                              className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg"
                            />
                          ) : (
                            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-primary/10 rounded-lg flex items-center justify-center">
                              <FileText className="w-8 h-8 text-primary" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{uploadedFile.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {(uploadedFile.size / 1024).toFixed(1)} KB
                            </p>
                            <div className="flex items-center gap-1 text-neon-green text-sm mt-1">
                              <Check className="w-4 h-4" />
                              <span>Ready to submit</span>
                            </div>
                          </div>
                          <button
                            onClick={removeUploadedFile}
                            className="p-2 hover:bg-muted rounded-lg transition-colors"
                          >
                            <X className="w-5 h-5 text-muted-foreground" />
                          </button>
                        </div>
                      </div>
                    )}
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

              {/* Instant Deposit via WhatsApp */}
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">Or for instant processing</p>
                <a href={whatsAppLinks.deposit} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" size="lg" className="w-full gap-2 border-[#25D366] hover:bg-[#25D366]/10">
                    <MessageCircle className="w-5 h-5 text-[#25D366]" />
                    Instant Deposit via WhatsApp
                    <Zap className="w-4 h-4 text-accent" />
                  </Button>
                </a>
              </div>
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
      <MobileNav />
      <WhatsAppButton message="Hi! I want to deposit funds to my KarnaliX account." />
    </div>
  );
}
