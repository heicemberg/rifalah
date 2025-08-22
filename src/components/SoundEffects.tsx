// ============================================================================
// SISTEMA DE SONIDOS PARA RIFA DE CAMIONETA
// ============================================================================

'use client';

import React, { 
  createContext, 
  useContext, 
  useState, 
  useRef, 
  useEffect, 
  useCallback 
} from 'react';

// Importar desde archivos anteriores
import { useRaffleStore } from '../stores/raffle-store';
import { cn } from '../lib/utils';

// ============================================================================
// TIPOS
// ============================================================================

export type SoundType = 'click' | 'success' | 'error' | 'notification' | 'purchase';

interface SoundConfig {
  frequency: number;
  duration: number;
  volume: number;
  type: OscillatorType;
  envelope?: {
    attack: number;
    decay: number;
    sustain: number;
    release: number;
  };
}

interface SoundContextType {
  playSound: (type: SoundType) => void;
  enabled: boolean;
  setEnabled: (enabled: boolean) => void;
  volume: number;
  setVolume: (volume: number) => void;
  isAudioInitialized: boolean;
}

// ============================================================================
// CONFIGURACIONES DE SONIDOS
// ============================================================================

const SOUND_CONFIGS: Record<SoundType, SoundConfig> = {
  click: {
    frequency: 800,
    duration: 0.1,
    volume: 0.3,
    type: 'square',
    envelope: {
      attack: 0.01,
      decay: 0.02,
      sustain: 0.3,
      release: 0.07
    }
  },
  success: {
    frequency: 523, // C5
    duration: 0.6,
    volume: 0.4,
    type: 'sine',
    envelope: {
      attack: 0.02,
      decay: 0.1,
      sustain: 0.7,
      release: 0.4
    }
  },
  error: {
    frequency: 200,
    duration: 0.4,
    volume: 0.5,
    type: 'sawtooth',
    envelope: {
      attack: 0.01,
      decay: 0.05,
      sustain: 0.8,
      release: 0.3
    }
  },
  notification: {
    frequency: 660, // E5
    duration: 0.2,
    volume: 0.3,
    type: 'sine',
    envelope: {
      attack: 0.01,
      decay: 0.05,
      sustain: 0.6,
      release: 0.1
    }
  },
  purchase: {
    frequency: 440, // A4
    duration: 0.8,
    volume: 0.4,
    type: 'sine',
    envelope: {
      attack: 0.05,
      decay: 0.2,
      sustain: 0.5,
      release: 0.5
    }
  }
};

// ============================================================================
// CONTEXT
// ============================================================================

const SoundContext = createContext<SoundContextType | null>(null);

// ============================================================================
// HOOK PERSONALIZADO
// ============================================================================

export const useSounds = (): SoundContextType => {
  const context = useContext(SoundContext);
  if (!context) {
    // En lugar de lanzar error, devolver un contexto por defecto
    console.warn('useSounds: No se encontró SoundProvider, usando funcionalidad limitada');
    return {
      playSound: () => {}, // No-op function
      enabled: false,
      setEnabled: () => {},
      volume: 0,
      setVolume: () => {},
      isAudioInitialized: false
    };
  }
  return context;
};

// ============================================================================
// CLASE PARA MANEJAR AUDIO
// ============================================================================

class SoundEngine {
  private audioContext: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private isInitialized = false;

