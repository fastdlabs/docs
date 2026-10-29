# 生命周期

## 概念与职责

FastD 用 `FastD\Runtime` 统一四种执行入口，用 `FastD\Application` 统一应用装配。

| Runtime | 入口 | 环境名 |
|---|---|---|
| `FastD\Server\CgiServer` | `web/index.php` | `fastcgi` |
| `FastD\Server\SwServer` | `bin/server` | `swoole` |
| `FastD\Terminal\Console` | `bin/console` | `console` |
| `FastD\Terminal\Process` | `bin/process` | `process` |

`Runtime` 只负责三件事：启动应用、取得输入、处理输出/异常；具体实现由子类完成。

```php
abstract class Runtime
{
    public function __construct(
        public readonly string $environment,
        public readonly Application $application,
    ) {}

    public function run(): void
    {
        $this->booted();   // bootstrap() + BootedEvent
        $this->process();  // input() -> output() -> FinishEvent / abort() -> AbortEvent
    }
}
```

## Application 的注册顺序

`Application::bootstrap($runtime)` 带幂等保护，首次执行时按以下顺序装配：

```text
设置 runtime、date_default_timezone_set(timezone)
1. registerEventListener(include listener)
2. registerServices(include service)
     2.1 默认服务：config（FileParser + .env.yml）、logger、matcher
     2.2 依次执行 config/service.php 中的 Provider::register()
3. registerRoutes(include route)
4. booted = true
```

几个顺序结论：

- 监听器先于服务注册，所以 Provider 里可以 `event()->addListener()`。
- 默认服务先于业务 Provider，所以 Provider 里可以取 `config`、`logger`、`matcher`。
- 路由最后注册，Provider 执行时还没有来自 `routes` 文件的路由（Provider 可以自己往 `routeCollection` 里加）。
- `config/listener.php` 中的监听器用无参 `new` 实例化；Provider 里的监听器可用 `$container->make()` 做构造注入。

CGI 入口：

```php
// web/index.php
include __DIR__ . '/../vendor/autoload.php';

$cgi = new CgiServer('fastcgi', new Application(include __DIR__ . '/../src/bootstrap.php'));
$cgi->run();
```

## CGI / FastCGI 请求顺序

```text
CgiServer::run()
  → booted()
      → Application::bootstrap('fastcgi')
      → dispatch(BootedEvent)
  → process()
      → input(): CgiServer::input()
          → ServerRequest::fromGlobals()
          → Application::dispatch()
          → RouteMatcher::dispatch()
      → output(): $response->send()
      → dispatch(FinishEvent)
  异常：abort($throwable) → dispatch(AbortEvent)
```

每次请求都会新建 `Application` 并完整执行一次 bootstrap；PHP-FPM 复用进程，但应用状态不跨请求保留。`ServerRequest::fromGlobals()` 从 `$_SERVER` 组装 URI（依赖 `REQUEST_URI`、`HTTP_HOST`、`HTTPS`/`REQUEST_SCHEME`），并带上 `$_GET`、`$_POST`、`$_COOKIE`、`$_FILES`。

## Swoole 启动与请求顺序

启动：

```text
php bin/server [start|stop|reload|status] [-d]
  → new SwServer('swoole', new Application(bootstrap))
  → run()
      → booted()
          → Application::bootstrap('swoole')
              → 应用监听器、Provider、路由
          → SwServer::bootstrap()
              → Application::config('swoole')
              → 强制设置 pid_file / log_file / log_rotation
              → new Server($options, new SwooleEventDispatcher($listenerProvider))
              → 追加 config/swoole.php 的 listeners
              → 为每个 servers 项调用 listen(host, port, listener)
              → 用 server 的 eventDispatcher 替换容器中的 event
          → dispatch(BootedEvent)   // 此时已经走 SwooleEventDispatcher
      → process()
          → input(): 解析 action，start/stop/reload/status
          → start 会阻塞到服务器退出
          → output(): 只写 logger
          → dispatch(FinishEvent)
```

请求：

```text
Swoole 'request' 事件
  → SwooleEventDispatcher::forward('request', ...)
  → FastD\Swoole\Listener\Server\RequestListener::process()
  → SwooleServerRequest::fromSwoole()
  → SwHttpListener::onRequest()
  → Application::dispatch()
  → 全局中间件 → 路由中间件 → 控制器
  → sendResponse()
```

**关键差异**：Swoole 的 `Runtime::process()` 只包住 `start()` 这个阻塞调用，不包每个请求。因此：

- 每个 HTTP 请求不会触发 `BootedEvent` / `FinishEvent` / `AbortEvent`。
- 请求内异常由 `RequestListener::process()` 捕获，转成 500 JSON（含 `file`、`line`、`message`、`code`、`trace`）。
- 只有 `start()` 返回（正常停止）才派发 `FinishEvent`；启动阶段抛异常才走 `SwServer::abort()` + `AbortEvent`。
- Application、路由、Provider 实例在 master 进程创建，worker fork 后共享副本；请求级状态必须放在请求对象或请求属性里。

