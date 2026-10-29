# 升级指南

FastD 生态由多个独立仓库组成，升级时需要同时关注框架、骨架和 Demo 包。各组件的权威升级说明以仓库根目录的 `UPGRADING.md` 为准：

| 仓库 | UPGRADING 文档 | 覆盖内容 |
|---|---|---|
| fastD | <https://github.com/fastdlabs/fastD/blob/master/UPGRADING.md> | 框架版本、Swoole 配置结构、兼容矩阵 |
| dobee | <https://github.com/fastdlabs/dobee/blob/master/UPGRADING.md> | 骨架依赖约束、Demo 拆分 |
| dobee-demo | <https://github.com/fastdlabs/dobee-demo/blob/master/UPGRADING.md> | Demo 包配置注入、安装脚本行为 |

如果本页与仓库 `UPGRADING.md` 不一致，以仓库文档和实际 tag 为准。

## 升级前检查

```bash
php -v
php --ri swoole
composer show 'fastd/*'
git status
```

确认：

- PHP >= 8.4.1
- Swoole >= 6.0（使用 Swoole 运行时）
- 当前分支/工作区没有未提交改动
- 已备份 `composer.lock` 与 `config/`、`routes/`、`src/`

建议在独立环境先升级并跑完整测试，再切换生产。

## 8.2.x → 8.3.x

### 变更概述

`fastD 8.3` 没有破坏性的配置结构变更，主要新增 Redis Session 的 Provider 集成（`RedisSessionHandler` 由 `fastd/http 8.2` 提供），并把 `fastd/http` 的最低版本提高到 `^8.2`。

- `fastd/fastd 8.3.1` 允许 `fastd/http ^8.2`、`fastd/swoole ^8.1`。
- 如果 `composer.lock` 仍固定 `fastd/http 8.1.x`，依赖解析会阻止升级，需要同步升级 `fastd/http`。
- `FastD\Http\Session\Handler\RedisSessionHandler` 可用。
- `SessionServiceProvider` 的 `handler` 支持直接写类名，也支持 `redis`、`auto`、`swoole_table`、`native_file` 别名。
- Swoole 配置仍为 `servers` / `listeners` / `options`，无需迁移。

仓库 `UPGRADING.md` 当前记录的最近一次结构变更是 8.1 → 8.2；8.2 → 8.3 可直接升级。

### 升级步骤

```bash
composer update "fastd/*" --with-dependencies
composer show 'fastd/*'
```

如果使用 Redis Session：

```bash
php -m | grep redis
```

并在 `config/session.php` 中显式设置 `RedisSessionHandler::class`（`auto` 不会选择 Redis）。配置示例见 [Redis Session](../cookbook/redis-session.md)。

### 验证

```bash
php -l config/swoole.php
php -l config/session.php
php bin/console list
```

启动后做一轮冒烟：

```bash
curl -i http://127.0.0.1:9527/
curl -i -c /tmp/fastd.cookie http://127.0.0.1:9527/session
curl -N --max-time 5 http://127.0.0.1:9527/sse
curl -i -X OPTIONS http://127.0.0.1:9527/cors-demo \
  -H 'Origin: https://demo.example' \
  -H 'Access-Control-Request-Method: GET'
```

## 8.1.x → 8.2.x

这是有破坏性变更的一次升级：Swoole 配置结构整体调整，且不保留旧配置兼容。

### 配置字段映射

| 8.1 | 8.2 |
|---|---|
| `listen` | `servers` |
| `listen[].worker` | `servers.<name>.listener` |
| `listener` | `listeners` |
| `setting` | `options` |

### 旧配置

```php
return [
    'listen' => [
        [
            'host' => '127.0.0.1',
            'port' => 9527,
            'worker' => \FastD\Listener\Server\SwHttpListener::class,
        ],
    ],
    'listener' => [
        \FastD\Swoole\Listener\Server\WorkerListener::class,
    ],
    'setting' => [
        'log_level' => 5,
    ],
];
```

