#!/bin/bash
set -e
USER_NAME=$1

# 1. 最新コードを取得
APP_DIR="/app/$USER_NAME"
cd "$APP_DIR"
git pull

# 2. フロントエンドの設定を本番用に上書き
WEB_DIR="/usr/share/nginx/html/$USER_NAME"
# フロントエンドのファイルをコピー
cp -r ./src/web/* "$WEB_DIR/"
# フロントエンドの設定ファイルを上書き
cp "$WEB_DIR/prod_config.js" "$WEB_DIR/config.js"

# 3. バックエンドの設定を本番用に上書き (★今回追加する部分)
cp "$APP_DIR/src/node/prod_index.js" "$APP_DIR/src/node/index.js"
