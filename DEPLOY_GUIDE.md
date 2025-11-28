# GitHub Pages 公開ガイド

PhraseStockerをWeb上に公開して、誰でもブラウザから使えるようにする手順です。

## 1. 準備（完了済み）

以下の設定は既に完了しています：
- `vite.config.ts`: ベースパスを `/phrasestocker/` に設定
- `.github/workflows/deploy.yml`: 自動デプロイ用の設定ファイルを作成

## 2. GitHubでの設定

GitHubのリポジトリページで以下の設定を行ってください。

1. **Settings** タブを開く
2. 左メニューの **Pages** をクリック
3. **Build and deployment** セクションで：
   - Source: **GitHub Actions** を選択
   
   > ※ これだけでOKです！「Deploy from a branch」ではなく「GitHub Actions」を選ぶのがポイントです。

## 3. デプロイの実行

1. 変更をコミットしてプッシュします：

```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

2. プッシュすると自動的にデプロイが始まります。
3. **Actions** タブで進行状況を確認できます。
4. 完了すると、以下のURLでアプリにアクセスできるようになります：

```
https://<あなたのユーザー名>.github.io/phrasestocker/
```

## ⚠️ 注意事項

### データ保存について
Web版でもデータはブラウザの **LocalStorage** に保存されます。
- ユーザーごとにデータは独立しています
- ブラウザのキャッシュをクリアするとデータが消えます
- **「エクスポート」機能** を使って、こまめにバックアップを取るようユーザーに案内してください

### 自動保存機能について
Web版では、ブラウザのセキュリティ制限により、File System Access API（自動保存）の挙動が異なります：
- **PC (Chrome/Edge)**: 動作します（フォルダ選択が必要）
- **スマホ/その他**: 自動的にファイルがダウンロードされます

---

**これで、あなたのアプリを世界中の人に使ってもらえます！** 🚀
