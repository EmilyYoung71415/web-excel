#!/usr/bin/env sh
# 发生错误时退出 
set -e
# 打包
npm run build
# 进入dist目录 将dist目录的代码提交到 gh-pages分支
cd dist
git init
git add -A
git commit -m 'deploy'
git push -f https://github.com/EmilyYoung71415/web-excel.git master:gh-pages
cd -