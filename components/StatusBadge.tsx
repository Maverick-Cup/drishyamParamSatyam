import type { ExperienceStatus } from '@/types/portal';
import styles from './StatusBadge.module.css';

const statusStyles: Record<ExperienceStatus, string> = {
  active: styles.active,
  'coming-soon': styles.comingSoon,
  prototype: styles.prototype,
};

export default function StatusBadge({ status, label }: { status: ExperienceStatus; label: string }) {
  return (
    <span className={`${styles.badge} ${statusStyles[status]}`}>
      <span className={styles.dot} aria-hidden="true" />
      {label}
    </span>
  );
}
