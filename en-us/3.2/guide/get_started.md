# Quick start

Before starting the demonstration, please make sure that the following environment has been successfully installed.

1. PHP> = 5.6
2. [composer](https://getcomposer.org)
3. [swoole](https://github.com/swoole/swoole-src)

If you use a virtual machine, you can use [Homestead] (https://d.laravel-china.org/docs/5.5/homestead).

## Create Demo Project

```shell
$ composer create-project fastd/fastd-demo
```

After determining the above steps are installed, run the PHP built-in WEB server:

```
$ php -S localhost:9876 -t web
```

> PHP built-in WEB server can go to the official website: http://php.net/manual/zh/features.commandline.webserver.php


Visit: [http://localhost:9876] (http://localhost:9876)

```
Curl -i http://localhost:9876
```

response
 
```
HTTP/1.1 200
Host: 127.0.0.1:8888
Date: Fri, 29 Dec 2017 10:32:53 +0800
Connection: close
X-Powered-By: PHP / 7.1.11-1 + ubuntu16.04.1 + deb.sury.org + 1
Content-Type: application/json; charset=UTF-8

{"msg":"welcome fastd"}
```

> Congratulations, you have successfully installed fastd, is not simpler than imagined. 😆

## use swoole

One of the biggest features of fastd is its native support for swoole, which lets your app fly.

```shell
$ php bin/server start
```

Visit the address of the listener, the results and PHP built-in Web server results consistent, but significantly improved the speed.

Output:

```
HTTP/1.1 200 OK
Content-Type: application/json; charset = UTF-8
Server: swoole-http-server
Connection: keep-alive
Date: Fri, 29 Dec 2017 02:33:25 GMT
Content-Length: 23

{"msg":"welcome fastd"}
```

> It's just that simple, nothing to modify, directly support swoole execution.

!> It is worth noting: composer In cygwin environment, creating a soft connection failed, you need to manually adjust the script.

```shell
Dir=$(d=${0%[/\\]*}; cd "$d"; cd '../vendor/fastd/fastd' && pwd)

# See if we are running in Cygwin by checking for cygpath program
If command -v 'cygpath' >/dev/null 2>&1; then
# Cygwin paths start with /cygdrive/ which will break windows PHP,
# so we need to translate the dir path to windows format
# we could be using cygwin PHP which does not require this, so we
# test if the path to PHP starts with/cygdrive/ratherthan/usr/bin
If [[ $(which php) == /cygdrive/* ]]; then
Dir=$(cygpath -m "$dir");
Fi
fi

Dir=$(echo $dir | sed 's/ /\ /g')
"${dir}/server" "$@"
```

Do not panic at this moment, just copy the contents of the script to the executable script.

```
bin/console => vendor/fastd/fastd/bin/console
bin/server => vendor/fastd/fastd/bin/server
bin/process => vendor/fastd/fastd/bin/process
bin/client => vendor/fastd/fastd/bin/client
```