`BootedEvent` 在 Swoole 下仍会派发一次，时间点在 `Server` 对象和 `servers` 中的 listener 注册完成之后、`start()` 之前；真正的端口 bind 发生在 `start()` 内部。Cache / MedooDB 的 `BootedEventListener` 正是利用这个时机检查 `runtime === 'swoole'` 并预建连接。

## Console 与 Process

```text
php bin/console <command>
  → Console::run()
  → booted()（bootstrap + BootedEvent）
  → input(): 读取 config('command')，new $command，交给 Symfony Console 执行
  → output(): 打印 "[时间] " + 返回值（通常为空行）
  → dispatch(FinishEvent)
```

Console 命令由 `new $command` 实例化，不能声明构造依赖；需要容器时在 `execute()` 内用 `container()`。

```text
php bin/process
  → Process::run()
  → booted()（bootstrap + BootedEvent）
  → input(): 读取 config('process')
      → 注册 listener（信号）
      → new $worker($name) 注册 worker
      → Swoole\Process::start()，阻塞到进程退出
  → output(): 打印 "[时间] "
  → dispatch(FinishEvent)
```

Process 的 Worker 类只接收 `$name` 一个构造参数，其它依赖要在 `process()` 里通过 `container()` 获取。

## Runtime::booted() 与 Runtime::process()

| 方法 | 实际行为 |
|---|---|
| `booted()` | 调用 `bootstrap()`，再派发 `BootedEvent($this)`；不会检查是否已经派发过 |
| `bootstrap()` | 转调 `Application::bootstrap($environment)`，内部幂等 |
| `process()` | `try { output(input()); FinishEvent } catch (Throwable) { abort(); AbortEvent }` |
| `run()` | `booted()` + `process()` |

`BootedEvent` / `FinishEvent` / `AbortEvent` 都只有一个只读属性 `Runtime $runtime`，通过 `$event->runtime->application`、`$event->runtime->environment` 访问应用与环境。

事件触发时机：

| 事件 | 触发点 | 是否每请求 |
|---|---|---|
| `BootedEvent` | 监听器、服务、路由注册完成；Swoole 还包含端口与 dispatcher 初始化 | 否，每个进程一次 |
| `FinishEvent` | `output()` 正常返回后 | CGI 是每请求；Swoole 是整个 server 退出时 |
| `AbortEvent` | `abort()` 执行完（响应已发送/已打印）后 | CGI 是每请求；Swoole 仅启动失败 |

## 路由与中间件 dispatch

`RouteMatcher::dispatch()` 的真实流程：

1. `match()`：先查当前方法的静态路由，再查当前方法的变量路由；然后用 `*` 方法的静态/变量路由兜底，`*` 命中会覆盖前面的结果；都没有则抛 `RouteNotFoundException`（异常 code 为 404）。
2. 为本次请求新建 `Dispatcher`，并 `clone` matcher 的中间件栈，避免 Swoole 协程交错污染。
3. 按路由数组顺序 push 路由中间件；类不存在抛 `RuntimeException`，实例通过 resolver（`Container::make()`）创建，支持构造注入。
4. 最后 push `RouteMiddleware` 作为终点。
5. `Dispatcher` 从栈底依次 `shift()`，所以**执行顺序 = push 顺序**：先注册的全局中间件（如 Session）在最外层，然后是按数组顺序的路由中间件，最后是控制器。
6. 响应按相反顺序回退；中间件可以不调用 `$handler->handle()` 直接短路。

`RouteMiddleware` 支持的 handler：

- `'Class@method'`：类与方法都存在时，用容器解析类后调用。
- 实现 `MiddlewareInterface` 的类名：调用其 `process()`。
- 函数名：直接调用。
- 其它 callable：直接调用。

handler 统一按 `[$request, $handler]` 两个参数调用；请求属性不会自动展开成方法参数。

## 注意事项 / 常见错误

- 不要在 Swoole 请求里期待 `FinishEvent`；它只在 server 退出时触发。需要请求结束逻辑，用中间件在 `handle()` 返回后处理。
- `AbortEvent` 在响应发送之后才触发，监听器不能改写响应。
- 路由 404 在中间件栈创建之前抛出，普通错误中间件捕获不到；需要自定义 `CgiServer::abort()` 或兜底路由，见[异常与日志](error-logging.md)。
- 控制器抛异常且没有内层中间件捕获时，Session 中间件不会执行 `save()` 与 `Set-Cookie`，本次会话修改会丢失。
- `Application::bootstrap()` 只执行一次；但重复调用 `Runtime::run()` 会重复派发 `BootedEvent` 并重复执行输入逻辑。
- 监听器内部抛出的异常会被事件调度器收集，不会中断启动流程；不要依赖监听器异常阻止启动。
- Swoole 常驻进程共享容器中的服务实例，不要把请求数据存到服务属性上。
- `reload` 只重启 worker，不重新执行 master 中的 bootstrap；修改 Provider/配置/路由后要完整重启。

## 相关链接

- [运行时](runtime.md)
- [中间件](middleware.md)
- [Session](session.md)
- [Console 与 Process](console-process.md)
- [fastd/fastd](../components/fastd.md)
- [fastd/swoole](../components/swoole.md)
- [fastd/routing](../components/routing.md)
- [fastd/middleware](../components/middleware.md)
