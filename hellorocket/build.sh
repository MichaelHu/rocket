#!/bin/bash

rm -rf release/*
fis release -d output
cp -r output/static output/template release
rm -rf output
