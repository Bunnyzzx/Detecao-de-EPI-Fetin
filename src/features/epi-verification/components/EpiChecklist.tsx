import clsx from 'clsx';
import { CheckCircle2, LoaderCircle, ShieldCheck, XCircle } from 'lucide-react';

import { ProgressBar } from '@/components/ui';
import { getEpiById } from '@/constants/epiCatalog';
import { APP_MESSAGES } from '@/constants/messages';
import { formatConfidence } from '@/utils';

import type { DetectedEpi, EpiId } from '../types';

import styles from './EpiChecklist.module.css';

export interface EpiChecklistProps {
  items: DetectedEpi[];
  /** Equipamento sendo avaliado neste instante. */
  currentItem?: EpiId | null;
  /** Antes do fim, "não detectado" ainda é apenas "aguardando". */
  finished?: boolean;
  onDark?: boolean;
  className?: string;
}

/**
 * Lista de equipamentos com estado e confiança. O estado é comunicado por
 * ícone, texto e cor ao mesmo tempo — nunca apenas por cor.
 */
export const EpiChecklist = ({
  items,
  currentItem = null,
  finished = true,
  onDark = false,
  className,
}: EpiChecklistProps) => (
  <ul className={clsx(styles.list, onDark && styles.onDark, className)}>
    {items.map((item) => {
      const isScanning = item.id === currentItem;
      const isDetected = item.detected;
      const isMissing = !isDetected && finished;

      const catalogItem = getEpiById(item.id);
      const Icon = catalogItem?.icon ?? ShieldCheck;

      const stateLabel = isScanning
        ? APP_MESSAGES.scan.analyzing
        : isDetected
          ? APP_MESSAGES.scan.detected
          : finished
            ? APP_MESSAGES.scan.notDetected
            : APP_MESSAGES.scan.waiting;

      return (
        <li
          key={item.id}
          className={clsx(
            styles.item,
            isDetected && styles.detected,
            isMissing && styles.missing,
            isScanning && styles.scanning,
          )}
        >
          <span className={styles.iconWrapper}>
            <Icon size={18} aria-hidden="true" />
          </span>

          <div className={styles.details}>
            <div className={styles.titleRow}>
              <span className={styles.label}>{item.label}</span>
              {isScanning ? (
                <LoaderCircle size={16} className={styles.spinner} aria-hidden="true" />
              ) : isDetected ? (
                <CheckCircle2 size={16} color="var(--color-approved)" aria-hidden="true" />
              ) : finished ? (
                <XCircle size={16} color="var(--color-rejected)" aria-hidden="true" />
              ) : null}
            </div>

            <span className={styles.state}>{`${stateLabel} · ${item.description}`}</span>

            <div className={styles.confidenceRow}>
              <ProgressBar
                value={item.confidence}
                tone={isDetected ? 'approved' : isMissing ? 'rejected' : 'primary'}
                height={5}
                onDark={onDark}
                label={`Confiança de ${item.label}`}
              />
              <span className={styles.confidenceValue}>{formatConfidence(item.confidence)}</span>
            </div>
          </div>
        </li>
      );
    })}
  </ul>
);
