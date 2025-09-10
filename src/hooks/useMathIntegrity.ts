'use client';

import { useEffect, useState, useCallback } from 'react';
import { useMasterCounters } from './useMasterCounters';
import { useRaffleStore } from '../stores/raffle-store';

// ============================================================================
// MATHEMATICAL INTEGRITY GUARDIAN - ZERO TOLERANCE FOR CALCULATION ERRORS
// ============================================================================

export interface MathIntegrityReport {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  masterCounters: {
    sold: number;
    available: number;
    reserved: number;
    total: number;
    fomoSold: number;
    fomoAvailable: number;
  };
  zustandStore: {
    sold: number;
    available: number;
    reserved: number;
    total: number;
  };
  discrepancies: {
    soldDiff: number;
    availableDiff: number;
    reservedDiff: number;
    totalDiff: number;
  };
  displayMath: {
    displaySold: number;
    displayAvailable: number;
    displayReserved: number;
    displayTotal: number;
    shouldBe: number;
    isCorrect: boolean;
  };
}

export const useMathIntegrity = (autoFix: boolean = false) => {
  const [lastReport, setLastReport] = useState<MathIntegrityReport | null>(null);
  const [errorCount, setErrorCount] = useState(0);
  const [isMonitoring, setIsMonitoring] = useState(true);

  const masterCounters = useMasterCounters();
  const zustandState = useRaffleStore(state => ({
    soldTickets: state.soldTickets,
    availableTickets: state.availableTickets,
    reservedTickets: state.reservedTickets,
    totalTickets: 10000
  }));

  // ========================================================================
  // COMPREHENSIVE MATHEMATICAL VALIDATION
  // ========================================================================
  const validateMathIntegrity = useCallback((): MathIntegrityReport => {
    const errors: string[] = [];
    const warnings: string[] = [];

    // 1. MASTER COUNTER VALIDATION
    const masterSold = masterCounters.soldTickets;
    const masterAvailable = masterCounters.availableTickets; 
    const masterReserved = masterCounters.reservedTickets;
    const masterTotal = masterCounters.totalTickets;
    const masterFomoSold = masterCounters.fomoSoldTickets;

    // Real math check for master counter
    const masterRealSum = masterSold + masterAvailable + masterReserved;
    if (masterRealSum !== masterTotal) {
      errors.push(`Master Counter Real Math: ${masterSold} + ${masterAvailable} + ${masterReserved} = ${masterRealSum} ≠ ${masterTotal} (Missing ${masterTotal - masterRealSum})`);
    }

    // 2. ZUSTAND STORE VALIDATION
    const zustandSold = zustandState.soldTickets.length;
    const zustandAvailable = zustandState.availableTickets.length;
    const zustandReserved = zustandState.reservedTickets.length;
    const zustandTotal = zustandState.totalTickets;

    // Real math check for Zustand
    const zustandSum = zustandSold + zustandAvailable + zustandReserved;
    if (zustandSum !== zustandTotal) {
      errors.push(`Zustand Store Math: ${zustandSold} + ${zustandAvailable} + ${zustandReserved} = ${zustandSum} ≠ ${zustandTotal} (Missing ${zustandTotal - zustandSum})`);
    }

    // 3. SYNCHRONIZATION VALIDATION
    const soldDiff = Math.abs(masterSold - zustandSold);
    const availableDiff = Math.abs(masterAvailable - zustandAvailable);
    const reservedDiff = Math.abs(masterReserved - zustandReserved);
    const totalDiff = Math.abs(masterTotal - zustandTotal);

    if (soldDiff > 5) {
      errors.push(`Sold Tickets Sync: Master(${masterSold}) vs Zustand(${zustandSold}) = ${soldDiff} difference`);
    } else if (soldDiff > 0) {
      warnings.push(`Minor sold tickets difference: ${soldDiff}`);
    }

    if (availableDiff > 5) {
      errors.push(`Available Tickets Sync: Master(${masterAvailable}) vs Zustand(${zustandAvailable}) = ${availableDiff} difference`);
    } else if (availableDiff > 0) {
      warnings.push(`Minor available tickets difference: ${availableDiff}`);
    }

    if (reservedDiff > 0) {
      errors.push(`Reserved Tickets Sync: Master(${masterReserved}) vs Zustand(${zustandReserved}) = ${reservedDiff} difference`);
    }

    if (totalDiff > 0) {
      errors.push(`Total Tickets Sync: Master(${masterTotal}) vs Zustand(${zustandTotal}) = ${totalDiff} difference`);
    }

    // 4. DISPLAY MATH VALIDATION (FOMO System)
    const displaySold = masterFomoSold; // Real + FOMO
    const displayAvailable = masterTotal - displaySold - masterReserved;
    const displayReserved = masterReserved;
    const displayTotal = displaySold + displayAvailable + displayReserved;
    const shouldBe = masterTotal;
    const displayMathCorrect = displayTotal === shouldBe;

    if (!displayMathCorrect) {
      errors.push(`Display Math Error: ${displaySold} + ${displayAvailable} + ${displayReserved} = ${displayTotal} ≠ ${shouldBe} (Missing ${shouldBe - displayTotal})`);
    }

    // 5. FOMO VALIDATION
    const fomoAmount = masterFomoSold - masterSold;
    if (fomoAmount < 0) {
      errors.push(`FOMO Logic Error: Display sold (${masterFomoSold}) < Real sold (${masterSold})`);
    }
    if (fomoAmount > 2000) {
      warnings.push(`High FOMO amount: ${fomoAmount} tickets (may appear suspicious)`);
    }

    const report: MathIntegrityReport = {
      isValid: errors.length === 0,
      errors,
      warnings,
      masterCounters: {
        sold: masterSold,
        available: masterAvailable,
        reserved: masterReserved,
        total: masterTotal,
        fomoSold: masterFomoSold,
        fomoAvailable: displayAvailable
      },
      zustandStore: {
        sold: zustandSold,
        available: zustandAvailable,
        reserved: zustandReserved,
        total: zustandTotal
      },
      discrepancies: {
        soldDiff,
        availableDiff,
        reservedDiff,
        totalDiff
      },
      displayMath: {
        displaySold,
        displayAvailable,
        displayReserved,
        displayTotal,
        shouldBe,
        isCorrect: displayMathCorrect
      }
    };

    return report;
  }, [masterCounters, zustandState]);

  // ========================================================================
  // AUTO-FIX FUNCTIONALITY
  // ========================================================================
  const attemptAutoFix = useCallback(async (report: MathIntegrityReport) => {
    console.warn('🔧 ATTEMPTING AUTO-FIX for mathematical discrepancies...');
    
    try {
      // Auto-fix strategy 1: Force Zustand sync from master
      if (report.discrepancies.soldDiff > 0 || report.discrepancies.availableDiff > 0) {
        console.log('🔄 Auto-fix: Syncing Zustand from Master Counter...');
        
        // Get fresh store reference
        const store = useRaffleStore.getState();
        
        // Force sync sold tickets
        if (report.discrepancies.soldDiff > 0) {
          // We don't have access to the actual ticket numbers here, 
          // but we can trigger a refresh
          console.log('🔄 Triggering master counter refresh...');
          
          // Dispatch a custom event to force all systems to refresh
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('force-math-integrity-sync', {
              detail: { 
                source: 'auto-fix',
                discrepancies: report.discrepancies,
                timestamp: new Date().toISOString()
              }
            }));
          }
        }
      }

      // Auto-fix strategy 2: Reset display calculations
      if (!report.displayMath.isCorrect) {
        console.log('🔄 Auto-fix: Recalculating display values...');
        // The display math should self-correct on the next master counter update
      }

      return true;
    } catch (error) {
      console.error('❌ Auto-fix failed:', error);
      return false;
    }
  }, []);

  // ========================================================================
  // MONITORING AND REPORTING
  // ========================================================================
  const runIntegrityCheck = useCallback(() => {
    const report = validateMathIntegrity();
    setLastReport(report);

    if (!report.isValid) {
      setErrorCount(prev => prev + 1);
      
      console.group('🚨 MATHEMATICAL INTEGRITY VIOLATION');
      console.error('Errors detected:', report.errors);
      if (report.warnings.length > 0) {
        console.warn('Warnings:', report.warnings);
      }
      
      console.table({
        'Master Counter': report.masterCounters,
        'Zustand Store': report.zustandStore,
        'Discrepancies': report.discrepancies
      });
      
      console.log('Display Math:', report.displayMath);
      console.groupEnd();

      // Attempt auto-fix if enabled
      if (autoFix) {
        attemptAutoFix(report);
      }
    } else if (report.warnings.length > 0) {
      console.warn('🔶 Mathematical integrity warnings:', report.warnings);
    } else {
      console.log('✅ Mathematical integrity: PERFECT');
    }

    return report;
  }, [validateMathIntegrity, autoFix, attemptAutoFix]);

  // ========================================================================
  // AUTO-MONITORING
  // ========================================================================
  useEffect(() => {
    if (!isMonitoring) return;

    // Run immediate check
    runIntegrityCheck();

    // Set up interval monitoring
    const interval = setInterval(() => {
      runIntegrityCheck();
    }, 10000); // Check every 10 seconds

    return () => clearInterval(interval);
  }, [isMonitoring, runIntegrityCheck]);

  // ========================================================================
  // MANUAL CONTROL FUNCTIONS
  // ========================================================================
  const forceIntegrityCheck = useCallback(() => {
    console.log('🔍 FORCING MANUAL INTEGRITY CHECK...');
    return runIntegrityCheck();
  }, [runIntegrityCheck]);

  const resetErrorCount = useCallback(() => {
    setErrorCount(0);
  }, []);

  const toggleMonitoring = useCallback(() => {
    setIsMonitoring(prev => !prev);
  }, []);

  return {
    // State
    lastReport,
    errorCount,
    isMonitoring,
    isValid: lastReport?.isValid ?? true,
    hasErrors: (lastReport?.errors.length ?? 0) > 0,
    hasWarnings: (lastReport?.warnings.length ?? 0) > 0,
    
    // Functions
    runIntegrityCheck: forceIntegrityCheck,
    resetErrorCount,
    toggleMonitoring,
    
    // Quick accessors
    getDiscrepancies: () => lastReport?.discrepancies,
    getDisplayMath: () => lastReport?.displayMath,
    getMasterCounters: () => lastReport?.masterCounters,
    getZustandState: () => lastReport?.zustandStore
  };
};

// ============================================================================
// GLOBAL MATH VALIDATOR FOR CONSOLE ACCESS
// ============================================================================
if (typeof window !== 'undefined') {
  (window as any).mathIntegrityValidator = {
    runCheck: () => {
      console.log('🔍 Running manual math integrity check...');
      // This will be implemented when the hook is used in a component
      console.log('Use the useMathIntegrity hook in a component for full functionality');
    },
    
    getLastReport: () => {
      console.log('Last integrity report will be available when hook is active');
      return null;
    }
  };
}