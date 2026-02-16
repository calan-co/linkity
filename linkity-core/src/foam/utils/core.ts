/**
 * Checks if a value is null, undefined, or void.
 *
 * @param value - The value to check.
 * @returns True if the value is null, undefined, or void, otherwise false.
 */
export function isNone<T>(
  value: T | null | undefined | void
): value is null | undefined | void {
  return value == null;
}
