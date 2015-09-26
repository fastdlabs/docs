#链接查看

查看TCP链接状态:

`netstat -n | awk '/^tcp/ {++state[$NF]} END {for(key in state) print key,"t",state[key]}'`