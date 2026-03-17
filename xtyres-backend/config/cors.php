<?php

$defaultOrigins = [
    'http://127.0.0.1:5173',
    'http://localhost:5173',
    'http://127.0.0.1:5174',
    'http://localhost:5174',
    'https://new.xtyres.md',
    'new.xtyres.md'
];

$configuredOrigins = array_filter(array_map(
    static fn (?string $origin): ?string => $origin ? rtrim(trim($origin), '/') : null,
    explode(',', (string) env('CORS_ALLOWED_ORIGINS', '')),
));

$frontendOrigin = env('FRONTEND_URL');

if ($frontendOrigin) {
    $configuredOrigins[] = rtrim($frontendOrigin, '/');
}

$allowedOrigins = array_values(array_unique(array_merge($configuredOrigins, $defaultOrigins)));

$allowedOriginPatterns = array_values(array_filter(array_map(
    static fn (?string $pattern): ?string => $pattern ? trim($pattern) : null,
    explode(',', (string) env('CORS_ALLOWED_ORIGINS_PATTERNS', '')),
)));

return [
    'paths' => ['api/*', 'sanctum/csrf-cookie'],
    'allowed_methods' => ['*'],
    'allowed_origins' => $allowedOrigins,
    'allowed_origins_patterns' => $allowedOriginPatterns,
    'allowed_headers' => ['*'],
    'exposed_headers' => [],
    'max_age' => 0,
    'supports_credentials' => false,
];
