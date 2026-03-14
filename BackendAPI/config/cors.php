<?php

return [
    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    'allowed_origins' => [
        'http://localhost:5173',
        'http://localhost:3000',
        env('FRONTEND_URL', 'http://localhost:5173'),
    ],

    // Covers all Vercel preview deployments
    'allowed_origins_patterns' => [
        '#^https://[a-zA-Z0-9\-]+\.vercel\.app$#',
    ],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 86400,

    'supports_credentials' => false,
];

