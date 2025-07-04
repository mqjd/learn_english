#!/usr/bin/env sh

# 确保脚本抛出遇到的错误
set -e

asserts=$(find public -type f | grep -v .html | grep -v .json | grep -v .webmanifest)
htmls=$(find public -type f | grep .html)
codingPath="https://mqjd.coding.net/p/m/d/blog/git/raw/master/"

for html in $htmls
do
    for assert in $asserts
    do
        sed -i "s#\"${assert:6}\"#\"${codingPath}${assert:7}\"#g" $html
    done
done