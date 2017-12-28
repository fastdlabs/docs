# 快速开始

在开始演示之前，请先确保如下环境已经成功安装.

1. PHP >= 5.6
2. [composer](https://getcomposer.org)
3. [swoole](https://github.com/swoole/swoole-src)

如果你使用虚拟机，可以使用 [Homestead](https://d.laravel-china.org/docs/5.5/homestead)。

## 创建演示项目

```shell
$ composer create-project fastd/fastd-demo
```

确定以上步骤安装完毕后，运行 PHP 内置 WEB 服务器:

```
$ php -S localhost:9876 -t web
```

访问: [http://localhost:9876](http://localhost:9876)

> PHP 内置 WEB 服务器可前往官网: http://php.net/manual/zh/features.commandline.webserver.php

输出:
 
```json
{
    "msg": "welcome fastd"
}
```

> 恭喜你，已经成功安装 fastd，是不是比想象中的简单。😆

## 使用 swoole

fastd 最大的一个特性之一，就是天生支持 swoole，可以让你的应用程序 "飞" 起来。

```shell
$ php bin/server start
```

访问监听的地址，结果与PHP 内置 Web 服务器结果保持一致，但是速度明显提升了。

输出:

```json
{
    "msg": "welcome fastd"
}
```

> 就是这么简单，什么都不用修改，就直接支持 swoole 执行了。

!> 值得注意的是: composer 在 cygwin 环境下，创建软连接失败，需要手动调整脚本。

```shell
dir=$(d=${0%[/\\]*}; cd "$d"; cd '../vendor/fastd/fastd' && pwd)

# See if we are running in Cygwin by checking for cygpath program
if command -v 'cygpath' >/dev/null 2>&1; then
	# Cygwin paths start with /cygdrive/ which will break windows PHP,
	# so we need to translate the dir path to windows format. However
	# we could be using cygwin PHP which does not require this, so we
	# test if the path to PHP starts with /cygdrive/ rather than /usr/bin
	if [[ $(which php) == /cygdrive/* ]]; then
		dir=$(cygpath -m "$dir");
	fi
fi

dir=$(echo $dir | sed 's/ /\ /g')
"${dir}/server" "$@"
```

此时此刻别慌，只需要将脚本内容拷贝到执行脚本中即可。

```
bin/console     =>  vendor/fastd/fastd/console
bin/server      =>  vendor/fastd/fastd/server
bin/process     =>  vendor/fastd/fastd/process
bin/client      =>  vendor/fastd/fastd/client
```
