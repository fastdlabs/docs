export const examples = [
    {
        label: 'HELLO',
        file: 'hello.php',
        code: "return text('Hello FastD');",
        docs: '#/zh-cn/8.3/guide/getting-started',
    },
    {
        label: 'ROUTE',
        file: 'routes/web.php',
        code: "['GET', '/hello', HelloController::class]",
        docs: '#/zh-cn/8.3/guide/routing-controller',
    },
    {
        label: 'SSE',
        file: 'stream.php',
        code: "return sse(fn (EmitterInterface $e) => $e->send('tick'));",
        docs: '#/zh-cn/8.3/cookbook/sse',
    },
];
