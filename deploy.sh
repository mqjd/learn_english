#!/usr/bin/env sh

# 确保脚本抛出遇到的错误
set -e

git config --global user.name "mqjd"
git config --global user.email "1378415278@qq.com"

githubUrl=https://mqjd:${GITHUB_TOKEN}@github.com/mqjd/learn_english.git

npm install --legacy-peer-deps


npm install --global serve

# 部署github
npm run build

# bash ./optimize.sh

cd public
echo "mqjd.xyz" > CNAME
git init
git checkout --orphan pages
git add -A
git commit -m "来自github actions的自动部署"
git remote add origin "$githubUrl"
git push -f origin pages