import styles from './Button.module.css';
import { cn } from '@/lib/utils';

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'primary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export function Button({ variant = 'default', size = 'md', className, ...rest }: Props) {
  return (
    <button
      {...rest}
      className={cn(
        styles.btn,
        variant === 'primary' && styles.primary,
        variant === 'danger' && styles.danger,
        variant === 'ghost' && styles.ghost,
        size === 'sm' && styles.sm,
        size === 'lg' && styles.lg,
        className
      )}
    />
  );
}
