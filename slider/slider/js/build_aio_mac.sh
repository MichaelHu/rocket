#!/bin/bash

find -E . -type f -iregex "\.\/(slider|rocket).*js$" | grep -v "slider-aio" > tmp.lst
sed -E -e "s/^/__inline(\"/g" tmp.lst | sed -E -e "s/$/\")/g" > tmp_1.lst

find ../page -type f -regex ".*js$" > tmp.lst
sed -E -e "s/^/__inline(\"/g" tmp.lst | sed -E -e "s/$/\")/g" > tmp_2.lst

find ../globalview -type f -regex ".*js$" > tmp.lst
sed -E -e "s/^/__inline(\"/g" tmp.lst | sed -E -e "s/$/\")/g" > tmp_3.lst

cat tmp_1.lst tmp_2.lst tmp_3.lst > slider-aio.js 

rm tmp.lst tmp_1.lst tmp_2.lst tmp_3.lst
