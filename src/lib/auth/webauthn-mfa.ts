/**
 * WebAuthn Biometric & Hardware Passkey MFA
 * 
 * Provides cryptographic user presence verification (FaceID, TouchID, Windows Hello)
 * to guard high-consequence operations (emergency kill-switch override, digital replica consent).
 */

export async function verifyBiometricPresence(actionDescription: string = 'Confirm Identity'): Promise<boolean> {
  if (typeof window === 'undefined') return false;

  // Check if browser and operating system support WebAuthn
  if (!window.PublicKeyCredential) {
    console.warn('[WebAuthn] Hardware biometric authentication not supported on this platform.');
    return false;
  }

  try {
    const challenge = new Uint8Array(32);
    window.crypto.getRandomValues(challenge);

    // Prompt native FaceID / TouchID / Windows Hello / Android Fingerprint dialog
    const credential = await navigator.credentials.get({
      publicKey: {
        challenge,
        timeout: 60000,
        userVerification: 'required',
        rpId: window.location.hostname,
      },
    });

    return !!credential;
  } catch (err: any) {
    console.warn(`[WebAuthn] Biometric verification failed or cancelled for ${actionDescription}:`, err?.message);
    return false;
  }
}
