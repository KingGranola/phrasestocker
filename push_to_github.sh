#!/bin/bash

echo "🚀 GitHubへのアップロードセットアップ"
echo "-----------------------------------"
echo "1. ブラウザで https://github.com/new にアクセスしてください"
echo "2. 'phrasestocker' という名前でリポジトリを作成してください"
echo "3. 作成後、'HTTPS' のURLをコピーしてください"
echo "   (例: https://github.com/username/phrasestocker.git)"
echo "-----------------------------------"
echo ""

# URLの入力を待つ
read -p "コピーしたURLを貼り付けて Enter を押してください: " REPO_URL

if [ -z "$REPO_URL" ]; then
  echo "❌ URLが入力されませんでした。中止します。"
  exit 1
fi

# リモートの追加（既に存在する場合は変更）
if git remote | grep -q "origin"; then
  git remote set-url origin "$REPO_URL"
else
  git remote add origin "$REPO_URL"
fi

echo ""
echo "📦 GitHubへプッシュ中..."
echo "※ GitHubのユーザー名とパスワード（またはトークン）が求められる場合があります"
echo ""

# プッシュ実行
git branch -M main
git push -u origin main

if [ $? -eq 0 ]; then
  echo ""
  echo "✅ アップロード完了！"
  echo "GitHub Pagesの設定を行うには、リポジトリの Settings > Pages を確認してください。"
else
  echo ""
  echo "❌ プッシュに失敗しました。"
  echo "URLが正しいか、または権限があるか確認してください。"
fi
