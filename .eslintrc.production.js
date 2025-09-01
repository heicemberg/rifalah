// ============================================================================
// CONFIGURACIÓN ESLINT PARA PRODUCCIÓN - MÁXIMA SEGURIDAD TYPESCRIPT
// ============================================================================

module.exports = {
  extends: [
    'next/core-web-vitals',
    '@typescript-eslint/recommended',
    '@typescript-eslint/recommended-requiring-type-checking'
  ],
  parserOptions: {
    project: './tsconfig.json',
  },
  rules: {
    // ERRORES CRÍTICOS (BLOQUEAN BUILD)
    '@typescript-eslint/no-explicit-any': 'error', // Prohibir 'any' completamente
    '@typescript-eslint/no-unsafe-assignment': 'error',
    '@typescript-eslint/no-unsafe-member-access': 'error',
    '@typescript-eslint/no-unsafe-call': 'error',
    '@typescript-eslint/no-unsafe-return': 'error',
    
    // PROPIEDADES FALTANTES EN INTERFACES
    '@typescript-eslint/no-misused-promises': 'error',
    '@typescript-eslint/require-await': 'error',
    '@typescript-eslint/no-floating-promises': 'error',
    
    // HOOKS DE REACT - DEPENDENCIAS FALTANTES
    'react-hooks/exhaustive-deps': 'error',
    'react-hooks/rules-of-hooks': 'error',
    
    // VARIABLES NO UTILIZADAS (PUEDEN INDICAR ERRORES)
    '@typescript-eslint/no-unused-vars': ['error', { 
      'argsIgnorePattern': '^_',
      'varsIgnorePattern': '^_'
    }],
    
    // EVENTOS Y HANDLERS
    '@typescript-eslint/no-misused-new': 'error',
    '@typescript-eslint/prefer-as-const': 'error',
    
    // IMPORTS Y EXPORTS
    '@typescript-eslint/no-import-type-side-effects': 'error',
    '@typescript-eslint/consistent-type-imports': 'error',
    
    // WINDOW Y GLOBAL OBJECTS
    'no-restricted-globals': ['error', {
      'name': 'window',
      'message': 'Use "typeof window !== undefined" check before accessing window'
    }],
    
    // PREVENIR MODIFICACIONES PELIGROSAS
    'no-global-assign': 'error',
    'no-implicit-globals': 'error'
  },
  
  // CONFIGURACIÓN ESPECÍFICA PARA DIFERENTES TIPOS DE ARCHIVOS
  overrides: [
    {
      // Archivos de tipos globales - reglas más permisivas
      files: ['src/types/**/*.d.ts'],
      rules: {
        '@typescript-eslint/no-explicit-any': 'warn'
      }
    },
    {
      // Páginas de debug - solo en desarrollo
      files: ['src/app/debug-*/**/*.tsx', 'src/components/debug/**/*.tsx'],
      rules: {
        '@typescript-eslint/no-explicit-any': 'warn',
        '@typescript-eslint/no-unused-vars': 'warn'
      }
    }
  ]
};