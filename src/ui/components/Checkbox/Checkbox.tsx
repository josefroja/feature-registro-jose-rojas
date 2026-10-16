import { useId, type ReactNode, type Ref } from 'react';
import styles from './Checkbox.module.css';

type CheckboxProps = {
  label: string;
  /** Acción o enlace junto a la etiqueta (p. ej. «términos y condiciones»); forma parte del nombre accesible. */
  labelSuffix?: ReactNode;
  checked: boolean;
  onChange: (checked: boolean) => void;
  error?: string;
  ref?: Ref<HTMLInputElement>;
};

export function Checkbox({ label, labelSuffix, checked, onChange, error, ref }: CheckboxProps) {
  const id = useId();
  const labelId = `${id}-label`;
  const suffixId = `${id}-suffix`;
  const errorId = `${id}-error`;
  return (
    <div className={styles.field}>
      <div className={styles.wrapper}>
        <input
          id={id}
          ref={ref}
          type="checkbox"
          className={[styles.box, error && styles.invalid].filter(Boolean).join(' ')}
          checked={checked}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          aria-labelledby={labelSuffix ? `${labelId} ${suffixId}` : undefined}
          onChange={(event) => onChange(event.target.checked)}
        />
        <label id={labelId} htmlFor={id} className={styles.label}>
          {label}
        </label>
        {labelSuffix && <span id={suffixId}>{labelSuffix}</span>}
      </div>
      {error && (
        <p id={errorId} className={styles.error}>
          {error}
        </p>
      )}
    </div>
  );
}
