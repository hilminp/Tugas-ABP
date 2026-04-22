/**
 * CONTOH: Komponen tombol bayar dengan Midtrans Snap
 *
 * Cara kerja:
 * 1. User klik tombol "Bayar"
 * 2. Frontend minta snap_token ke backend
 * 3. Backend buat transaksi ke Midtrans API → return snap_token
 * 4. useMidtrans().openSnap(token) → buka popup Midtrans
 */

import React, { useState } from 'react';
import { useMidtrans } from '../hooks/useMidtrans';
import { api } from '../lib/api';  // axios instance kamu

const PaymentButton = ({ consultationId, amount }) => {
    const { openSnap, loading, error } = useMidtrans();
    const [fetchingToken, setFetchingToken] = useState(false);

    const handleBayar = async () => {
        setFetchingToken(true);

        try {
            // 1. Minta snap_token dari backend Laravel
            //    Sesuaikan endpoint dengan route yang ada di backend kamu
            const { data } = await api.post('/payments/create', {
                consultation_id: consultationId,
                amount,
            });

            const snapToken = data.snap_token; // pastikan backend return ini

            // 2. Buka popup Midtrans
            openSnap(snapToken, {
                onSuccess: (result) => {
                    console.log('Bayar sukses ✅', result);
                    alert('Pembayaran berhasil!');
                },
                onPending: (result) => {
                    console.log('Pending 🟡', result);
                    alert('Pembayaran pending, cek email kamu.');
                },
                onError: (result) => {
                    console.error('Gagal 🔴', result);
                    alert('Pembayaran gagal, coba lagi.');
                },
                onClose: () => {
                    console.log('Popup ditutup tanpa bayar');
                },
            });
        } catch (err) {
            console.error('Gagal minta token:', err);
            alert('Gagal memulai pembayaran. Coba lagi.');
        } finally {
            setFetchingToken(false);
        }
    };

    const isLoading = loading || fetchingToken;

    return (
        <div>
            <button
                onClick={handleBayar}
                disabled={isLoading}
                style={{
                    padding: '12px 32px',
                    background: isLoading ? '#ccc' : '#356765',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '9999px',
                    fontWeight: 700,
                    fontSize: '1rem',
                    cursor: isLoading ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s',
                }}
            >
                {isLoading ? '⏳ Memproses...' : `💳 Bayar Rp ${amount?.toLocaleString('id-ID')}`}
            </button>

            {error && (
                <p style={{ color: 'red', marginTop: 8, fontSize: 14 }}>
                    ❌ {error}
                </p>
            )}
        </div>
    );
};

export default PaymentButton;
