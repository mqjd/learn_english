#!/usr/bin/env sh

# 确保脚本抛出遇到的错误
set -e

git config --global user.name "mqjd"
git config --global user.email "1378415278@qq.com"

githubUrl=https://mqjd:${GITHUB_TOKEN}@github.com/mqjd/learn_english.git
giteeUrl=https://MQJD:${GITEE_TOKEN}@gitee.com/MQJD/mqjd.git
# codingUrl=htps://JshEHrjrhN:${CODING_TOKEN}@mqjd.coding.net/mqjd/m/blog.git

npm install --legacy-peer-deps


npm install --global serve

# 部署github
npm run build

# bash ./optimize.sh

cd public
echo "mqjd.xyz" > CNAME
git init
git add -A
git commit -m "来自github actions的自动部署"
git push -f $githubUrl pages