#Nginx 动态添加模块

`/path/to/nginx/sbin/nginx -V `

```
nginx version: nginx/1.9.6
built by gcc 4.4.7 20120313 (Red Hat 4.4.7-16) (GCC) 
configure arguments: --prefix=/usr/local/webserver/nginx --with-ld-opt=-Wl,-rpath,/usr/local/lib --add-module=/usr/local/src/lua/ngx_devel_kit-0.2.19 --add-module=/usr/local/src/lua/lua-nginx-module-0.9.17
```

如添加ssl支持

####添加ssl支持

`yum install -y openssl-devel`

`cd /path/to/src/nginx`

复制已有的模块，

```
./configure --prefix=/usr/local/webserver/nginx \
--with-ld-opt=-Wl,-rpath,/usr/local/lib \
--add-module=/usr/local/src/lua/ngx_devel_kit-0.2.19 \
--add-module=/usr/local/src/lua/lua-nginx-module-0.9.17 \
--with-http_ssl_module
```

`make`

**注意,这里到make就好了，不要make install**

然后需要暂停nginx服务，可能你有更好的方法。

替换nginx二进制文件

`cp objs/nginx /path/to/nginx/sbin/nginx`

启动 `nginx`
