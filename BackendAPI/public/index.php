<?php

use Illuminate\Http\Request;

define('LARAVEL_START', microtime(true));

// ============================================================
// CORS — Set headers before Laravel boots so nothing can block
// ============================================================
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://drink-store-topaz.vercel.app',
];

// Also allow any *.vercel.app subdomain (preview deployments)
$isAllowed = in_array($origin, $allowedOrigins)
    || (bool) preg_match('#^https://[a-zA-Z0-9\-]+\.vercel\.app$#', $origin);

if ($isAllowed) {
    header("Access-Control-Allow-Origin: $origin");
    header("Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type, Authorization, Accept, X-Requested-With, X-XSRF-TOKEN");
    header("Access-Control-Allow-Credentials: true");
    header("Access-Control-Max-Age: 86400");
}

// Answer OPTIONS preflight immediately — no need to hit Laravel at all
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}
// ============================================================

// Determine if the application is in maintenance mode...
if (file_exists($maintenance = __DIR__.'/../storage/framework/maintenance.php')) {
    require $maintenance;
}

// Register the Composer autoloader...
require __DIR__.'/../vendor/autoload.php';

// Bootstrap Laravel and handle the request...
(require_once __DIR__.'/../bootstrap/app.php')
    ->handleRequest(Request::capture());
