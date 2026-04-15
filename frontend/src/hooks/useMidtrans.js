/**
 * useMidtrans — hook untuk trigger Midtrans Snap payment popup
 *
 * Cara pakai:
 *   const { openSnap, loading, error } = useMidtrans();
 *
 *   // Di handler button:
 *   openSnap(snapToken, {
 *     onSuccess: (result) => console.log('Bayar sukses', result),
 *     onPending: (result) => console.log('Pending', result),
 *     onError:   (result) => console.log('Error', result),
 *     onClose:   ()       => console.log('Popup ditutup user'),
 *   });
 */

import { useState, useCallback } from 'react';

/**
 * Tunggu window.snap tersedia (karena script di-load async).
 * Retry tiap 100ms, timeout setelah 10 detik.
 */
const waitForSnap = (timeout = 10000) =>
    new Promise((resolve, reject) => {
        const start = Date.now();

        // Langsung tersedia? resolve sekarang.
        if (window.snap) return resolve(window.snap);

        const interval = setInterval(() => {
            if (window.snap) {
                clearInterval(interval);
                resolve(window.snap);
            } else if (Date.now() - start > timeout) {
                clearInterval(interval);
                reject(
                    new Error(
                        'Midtrans Snap belum tersedia setelah 10 detik. ' +
                        'Pastikan script di index.html sudah benar dan tidak diblokir ad-blocker.'
                    )
                );
            }
        }, 100);
    });

export const useMidtrans = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError]     = useState(null);

    /**
     * @param {string} snapToken   - token dari backend (response createTransaction)
     * @param {object} callbacks   - { onSuccess, onPending, onError, onClose }
     */
    const openSnap = useCallback(async (snapToken, callbacks = {}) => {
        if (!snapToken) {
            setError('snapToken tidak boleh kosong');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const snap = await waitForSnap();
            console.log('✅ window.snap ready, membuka popup…');

            snap.pay(snapToken, {
                onSuccess: (result) => {
                    setLoading(false);
                    console.log('💚 Payment success:', result);
                    callbacks.onSuccess?.(result);
                },
                onPending: (result) => {
                    setLoading(false);
                    console.log('🟡 Payment pending:', result);
                    callbacks.onPending?.(result);
                },
                onError: (result) => {
                    setLoading(false);
                    console.error('🔴 Payment error:', result);
                    setError('Pembayaran gagal. Coba lagi.');
                    callbacks.onError?.(result);
                },
                onClose: () => {
                    setLoading(false);
                    console.log('🚪 Popup ditutup user');
                    callbacks.onClose?.();
                },
            });
        } catch (err) {
            setLoading(false);
            setError(err.message);
            console.error('❌ useMidtrans error:', err.message);
        }
    }, []);

    return { openSnap, loading, error };
};
