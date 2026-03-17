<?php

use App\Support\Importers\WooCommerceProductCsvImporter;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Symfony\Component\Console\Command\Command;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Artisan::command('catalog:import-woocommerce
    {file : Calea către exportul CSV WooCommerce}
    {--limit= : Numărul maxim de produse de procesat}
    {--dry-run : Parsează fișierul fără să scrie în baza de date}
    {--no-images : Nu descărca imaginile produselor}
    {--refresh-images : Înlocuiește galeria produselor deja importate}
    {--default-stock=100 : Stocul implicit pentru produse marcate în stoc, dar fără cantitate numerică}
', function (WooCommerceProductCsvImporter $importer) {
    $summary = $importer->import(
        filePath: (string) $this->argument('file'),
        options: [
            'limit' => $this->option('limit'),
            'dry_run' => (bool) $this->option('dry-run'),
            'download_images' => ! (bool) $this->option('no-images'),
            'refresh_images' => (bool) $this->option('refresh-images'),
            'default_stock' => (int) $this->option('default-stock'),
            'progress' => fn (string $message) => $this->line($message),
        ],
    );

    $this->newLine();
    $this->table(
        ['Procesate', 'Importate', 'Actualizate', 'Omise', 'Omise non-simple', 'Eșuate'],
        [[
            $summary['processed'],
            $summary['imported'],
            $summary['updated'],
            $summary['skipped'],
            $summary['skipped_non_simple'],
            $summary['failed'],
        ]]
    );

    if ($summary['errors'] !== []) {
        $this->newLine();
        $this->warn('Erori:');

        foreach ($summary['errors'] as $error) {
            $this->line('- '.$error);
        }
    }

    if ($summary['failed'] > 0) {
        return Command::FAILURE;
    }

    return Command::SUCCESS;
})->purpose('Importă produse WooCommerce dintr-un fișier CSV, cu categorii, atribute și imagini.');