### 新配置

```php
return [
    'servers' => [
        'http' => [
            'host' => '127.0.0.1',
            'port' => 9527,
            'listener' => \FastD\Listener\Server\SwHttpListener::class,
        ],
    ],
    'listeners' => [
        \FastD\Swoole\Listener\Server\WorkerListener::class,
    ],
    'options' => [
        'log_level' => 5,
    ],
];
```

升级后如果 `php bin/server start` 报 “server requires a listener” 或端口未监听，优先检查是否仍在使用 `listen` / `setting` 旧键。

## dobee 升级

### 1.3.4 → 1.3.5

`dobee 1.3.4` 的依赖约束可能解析到 fastD 8.2，但它的 Swoole 配置仍是旧结构。`1.3.5` 已锁定：

```json
"fastd/fastd": ">=8.1 <8.2",
"fastd/dobee-demo": ">=1.3 <1.4"
```

不要继续固定 `1.3.4`。

### 1.3.x → 1.4.x

`1.4` 是新主线：

```json
"fastd/fastd": "^8.2",
"fastd/dobee-demo": "^1.4"
```

主要变化：

- dobee 只保留最小欢迎接口与配置示例。
- Demo 拆分到 `fastd/dobee-demo`，通过 `require-dev` 安装。
- 安装脚本在原配置的 `return` 数组内注入 Demo 配置，不新增配置文件。
- Swoole 配置使用 `servers` / `listeners` / `options`。

## dobee-demo 升级

### 1.3.3 → 1.4.0

`1.4.0` 对齐 fastD 8.2：

```json
"fastd/fastd": "^8.2"
```

变化：

- 端口监听器键改为 `servers.*.listener`。
- Swoole 事件监听器改为 `listeners`。
- Swoole 原生配置改为 `options`。
- 安装脚本只修改原配置 `return` 数组中的 Demo 注入区：不新增配置文件，保留用户已有 server/service 配置，重复执行幂等。
- Demo 不存在时通过 `class_exists()` 自动降级。

安装或更新 Demo：

```bash
composer require --dev fastd/dobee-demo:^1.4.3
```

## 通用升级流程

```bash
# 1. 备份
cp composer.lock composer.lock.bak

# 2. 更新 FastD 组件
composer update "fastd/*" --with-dependencies

# 3. 检查版本
composer show 'fastd/*'

# 4. 语法检查
php -l config/swoole.php
php -l config/service.php
php -l config/session.php

# 5. 跑测试
php vendor/bin/phpunit

# 6. 重启 Swoole
php bin/server stop
php bin/server start
```

CGI 不需要重启常驻进程，但需要让 OPcache 失效或重载 PHP-FPM。

## 回滚

```bash
cp composer.lock.bak composer.lock
composer install
php bin/server stop
php bin/server start
```

如果配置结构已经迁移，回滚代码后也要把 `config/swoole.php` 恢复为旧结构；配置不会随 Composer 自动回退。

## 注意事项

- **不要跨大版本跳级**：8.1 → 8.3 应先到 8.2，完成配置迁移后再到 8.3。
- **组件版本独立**：`fastd/http`、`fastd/swoole` 等组件的补丁号不需要与 fastD 一致，升级后以 `composer show` 为准。
- **Demo 安装脚本会修改配置**：升级 Demo 前先看 `git diff config/`，确认注入内容符合预期。
- **生产禁用 Demo**：`composer install --no-dev`，避免 Demo 路由和 CORS 中间件进入生产。
- **Redis Session 连接时机**：Swoole 下连接在 Worker fork 前建立，多 Worker 场景需评估连接共享风险，见 [Redis Session](../cookbook/redis-session.md)。
- **升级后清理缓存**：文件缓存、配置缓存、OPcache 都可能保留旧代码或旧配置。
- **保留日志**：升级窗口内保留 `runtime/logs/`，便于定位启动失败与运行时异常。
