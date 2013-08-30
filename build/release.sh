#!/bin/bash

pushd ..
fis release -o --md5 2 -d output
rm -rf release/*
cp -r output/release/* release
rm -rf output
popd
