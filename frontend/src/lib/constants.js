export const SPESIALISASI_MAP = {
    'kesehatan_mental': 'Kesehatan Mental',
    'kecemasan_stres': 'Kecemasan & Stres',
    'hubungan_percintaan': 'Hubungan & Percintaan',
    'keluarga': 'Keluarga',
    'sosial_pertemanan': 'Sosial & Pertemanan'
};

export const getSpesialisasiLabel = (slug) => {
    return SPESIALISASI_MAP[slug] || slug || 'Umum';
};
