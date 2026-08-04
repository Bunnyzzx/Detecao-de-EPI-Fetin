import clsx from 'clsx';
import { CheckCircle2 } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

import { APP_MESSAGES } from '@/constants/messages';

import type { DetectedEpi, EpiId } from '../types';

import { HumanSilhouette } from './HumanSilhouette';
import styles from './ScanViewport.module.css';

export interface ScanViewportProps {
  items: DetectedEpi[];
  currentItem: EpiId | null;
  scanning: boolean;
  finished: boolean;
  /** Exibe o selo de sucesso quando tudo foi confirmado. */
  allDetected: boolean;
}

/** Visor do terminal: moldura de escaneamento, linha de varredura e silhueta. */
export const ScanViewport = ({
  items,
  currentItem,
  scanning,
  finished,
  allDetected,
}: ScanViewportProps) => (
  <div className={styles.viewport}>
    <div className={styles.grid} aria-hidden="true" />

    <div className={styles.frame} aria-hidden="true">
      <span className={clsx(styles.corner, styles.cornerTopLeft)} />
      <span className={clsx(styles.corner, styles.cornerTopRight)} />
      <span className={clsx(styles.corner, styles.cornerBottomLeft)} />
      <span className={clsx(styles.corner, styles.cornerBottomRight)} />
      {scanning && <span className={styles.scanLine} />}
    </div>

    <div className={styles.silhouetteHolder}>
      <div className={styles.silhouetteSize}>
        <HumanSilhouette
          items={items}
          currentItem={currentItem}
          scanning={scanning}
          finished={finished}
        />
      </div>
    </div>

    <AnimatePresence>
      {allDetected && (
        <motion.div
          className={styles.successOverlay}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className={styles.successCircle}
            initial={{ scale: 0.3, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 280, damping: 18 }}
          >
            <CheckCircle2 size={72} strokeWidth={1.5} aria-hidden="true" />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>

    <p className={clsx(styles.hint, allDetected && styles.hintSuccess)} aria-live="polite">
      {allDetected ? `✓ ${APP_MESSAGES.scan.successHint}` : APP_MESSAGES.scan.frameHint}
    </p>
  </div>
);
