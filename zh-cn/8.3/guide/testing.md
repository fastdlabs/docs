# 测试

FastD 提供 `FastD\Testing\TestCase`，用于直接分发请求，不启动 HTTP 服务。

## 测试类

```php
use FastD\Testing\TestCase;

final class WelcomeTest extends TestCase
{
    public function testWelcome(): void
    {
        $response = $this->handleRequest('GET', '/');

        $this->isSuccessful($response);
        $this->assertStringContainsString('hello', (string) $response->getBody());
    }
}
```

## 常用方法

| 方法 | 说明 |
|---|---|
| `handleRequest(method, path, body, headers)` | 构造请求并分发 |
| `isSuccessful(response)` | 2xx 断言 |
| `isBadRequest(response)` | 400 |
| `isNotFound(response)` | 404 |
| `isServerError(response)` | 500 |
| `json(response, expected)` | 校验 JSON |
| `equalsStatus` | 校验状态码 |

`handleRequest` 支持 Cookie header，便于串联 Session 测试：

```php
$first = $this->handleRequest('GET', '/session');
preg_match('/FASTD_SESSID=([a-f0-9]{32})/', $first->getHeaderLine('Set-Cookie'), $m);

$second = $this->handleRequest('GET', '/session', [], [
    'Cookie' => 'FASTD_SESSID=' . $m[1],
]);
```

## 自定义 bootstrap

```php
\FastD\Testing\TestCase::useBootstrap(__DIR__ . '/app/bootstrap.php');
```

或使用环境变量 `FASTD_BOOTSTRAP`。

## 组件测试

各组件独立仓库都有自己的 PHPUnit 配置：

```bash
composer install
vendor/bin/phpunit
```

FastD 的测试覆盖：

- HTTP、Routing、Session
- Swoole、Process、Parallel
- Cache、MedooDB
- Demo 路由和页面

## Demo 测试

`fastd/dobee-demo` 的 `tests/Feature` 覆盖了请求、Cookie、上传、下载、事件、CORS、事务、Session 安全等场景，可作为功能测试参考。
