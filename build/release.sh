#!/bin/bash

pushd ..
rm -rf release/*
fis release -d output
cp -r output/release/build release
rm -rf output
popd
