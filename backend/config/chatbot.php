<?php

return [
    'start_node' => 'start',
    'payment_node' => 'lanjut ke pembayaran',

    'flow' => [
        'start' => [
            'text' => 'Kamu lagi kenapa?',
            'options' => ['sedih', 'marah', 'overthinking', 'lelah'],
        ],
        'sedih' => [
            'text' => 'Aku di sini ya. Kamu nggak sendirian.',
            'options' => ['cerita', 'distraksi'],
        ],
        'marah' => [
            'text' => 'Coba tarik napas dulu ya.',
            'options' => ['tenangin diri', 'curhat'],
        ],
        'overthinking' => [
            'text' => 'Kepikiran apa?',
            'options' => ['masa depan', 'hubungan'],
        ],
        'lelah' => [
            'text' => 'Kamu butuh istirahat.',
            'options' => ['tidur', 'hiburan'],
        ],
        'cerita' => [
            'text' => 'Coba cerita ke orang yang kamu percaya ya. Kalau kamu mau lanjut ke sesi yang lebih serius, aku bisa arahin ke pembayaran.',
            'options' => ['lanjut ke pembayaran'],
        ],
        'distraksi' => [
            'text' => 'Coba nonton atau denger musik dulu. Kalau kamu merasa butuh pendampingan lebih lanjut, aku bisa arahin ke pembayaran.',
            'options' => ['lanjut ke pembayaran'],
        ],
        'tenangin diri' => [
            'text' => 'Tarik napas 5 detik, hembuskan pelan. Kalau kamu ingin lanjut ke bantuan yang lebih intens, aku bisa arahin ke pembayaran.',
            'options' => ['lanjut ke pembayaran'],
        ],
        'curhat' => [
            'text' => 'Aku dengerin kok. Kalau kamu mau lanjut ke sesi berbayar, aku bisa arahin ke pembayaran.',
            'options' => ['lanjut ke pembayaran'],
        ],
        'masa depan' => [
            'text' => 'Pelan-pelan ya, masa depan nggak harus jelas sekarang. Kalau kamu ingin dibantu lebih lanjut, aku bisa arahin ke pembayaran.',
            'options' => ['lanjut ke pembayaran'],
        ],
        'hubungan' => [
            'text' => 'Hubungan itu butuh komunikasi. Kalau kamu mau lanjut ke sesi berbayar, aku bisa arahin ke pembayaran.',
            'options' => ['lanjut ke pembayaran'],
        ],
        'tidur' => [
            'text' => 'Istirahat yang cukup ya. Kalau kamu perlu bantuan lanjutan, aku bisa arahin ke pembayaran.',
            'options' => ['lanjut ke pembayaran'],
        ],
        'hiburan' => [
            'text' => 'Coba nonton film favorit kamu dulu. Kalau kamu mau lanjut ke sesi premium, aku bisa arahin ke pembayaran.',
            'options' => ['lanjut ke pembayaran'],
        ],
        'lanjut ke pembayaran' => [
            'text' => 'Oke, aku arahin kamu ke halaman pembayaran yang sudah tersedia ya.',
            'options' => [],
        ],
    ],
];
