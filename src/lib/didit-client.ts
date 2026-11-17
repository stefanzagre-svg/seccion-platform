export interface DiditSdkCompletionLike {
  type?: string;
  status?: string;
  session?: {
    sessionId?: string;
    status?: string;
  };
}

/**
 * Evaluates completion payloads from `@didit-protocol/sdk-web` (`0.6.x` `VerificationResult`
 * using `result.type === 'completed'` and `result.session?.status === 'Approved'`,
 * as well as legacy `result.status` shapes).
 */
export function isDiditVerificationCompleted(result: DiditSdkCompletionLike | null | undefined): boolean {
  if (!result || typeof result !== 'object') return false;
  const normalizedType = typeof result.type === 'string' ? result.type.toLowerCase() : '';
  const normalizedStatus = typeof result.status === 'string' ? result.status.toLowerCase() : '';
  const normalizedSessionStatus =
    typeof result.session?.status === 'string' ? result.session.status.toLowerCase() : '';

  return (
    normalizedType === 'completed' ||
    normalizedSessionStatus === 'approved' ||
    normalizedStatus === 'completed' ||
    normalizedStatus === 'approved'
  );
}
