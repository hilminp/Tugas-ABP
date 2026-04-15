<?php

return [
    'start_node' => 'start',

    'flow' => [
        'start' => [
            'text' => 'Kamu lagi kenapa?',
            'options' => ['iya nih aku lagi sedih', 'aku sekarang marah banget', 'aku lagi kepikiran sesuatu', 'aku lagi cape pengen ada temen ngobrol'],
        ],
        'iya nih aku lagi sedih' => [
            'text' => 'Aku di sini ya 🤍 Kamu nggak sendirian.',
            'options' => ['cerita', 'distraksi'],
        ],
        'aku sekarang marah banget' => [
            'text' => 'Coba tarik napas dulu ya 😤',
            'options' => ['tenangin diri', 'curhat'],
        ],
        'aku lagi kepikiran sesuatu' => [
            'text' => 'Kepikiran apa?',
            'options' => ['masa depan', 'hubungan'],
        ],
        'lelah' => [
            'text' => 'Kamu butuh istirahat 😴',
            'options' => ['tidur', 'hiburan'],
        ],
        'aku lagi cape pengen ada temen ngobrol' => [
            'text' => 'Coba cerita ke orang yang kamu percaya ya 🤍',
            'options' => [],
        ],
        'distraksi' => [
            'text' => 'Coba nonton atau denger musik 🎧',
            'options' => [],
        ],
        'tenangin diri' => [
            'text' => 'Tarik napas 5 detik, hembuskan pelan 🧘',
            'options' => [],
        ],
        'curhat' => [
            'text' => 'Aku dengerin kok 🤍',
            'options' => [],
        ],
        'masa depan' => [
            'text' => 'Pelan-pelan ya, masa depan nggak harus jelas sekarang 🌱',
            'options' => [],
        ],
        'hubungan' => [
            'text' => 'Hubungan itu butuh komunikasi 🤝',
            'options' => [],
        ],
        'tidur' => [
            'text' => 'Istirahat yang cukup ya 😴',
            'options' => [],
        ],
        'hiburan' => [
            'text' => 'Coba nonton film favorit kamu 🎬',
            'options' => [],
        ],
    ],
];
