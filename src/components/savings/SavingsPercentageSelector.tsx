'use client';

import { useCallback, useEffect, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import type { SavingsPercentage, SavingsPreference } from '@/types/portfolio';
import {
  SAVINGS_PERCENTAGE_OPTIONS,
  formatSavingsPercentageLabel,
} from '@/features/savings/calculations';
import { cn } from '@/lib/utils';

export interface SavingsPercentageSelectorProps {
  value: SavingsPreference;
  onChange: (preference: SavingsPreference) => void;
  onOpenChange?: (isOpen: boolean) => void;
}

/**
 * "Save from profits [20% ▾]" control. Clicking opens a small glass popover with
 * radio-style options (5/10/20/30/50/Custom). Local component state only — no
 * Zustand/persistence yet, per the "don't introduce state management for this UI
 * pass" instruction. The selected value is lifted to whatever parent owns it via
 * onChange, so wiring in persistence later only touches the parent, not this file.
 */
export function SavingsPercentageSelector({ value, onChange, onOpenChange }: SavingsPercentageSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [customInput, setCustomInput] = useState(String(value.customValue ?? ''));
  const closeMenu = useCallback(() => {
    setIsOpen(false);
    onOpenChange?.(false);
  }, [onOpenChange]);

  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        closeMenu();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [closeMenu, isOpen]);

  function handleSelect(option: SavingsPercentage) {
    if (option === 'custom') {
      onChange({ selected: 'custom', customValue: Number(customInput) || 0 });
      return;
    }
    onChange({ selected: option });
    closeMenu();
  }

  function handleCustomSubmit() {
    const parsed = Math.min(100, Math.max(0, Number(customInput) || 0));
    onChange({ selected: 'custom', customValue: parsed });
    closeMenu();
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => {
          const nextIsOpen = !isOpen;
          setIsOpen(nextIsOpen);
          onOpenChange?.(nextIsOpen);
        }}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        className="border-glass-border-strong bg-glass text-foreground hover:border-secondary/35 flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors"
      >
        {formatSavingsPercentageLabel(value.selected)}
        <ChevronDown className={cn('h-3.5 w-3.5 transition-transform', isOpen && 'rotate-180')} />
      </button>

      {isOpen && (
        <>
          {/* Click-outside catcher */}
          <button
            type="button"
            aria-hidden="true"
            tabIndex={-1}
            className="fixed inset-0 z-20 cursor-default"
            onClick={closeMenu}
          />
          <div
            role="listbox"
            className="border-glass-border-strong bg-background-elevated absolute right-0 z-30 mt-2 w-48 rounded-2xl border p-2 shadow-[var(--shadow-ambient)] backdrop-blur-sm"
          >
            <p className="text-foreground-subtle px-2 py-1.5 text-xs font-medium">
              Save from profit
            </p>
            {SAVINGS_PERCENTAGE_OPTIONS.map((option) => {
              const isSelected = value.selected === option;
              return (
                <button
                  key={option}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => handleSelect(option)}
                  className={cn(
                    'flex w-full items-center gap-2.5 rounded-xl px-2 py-2 text-left text-sm transition-colors',
                    isSelected ? 'text-secondary' : 'text-foreground-muted hover:text-foreground',
                  )}
                >
                  <span
                    className={cn(
                      'flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full border',
                      isSelected ? 'border-secondary' : 'border-glass-border-strong',
                    )}
                  >
                    {isSelected && <span className="bg-secondary h-1.5 w-1.5 rounded-full" />}
                  </span>
                  {formatSavingsPercentageLabel(option)}
                </button>
              );
            })}

            {value.selected === 'custom' && (
              <div className="mt-1 flex items-center gap-2 px-2 pt-1">
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCustomSubmit()}
                  placeholder="e.g. 15"
                  className="border-glass-border-strong bg-glass text-foreground focus:border-secondary/50 w-full rounded-lg border px-2 py-1 text-sm outline-none"
                />
                <button
                  type="button"
                  onClick={handleCustomSubmit}
                  className="bg-primary rounded-lg px-2 py-1 text-xs font-semibold text-black"
                >
                  Set
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