  async initialize(): Promise<boolean> {
    if (this.isInitialized) return true;

    try {
      // Crear contexto de audio
      this.audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      
      // Crear nodo de ganancia master
      this.masterGain = this.audioContext.createGain();
      this.masterGain.connect(this.audioContext.destination);
      
      // Reanudar contexto si está suspendido (requerimiento de gesture)
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }
      
      this.isInitialized = true;
      return true;
    } catch (error) {
      console.warn('Error inicializando audio:', error);
      return false;
    }
  }

  async playSound(type: SoundType, volume: number = 1): Promise<void> {
    if (!this.isInitialized || !this.audioContext || !this.masterGain) {
      return;
    }

    const config = SOUND_CONFIGS[type];
    const now = this.audioContext.currentTime;

    try {
      // Crear oscilador
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      // Configurar oscilador
      oscillator.type = config.type;
      oscillator.frequency.setValueAtTime(config.frequency, now);

      // Conectar nodos
      oscillator.connect(gainNode);
      gainNode.connect(this.masterGain);

      // Configurar envelope ADSR
      const envelope = config.envelope;
      if (envelope) {
        const attackTime = now + envelope.attack;
        const decayTime = attackTime + envelope.decay;
        const releaseStartTime = now + config.duration - envelope.release;
        const endTime = now + config.duration;

        // Attack
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(
          config.volume * volume, 
          attackTime
        );

        // Decay
        gainNode.gain.linearRampToValueAtTime(
          config.volume * envelope.sustain * volume,
          decayTime
        );

        // Sustain (se mantiene hasta release)
        gainNode.gain.setValueAtTime(
          config.volume * envelope.sustain * volume,
          releaseStartTime
        );

        // Release
        gainNode.gain.linearRampToValueAtTime(0, endTime);
      } else {
        // Envelope simple
        gainNode.gain.setValueAtTime(config.volume * volume, now);
        gainNode.gain.linearRampToValueAtTime(0, now + config.duration);
      }

      // Reproducir y limpiar
      oscillator.start(now);
      oscillator.stop(now + config.duration);

      // Sonidos especiales con múltiples tonos
      if (type === 'success') {
        // Añadir armonía para sonido más rico
        setTimeout(() => {
          if (this.audioContext && this.masterGain) {
            this.playHarmony([659, 784], 0.3, volume * 0.6); // E5, G5
          }
        }, 100);
      }

      if (type === 'purchase') {
        // Secuencia ascendente para celebración
        setTimeout(() => {
          if (this.audioContext && this.masterGain) {
            this.playHarmony([523, 659, 784], 0.4, volume * 0.7); // C5, E5, G5
          }
        }, 200);
      }

    } catch (error) {
      console.warn('Error reproduciendo sonido:', error);
    }
  }

  private playHarmony(frequencies: number[], duration: number, volume: number): void {
    if (!this.audioContext || !this.masterGain) return;

    const now = this.audioContext.currentTime;

    frequencies.forEach((freq, index) => {
      const oscillator = this.audioContext!.createOscillator();
      const gainNode = this.audioContext!.createGain();

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(freq, now);

      oscillator.connect(gainNode);
      gainNode.connect(this.masterGain!);

      gainNode.gain.setValueAtTime(volume * 0.5, now);
      gainNode.gain.linearRampToValueAtTime(0, now + duration);

      oscillator.start(now + index * 0.05); // Stagger ligeramente
      oscillator.stop(now + duration);
    });
  }

  setMasterVolume(volume: number): void {
    if (this.masterGain) {
      this.masterGain.gain.setValueAtTime(volume, this.audioContext!.currentTime);
    }
  }

  destroy(): void {
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
      this.masterGain = null;
      this.isInitialized = false;
    }
  }
}

// ============================================================================
// PROVIDER COMPONENT
// ============================================================================

export const SoundProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [enabled, setEnabled] = useState(true);
  const [volume, setVolume] = useState(0.7);
  const [isAudioInitialized, setIsAudioInitialized] = useState(false);
  const soundEngineRef = useRef<SoundEngine | null>(null);

  // Inicializar engine de sonido
  useEffect(() => {
    soundEngineRef.current = new SoundEngine();

    // Manejar primer gesto del usuario
    const initializeAudio = async () => {
      if (soundEngineRef.current) {
        const success = await soundEngineRef.current.initialize();
        setIsAudioInitialized(success);
      }
    };

    // Listeners para gestos de usuario
    const handleUserGesture = () => {
      initializeAudio();
      // Remover listeners después de la primera interacción
      document.removeEventListener('click', handleUserGesture);
      document.removeEventListener('keydown', handleUserGesture);
      document.removeEventListener('touchstart', handleUserGesture);
    };

    document.addEventListener('click', handleUserGesture);
    document.addEventListener('keydown', handleUserGesture);
    document.addEventListener('touchstart', handleUserGesture);

    return () => {
      document.removeEventListener('click', handleUserGesture);
      document.removeEventListener('keydown', handleUserGesture);
      document.removeEventListener('touchstart', handleUserGesture);
      
      if (soundEngineRef.current) {
        soundEngineRef.current.destroy();
      }
    };
  }, []);

  // Actualizar volumen master
  useEffect(() => {
    if (soundEngineRef.current && isAudioInitialized) {
      soundEngineRef.current.setMasterVolume(enabled ? volume : 0);
    }
  }, [volume, enabled, isAudioInitialized]);

  const playSound = useCallback((type: SoundType) => {
    if (!enabled || !isAudioInitialized || !soundEngineRef.current) {
      return;
    }
    
    soundEngineRef.current.playSound(type, volume);
  }, [enabled, volume, isAudioInitialized]);

  const contextValue: SoundContextType = {
    playSound,
    enabled,
    setEnabled,
    volume,
    setVolume,
    isAudioInitialized
  };

  return (
    <SoundContext.Provider value={contextValue}>
      {children}
    </SoundContext.Provider>
  );
};

// ============================================================================
// LISTENER COMPONENT
// ============================================================================

