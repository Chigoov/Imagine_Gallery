import React, { useEffect, useState } from 'react';
import { Lock } from 'lucide-react';
import { Button } from '../../components/ui/Button';

interface AppLockModalProps {
  isOpen: boolean;
  onUnlock: () => void;
  savedPin: string;
  setupMode?: boolean;
  onSetPin?: (pinHash: string) => void;
}

async function hashPin(pin: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(pin), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt, iterations: 150_000 }, key, 256);
  const hex = (bytes: Uint8Array) => Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
  return `pbkdf2:${hex(salt)}:${hex(new Uint8Array(bits))}`;
}

async function verifyPin(pin: string, stored: string): Promise<boolean> {
  if (/^\d{4}$/.test(stored)) return pin === stored;
  const [, saltHex, hashHex] = stored.split(':');
  if (!saltHex || !hashHex || !/^[a-f\d]{32}$/.test(saltHex) || !/^[a-f\d]{64}$/.test(hashHex)) return false;
  const salt = Uint8Array.from(saltHex.match(/.{2}/g)!, (byte) => parseInt(byte, 16));
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(pin), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt, iterations: 150_000 }, key, 256);
  const actual = Array.from(new Uint8Array(bits), (byte) => byte.toString(16).padStart(2, '0')).join('');
  return actual === hashHex;
}

export const AppLockModal: React.FC<AppLockModalProps> = ({
  isOpen,
  onUnlock,
  savedPin,
  setupMode = false,
  onSetPin,
}) => {
  const [pinInput, setPinInput] = useState('');
  const [error, setError] = useState(false);
  const [isSettingNewPin, setIsSettingNewPin] = useState(setupMode || !savedPin);

  useEffect(() => {
    if (!isOpen) return;
    setPinInput('');
    setError(false);
    setIsSettingNewPin(setupMode || !savedPin);
  }, [isOpen, setupMode, savedPin]);

  if (!isOpen) return null;

  const handleDigit = async (digit: string) => {
    if (pinInput.length < 4) {
      const next = pinInput + digit;
      setPinInput(next);
      setError(false);

      if (next.length === 4) {
        if (!/^\d{4}$/.test(next)) {
          setError(true);
          setPinInput('');
          return;
        }
        if (isSettingNewPin) {
          if (onSetPin) onSetPin(await hashPin(next));
          setIsSettingNewPin(false);
          setPinInput('');
          onUnlock();
        } else {
          if (await verifyPin(next, savedPin)) {
            if (/^\d{4}$/.test(savedPin) && onSetPin) onSetPin(await hashPin(next));
            setTimeout(() => {
              setPinInput('');
              onUnlock();
            }, 100);
          } else {
            setError(true);
            setTimeout(() => setPinInput(''), 400);
          }
        }
      }
    }
  };

  const handleBackspace = () => {
    setPinInput((prev) => prev.slice(0, -1));
    setError(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4 bg-player text-app-primary select-none">
      {/* Branding and Privacy Shield */}
      <div className="w-full max-w-xs flex flex-col items-center text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-surface border border-subtle flex items-center justify-center shadow-glass relative">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-700/20 flex items-center justify-center text-accent">
            <Lock className="w-6 h-6" />
          </div>
        </div>

        <div>
          <h2 className="text-xl font-bold tracking-tight">Ruang pribadi terkunci</h2>
          <p className="text-xs text-app-muted mt-1">
            {isSettingNewPin
              ? 'Buat PIN 4 digit untuk melindungi galeri pribadi'
              : 'Masukkan PIN 4 digit untuk membuka papan pribadi'}
          </p>
        </div>

        {/* PIN Dots */}
        <div className="flex items-center justify-center gap-4 py-2">
          {[0, 1, 2, 3].map((index) => {
            const isFilled = index < pinInput.length;
            return (
              <div
                key={index}
                className={`w-3.5 h-3.5 rounded-full transition-all duration-140 ${
                  error
                    ? 'bg-red-500 scale-110 animate-shake'
                    : isFilled
                    ? 'bg-accent scale-110 shadow-[0_0_8px_rgba(245,158,11,0.5)]'
                    : 'bg-elevated border border-subtle'
                }`}
              />
            );
          })}
        </div>

        {error && <p className="text-xs text-red-400 font-medium animate-fade-in">PIN salah. Coba lagi.</p>}

        {/* Number Pad for Mobile and Desktop Touch */}
        <div className="grid grid-cols-3 gap-3 w-full max-w-[260px] pt-2">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <button
              key={digit}
              onClick={() => handleDigit(digit)}
              aria-label={`Angka PIN ${digit}`}
              className="h-14 rounded-2xl bg-surface/80 hover:bg-elevated active:bg-accent/20 border border-subtle font-semibold text-lg transition-colors flex items-center justify-center active:scale-95 shadow-sm"
            >
              {digit}
            </button>
          ))}
          <button
            onClick={() => setPinInput('')}
            aria-label="Hapus PIN"
            className="h-14 rounded-2xl bg-surface/40 hover:bg-surface border border-subtle text-xs text-app-muted transition-colors flex items-center justify-center"
          >
            Hapus
          </button>
          <button
            onClick={() => handleDigit('0')}
            aria-label="Angka PIN 0"
            className="h-14 rounded-2xl bg-surface/80 hover:bg-elevated active:bg-accent/20 border border-subtle font-semibold text-lg transition-colors flex items-center justify-center active:scale-95 shadow-sm"
          >
            0
          </button>
          <button
            onClick={handleBackspace}
            aria-label="Hapus angka PIN terakhir"
            className="h-14 rounded-2xl bg-surface/40 hover:bg-surface border border-subtle text-xs text-app-muted transition-colors flex items-center justify-center"
          >
            ⌫
          </button>
        </div>

      </div>
    </div>
  );
};
