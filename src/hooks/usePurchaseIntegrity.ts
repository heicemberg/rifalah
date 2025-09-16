'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useMasterCounters } from './useMasterCounters';
import { useRaffleStore } from '../stores/raffle-store';

// ============================================================================
// HOOK PARA GARANTIZAR INTEGRIDAD DE DATOS EN EL PROCESO DE COMPRA
// ============================================================================

interface IntegrityValidation {
  isValid: boolean;
  issues: IntegrityIssue[];
  recommendations: string[];
  criticalErrors: string[];
}

interface IntegrityIssue {
  type: 'duplicate' | 'unavailable' | 'invalid' | 'conflict' | 'sync';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  affectedTickets: number[];
  canAutoFix: boolean;
}

export const usePurchaseIntegrity = () => {
  const masterCounters = useMasterCounters();
  const { selectedTickets, soldTickets, reservedTickets } = useRaffleStore();
  const [lastValidation, setLastValidation] = useState<IntegrityValidation | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const validationRef = useRef<NodeJS.Timeout | null>(null);

  // ✅ COMPREHENSIVE INTEGRITY VALIDATION
  const validatePurchaseIntegrity = useCallback(async (): Promise<IntegrityValidation> => {
    console.log('🔍 INTEGRITY: Starting comprehensive validation...');

    const issues: IntegrityIssue[] = [];
    const recommendations: string[] = [];
    const criticalErrors: string[] = [];

    try {
      // ✅ CHECK 1: Duplicate detection
      const uniqueTickets = [...new Set(selectedTickets)];
      if (uniqueTickets.length !== selectedTickets.length) {
        const duplicates = selectedTickets.filter((ticket, index) =>
          selectedTickets.indexOf(ticket) !== index
        );

        issues.push({
          type: 'duplicate',
          severity: 'critical',
          message: `${duplicates.length} tickets duplicados detectados`,
          affectedTickets: duplicates,
          canAutoFix: true
        });

        criticalErrors.push(`Tickets duplicados: ${duplicates.join(', ')}`);
        recommendations.push('Eliminar duplicados automáticamente');
      }

      // ✅ CHECK 2: Range validation
      const invalidTickets = selectedTickets.filter(ticket => ticket < 1 || ticket > 10000);
      if (invalidTickets.length > 0) {
        issues.push({
          type: 'invalid',
          severity: 'critical',
          message: `${invalidTickets.length} números de ticket inválidos`,
          affectedTickets: invalidTickets,
          canAutoFix: true
        });

        criticalErrors.push(`Números inválidos: ${invalidTickets.join(', ')}`);
        recommendations.push('Remover números inválidos');
      }

      // ✅ CHECK 3: Availability conflict detection
      const conflictingSold = selectedTickets.filter(ticket => soldTickets.includes(ticket));
      const conflictingReserved = selectedTickets.filter(ticket => reservedTickets.includes(ticket));

      if (conflictingSold.length > 0) {
        issues.push({
          type: 'unavailable',
          severity: 'critical',
          message: `${conflictingSold.length} tickets ya vendidos seleccionados`,
          affectedTickets: conflictingSold,
          canAutoFix: false
        });

        criticalErrors.push(`Tickets vendidos: ${conflictingSold.join(', ')}`);
        recommendations.push('Seleccionar tickets alternativos');
      }

      if (conflictingReserved.length > 0) {
        issues.push({
          type: 'conflict',
          severity: 'high',
          message: `${conflictingReserved.length} tickets reservados seleccionados`,
          affectedTickets: conflictingReserved,
          canAutoFix: false
        });

        recommendations.push('Verificar estado de reserva antes de proceder');
      }

      // ✅ CHECK 4: Availability count validation
      const realAvailableCount = masterCounters.availableTickets;
      if (selectedTickets.length > realAvailableCount) {
        issues.push({
          type: 'unavailable',
          severity: 'critical',
          message: `Intentando seleccionar ${selectedTickets.length} tickets pero solo ${realAvailableCount} disponibles`,
          affectedTickets: [],
          canAutoFix: false
        });

        criticalErrors.push(`Insuficientes tickets disponibles`);
        recommendations.push(`Reducir selección a máximo ${realAvailableCount} tickets`);
      }

      // ✅ CHECK 5: Synchronization validation
      const expectedTotal = masterCounters.soldTickets + masterCounters.availableTickets + masterCounters.reservedTickets;
      if (expectedTotal !== masterCounters.totalTickets) {
        issues.push({
          type: 'sync',
          severity: 'medium',
          message: 'Posible desincronización detectada en contadores',
          affectedTickets: [],
          canAutoFix: false
        });

        recommendations.push('Forzar sincronización con base de datos');
      }

      const validation: IntegrityValidation = {
        isValid: issues.filter(i => i.severity === 'critical').length === 0,
        issues,
        recommendations,
        criticalErrors
      };

      console.log('✅ INTEGRITY: Validation completed', {
        isValid: validation.isValid,
        totalIssues: issues.length,
        criticalIssues: criticalErrors.length,
        canProceed: validation.isValid
      });

      return validation;

    } catch (error) {
      console.error('❌ INTEGRITY: Validation error:', error);

      return {
        isValid: false,
        issues: [{
          type: 'sync',
          severity: 'critical',
          message: 'Error durante validación de integridad',
          affectedTickets: [],
          canAutoFix: false
        }],
        recommendations: ['Reintentar validación'],
        criticalErrors: ['Error interno de validación']
      };
    }
  }, [selectedTickets, soldTickets, reservedTickets, masterCounters]);

  // ✅ AUTO-FIX FUNCTION for resolvable issues
  const autoFixIssues = useCallback(async (validation: IntegrityValidation): Promise<boolean> => {
    console.log('🔧 INTEGRITY: Starting auto-fix for resolvable issues...');

    const { clearSelection, selectTicket } = useRaffleStore.getState();
    let hasFixed = false;

    try {
      // Fix duplicates
      const duplicateIssues = validation.issues.filter(i => i.type === 'duplicate' && i.canAutoFix);
      if (duplicateIssues.length > 0) {
        const uniqueTickets = [...new Set(selectedTickets)];
        console.log('🔧 INTEGRITY: Fixing duplicates by keeping unique tickets only');

        clearSelection();
        await new Promise(resolve => setTimeout(resolve, 100));

        // Re-select unique tickets
        uniqueTickets.forEach(ticket => selectTicket(ticket));
        hasFixed = true;
      }

      // Fix invalid ranges
      const invalidIssues = validation.issues.filter(i => i.type === 'invalid' && i.canAutoFix);
      if (invalidIssues.length > 0) {
        const validTickets = selectedTickets.filter(ticket => ticket >= 1 && ticket <= 10000);
        console.log('🔧 INTEGRITY: Fixing invalid ranges by filtering valid tickets');

        clearSelection();
        await new Promise(resolve => setTimeout(resolve, 100));

        validTickets.forEach(ticket => selectTicket(ticket));
        hasFixed = true;
      }

      if (hasFixed) {
        console.log('✅ INTEGRITY: Auto-fix completed successfully');
        // Re-validate after fixes
        setTimeout(() => {
          validatePurchaseIntegrity().then(setLastValidation);
        }, 200);
      }

      return hasFixed;

    } catch (error) {
      console.error('❌ INTEGRITY: Auto-fix failed:', error);
      return false;
    }
  }, [selectedTickets, validatePurchaseIntegrity]);

  // ✅ REAL-TIME VALIDATION with debouncing
  useEffect(() => {
    if (selectedTickets.length === 0) {
      setLastValidation(null);
      return;
    }

    setIsValidating(true);

    // Clear previous validation timer
    if (validationRef.current) {
      clearTimeout(validationRef.current);
    }

    // Debounced validation
    validationRef.current = setTimeout(async () => {
      const validation = await validatePurchaseIntegrity();
      setLastValidation(validation);
      setIsValidating(false);

      // Auto-fix if possible and issues are minor
      if (!validation.isValid) {
        const autoFixableIssues = validation.issues.filter(i => i.canAutoFix);
        if (autoFixableIssues.length > 0 && validation.criticalErrors.length === autoFixableIssues.length) {
          console.log('🔧 INTEGRITY: Auto-fixing minor issues...');
          await autoFixIssues(validation);
        }
      }
    }, 500); // 500ms debounce

    return () => {
      if (validationRef.current) {
        clearTimeout(validationRef.current);
      }
    };
  }, [selectedTickets, soldTickets, reservedTickets, masterCounters, validatePurchaseIntegrity, autoFixIssues]);

  // ✅ PRE-PURCHASE VALIDATION
  const validateBeforePurchase = useCallback(async (): Promise<{
    canProceed: boolean;
    blockers: string[];
    warnings: string[];
  }> => {
    console.log('🚦 INTEGRITY: Pre-purchase validation...');

    const validation = await validatePurchaseIntegrity();

    const blockers = validation.criticalErrors;
    const warnings = validation.issues
      .filter(i => i.severity === 'medium' || i.severity === 'high')
      .map(i => i.message);

    const canProceed = blockers.length === 0;

    console.log('🚦 INTEGRITY: Pre-purchase result:', {
      canProceed,
      blockers: blockers.length,
      warnings: warnings.length
    });

    return {
      canProceed,
      blockers,
      warnings
    };
  }, [validatePurchaseIntegrity]);

  // ✅ INTEGRITY REPORT
  const getIntegrityReport = useCallback(() => {
    if (!lastValidation) return null;

    const report = {
      status: lastValidation.isValid ? 'valid' : 'invalid',
      totalIssues: lastValidation.issues.length,
      criticalIssues: lastValidation.issues.filter(i => i.severity === 'critical').length,
      autoFixableIssues: lastValidation.issues.filter(i => i.canAutoFix).length,
      summary: {
        duplicates: lastValidation.issues.filter(i => i.type === 'duplicate').length,
        conflicts: lastValidation.issues.filter(i => i.type === 'conflict').length,
        invalid: lastValidation.issues.filter(i => i.type === 'invalid').length,
        unavailable: lastValidation.issues.filter(i => i.type === 'unavailable').length,
        sync: lastValidation.issues.filter(i => i.type === 'sync').length
      },
      recommendations: lastValidation.recommendations,
      lastChecked: new Date().toISOString()
    };

    return report;
  }, [lastValidation]);

  return {
    validatePurchaseIntegrity,
    autoFixIssues,
    validateBeforePurchase,
    getIntegrityReport,
    isValidating,
    lastValidation,
    hasIssues: lastValidation ? !lastValidation.isValid : false,
    hasCriticalIssues: lastValidation ? lastValidation.criticalErrors.length > 0 : false
  };
};

export default usePurchaseIntegrity;