export const SoundEffectsListener: React.FC = () => {
  const { playSound, enabled } = useSounds();
  const {
    selectedTickets,
    liveActivities,
    soldTickets,
    errors
  } = useRaffleStore();

  // Refs para tracking de cambios
  const prevSelectedRef = useRef<number[]>([]);
  const prevLiveActivitiesRef = useRef<unknown[]>([]);
  const prevSoldTicketsRef = useRef<number[]>([]);
  const prevErrorsRef = useRef<string[]>([]);

  // Escuchar cambios en tickets seleccionados
  useEffect(() => {
    if (!enabled) return;

    const prevSelected = prevSelectedRef.current;
    const currentSelected = selectedTickets;

    // Ticket añadido
    if (currentSelected.length > prevSelected.length) {
      playSound('click');
    }
    // Ticket removido
    else if (currentSelected.length < prevSelected.length) {
      playSound('click');
    }

    prevSelectedRef.current = [...selectedTickets];
  }, [selectedTickets, enabled, playSound]);

  // Escuchar nuevas actividades en vivo
  useEffect(() => {
    if (!enabled) return;

    const prevActivities = prevLiveActivitiesRef.current;
    const currentActivities = liveActivities;

    // Nueva actividad (compra)
    if (currentActivities.length > prevActivities.length) {
      playSound('notification');
    }

    prevLiveActivitiesRef.current = [...liveActivities];
  }, [liveActivities, enabled, playSound]);

  // Escuchar tickets vendidos (compras exitosas)
  useEffect(() => {
    if (!enabled) return;

    const prevSold = prevSoldTicketsRef.current;
    const currentSold = soldTickets;

    // Nueva venta
    if (currentSold.length > prevSold.length) {
      playSound('purchase');
    }

    prevSoldTicketsRef.current = [...soldTickets];
  }, [soldTickets, enabled, playSound]);

  // Escuchar errores
  useEffect(() => {
    if (!enabled) return;

    const prevErrors = prevErrorsRef.current;
    const currentErrors = errors;

    // Nuevo error
    if (currentErrors.length > prevErrors.length) {
      playSound('error');
    }

    prevErrorsRef.current = [...errors];
  }, [errors, enabled, playSound]);

  return null; // Este componente no renderiza nada
};

// ============================================================================
// CONTROLES FLOTANTES
// ============================================================================

export const SoundControls: React.FC = () => {
  const { enabled, setEnabled, volume, setVolume, isAudioInitialized } = useSounds();
  const [isExpanded, setIsExpanded] = useState(false);

  // No mostrar si el audio no está inicializado
  if (!isAudioInitialized) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 z-40">
      <div className={cn(
        'bg-white border border-gray-200 rounded-lg shadow-lg transition-all duration-300',
        {
          'p-2': !isExpanded,
          'p-4': isExpanded
        }
      )}>
        {/* Botón principal */}
        <button
          onClick={() => {
            setIsExpanded(!isExpanded);
            // Si no está expandido, toggle el sonido
            if (!isExpanded) {
              setEnabled(!enabled);
            }
          }}
          className={cn(
            'flex items-center justify-center w-10 h-10 rounded-lg transition-all duration-200',
            {
              'bg-blue-100 text-blue-600 hover:bg-blue-200': enabled,
              'bg-gray-100 text-gray-400 hover:bg-gray-200': !enabled
            }
          )}
          title={enabled ? 'Sonidos activados' : 'Sonidos desactivados'}
        >
          {enabled ? '🔊' : '🔇'}
        </button>

        {/* Panel expandido */}
        {isExpanded && (
          <div className="mt-3 space-y-3 min-w-[140px]">
            {/* Toggle sonido */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">
                Sonidos
              </span>
              <button
                onClick={() => setEnabled(!enabled)}
                className={cn(
                  'relative w-10 h-6 rounded-full transition-colors duration-200',
                  {
                    'bg-blue-500': enabled,
                    'bg-gray-300': !enabled
                  }
                )}
              >
                <div className={cn(
                  'absolute top-1 w-4 h-4 bg-white rounded-full transition-transform duration-200',
                  {
                    'left-5': enabled,
                    'left-1': !enabled
                  }
                )} />
              </button>
            </div>

            {/* Control de volumen */}
            {enabled && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-600">Volumen</span>
                  <span className="text-xs text-gray-800 font-medium">
                    {Math.round(volume * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={volume}
                  onChange={(e) => setVolume(parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                />
              </div>
            )}

            {/* Test sonidos */}
            {enabled && (
              <div className="space-y-2">
                <div className="text-xs text-gray-600 mb-1">Test:</div>
                <div className="grid grid-cols-2 gap-1">
                  <TestSoundButton type="click" label="Click" />
                  <TestSoundButton type="success" label="Éxito" />
                  <TestSoundButton type="error" label="Error" />
                  <TestSoundButton type="notification" label="Notif" />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// BOTÓN DE TEST DE SONIDO
// ============================================================================

const TestSoundButton: React.FC<{
  type: SoundType;
  label: string;
}> = ({ type, label }) => {
  const { playSound } = useSounds();

  return (
    <button
      onClick={() => playSound(type)}
      className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
    >
      {label}
    </button>
  );
};

// ============================================================================
// COMPONENTE PRINCIPAL COMBINADO
// ============================================================================

export const SoundEffects: React.FC = () => {
  return (
    <>
      <SoundEffectsListener />
      <SoundControls />
    </>
  );
};

// ============================================================================
// EXPORT CON DISPLAY NAME
// ============================================================================

SoundEffects.displayName = 'SoundEffects';
SoundProvider.displayName = 'SoundProvider';
SoundEffectsListener.displayName = 'SoundEffectsListener';
SoundControls.displayName = 'SoundControls';

export default SoundEffects;