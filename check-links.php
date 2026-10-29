<?php

declare(strict_types=1);

/**
 * 校验 docsify 文档中的本地 Markdown 链接。
 *
 * 用法：php check-links.php
 */

$root = __DIR__;
$errors = [];
$checked = 0;

$scanRoot = $root . DIRECTORY_SEPARATOR . 'zh-cn' . DIRECTORY_SEPARATOR . '8.3';
$iterator = new RecursiveIteratorIterator(
    new RecursiveDirectoryIterator($scanRoot, FilesystemIterator::SKIP_DOTS)
);

foreach ($iterator as $file) {
    if (!$file instanceof SplFileInfo || $file->getExtension() !== 'md') {
        continue;
    }

    $path = $file->getPathname();
    $relative = ltrim(str_replace($root, '', $path), DIRECTORY_SEPARATOR);
    $content = (string) file_get_contents($path);

    preg_match_all('/\[[^\]]*\]\(([^)\s]+)(?:\s+"[^"]*")?\)/', $content, $matches);

    foreach ($matches[1] as $link) {
        $link = trim($link);

        if ($link === '' || $link[0] === '#' || preg_match('#^(https?:|mailto:|tel:)#i', $link)) {
            continue;
        }

        $link = explode('#', $link, 2)[0];

        if ($link === '') {
            continue;
        }

        $target = realpath(dirname($path) . DIRECTORY_SEPARATOR . rawurldecode($link));
        $checked++;

        if ($target === false) {
            $errors[] = sprintf('%s -> %s', $relative, $link);
            continue;
        }

        if (is_dir($target) && !is_file($target . '/README.md')) {
            $errors[] = sprintf('%s -> %s (目录缺少 README.md)', $relative, $link);
        }
    }
}

// 根目录入口文件也做本地链接校验。
foreach (['README.md', '_coverpage.md'] as $entry) {
    $path = $root . DIRECTORY_SEPARATOR . $entry;

    if (!is_file($path)) {
        $errors[] = $entry . ' 不存在';
        continue;
    }

    preg_match_all('/\[[^\]]*\]\(([^)\s]+)(?:\s+"[^"]*")?\)/', (string) file_get_contents($path), $matches);

    foreach ($matches[1] as $link) {
        if ($link === '' || $link[0] === '#' || preg_match('#^(https?:|mailto:|tel:)#i', $link)) {
            continue;
        }

        $link = explode('#', $link, 2)[0];
        $target = realpath($root . DIRECTORY_SEPARATOR . $link);
        $checked++;

        if ($target === false) {
            $errors[] = sprintf('%s -> %s', $entry, $link);
        }
    }
}

// 侧边栏/导航栏使用仓库根路径，单独校验。
foreach (['_sidebar.md', '_navbar.md'] as $nav) {
    $path = $root . DIRECTORY_SEPARATOR . $nav;

    if (!is_file($path)) {
        $errors[] = $nav . ' 不存在';
        continue;
    }

    preg_match_all('/\[[^\]]*\]\(([^)\s]+)(?:\s+"[^"]*")?\)/', (string) file_get_contents($path), $matches);

    foreach ($matches[1] as $link) {
        if ($link === '' || $link[0] === '#' || preg_match('#^(https?:|mailto:|tel:)#i', $link)) {
            continue;
        }

        $link = explode('#', $link, 2)[0];
        $target = realpath($root . DIRECTORY_SEPARATOR . $link);
        $checked++;

        if ($target === false) {
            $errors[] = sprintf('%s -> %s', $nav, $link);
        }
    }
}

printf("checked=%d errors=%d\n", $checked, count($errors));

foreach ($errors as $error) {
    fwrite(STDERR, "MISSING {$error}\n");
}

exit($errors === [] ? 0 : 1);
