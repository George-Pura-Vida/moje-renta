<?php
declare(strict_types=1);
require __DIR__ . '/auth/bootstrap.php';
try {
    auth_boot();
    $user = auth_require();
} catch (Throwable $e) {
    error_log('MOJE RENTA protected index failed: ' . get_class($e));
    http_response_code(503);
    header('Content-Type: text/plain; charset=UTF-8');
    exit('Přihlášení není momentálně dostupné. Zkuste to později.');
}
header('Content-Type: text/html; charset=UTF-8');
define('MOJE_RENTA_AUTH_RENDER', true);
require __DIR__ . '/app.view.php';
