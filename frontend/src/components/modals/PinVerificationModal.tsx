import { useState, useRef, useEffect } from 'react';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Lock, AlertTriangle, ShieldCheck } from 'lucide-react';

interface PinVerificationModalProps {
  open: boolean;
  onClose: () => void;
  onVerify: (pin: string) => Promise<boolean>;
  title?: string;
  description?: string;
  maxAttempts?: number;
}

export default function PinVerificationModal({
  open, onClose, onVerify, title = 'PIN Verification',
  description = 'Enter your 6-digit PIN to confirm this action.',
  maxAttempts = 5,
}: PinVerificationModalProps) {
  const [pin, setPin] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [locked, setLocked] = useState(false);
  const [lockTimer, setLockTimer] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (open) {
      setPin(['', '', '', '', '', '']);
      setError('');
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    }
  }, [open]);

  useEffect(() => {
    if (lockTimer > 0) {
      const t = setTimeout(() => setLockTimer((v) => v - 1), 1000);
      return () => clearTimeout(t);
    } else if (locked && lockTimer === 0) {
      setLocked(false);
      setAttempts(0);
    }
  }, [lockTimer, locked]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newPin = [...pin];
    newPin[index] = value.slice(-1);
    setPin(newPin);
    setError('');
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === 'Enter') handleSubmit();
  };

  const handleSubmit = async () => {
    if (locked) return;
    const fullPin = pin.join('');
    if (fullPin.length !== 6) { setError('Enter all 6 digits'); return; }

    setLoading(true);
    try {
      const success = await onVerify(fullPin);
      if (success) {
        onClose();
        setAttempts(0);
      } else {
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);
        if (newAttempts >= maxAttempts) {
          setLocked(true);
          setLockTimer(60);
          setError('Too many failed attempts. Locked for 60 seconds.');
        } else {
          setError(`Incorrect PIN. ${maxAttempts - newAttempts} attempts remaining.`);
        }
        setPin(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      }
    } catch {
      setError('Verification failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-primary" />
            {title}
          </DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="py-6 space-y-6">
          {locked ? (
            <div className="flex flex-col items-center gap-3 p-4 rounded-lg bg-destructive/10">
              <AlertTriangle className="w-10 h-10 text-destructive" />
              <p className="text-sm text-destructive font-medium text-center">Account locked. Try again in {lockTimer}s</p>
            </div>
          ) : (
            <>
              <div className="flex justify-center gap-2">
                {pin.map((digit, i) => (
                  <Input
                    key={i}
                    ref={(el) => { inputRefs.current[i] = el; }}
                    type="password"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(i, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(i, e)}
                    className="w-12 h-14 text-center text-2xl font-mono"
                    disabled={loading}
                  />
                ))}
              </div>
              {error && (
                <div className="flex items-center gap-2 text-sm text-destructive justify-center">
                  <AlertTriangle className="w-4 h-4" />
                  {error}
                </div>
              )}
              {attempts > 0 && !locked && (
                <div className="flex justify-center">
                  <Badge variant="outline" className="text-xs bg-destructive/10 text-destructive border-destructive/30">
                    {maxAttempts - attempts} attempts remaining
                  </Badge>
                </div>
              )}
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={loading || locked}>
            {loading ? (
              'Verifying...'
            ) : (
              <><ShieldCheck className="w-4 h-4 mr-2" /> Verify PIN</>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
