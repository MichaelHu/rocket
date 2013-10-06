#!/bin/bash

# 不包含all-in-one文件以及exclude-前缀的文件
find . -type f -regex ".*js$" | grep -Ev "\-aio.js|\/exclude\-[^\/]+\.js" > tmp.lst
sed -E -e "s/^/__inline(\"/g" tmp.lst | sed -E -e "s/$/\")/g" > tmp_1.lst

# 不包含exclude-前缀的文件
find ../globalview -type f -regex ".*js" ! -regex ".*\/exclude.*.js" > tmp.lst
sed -E -e "s/^/__inline(\"/g" tmp.lst | sed -E -e "s/$/\")/g" > tmp_2.lst

find ../page -type f -regex ".*js" ! -regex ".*\/exclude.*.js" > tmp.lst
sed -E -e "s/^/__inline(\"/g" tmp.lst | sed -E -e "s/$/\")/g" > tmp_3.lst

cat tmp_1.lst tmp_2.lst tmp_3.lst > mytoolkit-aio.js 

rm tmp.lst tmp_1.lst tmp_2.lst tmp_3.lst


