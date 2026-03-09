/**
 * Utility function to combine class names
 * Simple implementation for Tailwind CSS class merging
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}
