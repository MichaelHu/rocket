#!/bin/bash

pushd ..
fis release -d output
rm -rf release/*
cp -r output/release/build release
rm -rf output
popd
