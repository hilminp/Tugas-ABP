import React from 'react';
import { Link } from 'react-router-dom';

const RegisterRoleSelect = () => {
    return (
        <div style={{
            minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', 
            padding: '40px', background: '#FFF8EE', fontFamily: "'Poppins', sans-serif"
        }}>
            <div style={{ width: '100%', maxWidth: '900px', textAlign: 'center' }}>
                <h1 style={{ fontSize: '36px', fontWeight: 700, color: '#BE5985', marginBottom: '16px' }}>
                    Pilih Jenis Akun Anda
                </h1>
                <p style={{ fontSize: '18px', color: '#555', marginBottom: '48px' }}>
                    Silakan pilih apakah Anda ingin mendaftar sebagai Psikolog atau pengguna Anonim
                </p>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px' }}>
                    <Link to="/register/psikolog" style={{
                        background: '#FFF', borderRadius: '24px', padding: '48px 32px', 
                        boxShadow: '0 4px 20px rgba(0,0,0,0.12)', textDecoration: 'none', color: 'inherit', display: 'block',
                        transition: 'transform 0.3s ease, box-shadow 0.3s ease'
                    }} 
                    onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-8px)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.18)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.12)'; }}
                    >
                        <div style={{ fontSize: '72px', marginBottom: '24px' }}>👨‍⚕️</div>
                        <div style={{ fontSize: '28px', fontWeight: 700, color: '#BE5985', marginBottom: '12px' }}>Psikolog</div>
                        <div style={{ fontSize: '15px', color: '#666', lineHeight: 1.6 }}>
                            Daftar sebagai psikolog profesional. Anda perlu mengunggah STR Psikolog dan Ijazah untuk verifikasi.
                        </div>
                    </Link>
                    
                    <Link to="/register/anonim" style={{
                        background: '#FFF', borderRadius: '24px', padding: '48px 32px', 
                        boxShadow: '0 4px 20px rgba(0,0,0,0.12)', textDecoration: 'none', color: 'inherit', display: 'block',
                        transition: 'transform 0.3s ease, box-shadow 0.3s ease'
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-8px)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.18)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.12)'; }}
                    >
                        <div style={{ fontSize: '72px', marginBottom: '24px' }}>🙋</div>
                        <div style={{ fontSize: '28px', fontWeight: 700, color: '#BE5985', marginBottom: '12px' }}>Anonim</div>
                        <div style={{ fontSize: '15px', color: '#666', lineHeight: 1.6 }}>
                            Daftar sebagai pengguna anonim untuk berbagi cerita dan mendapat dukungan dari komunitas.
                        </div>
                    </Link>
                </div>
                
                <Link to="/" style={{ display: 'inline-block', marginTop: '32px', color: '#BE5985', textDecoration: 'none', fontWeight: 600, fontSize: '16px' }}>
                    ← Kembali ke Beranda
                </Link>
            </div>
        </div>
    );
};

export default RegisterRoleSelect;
