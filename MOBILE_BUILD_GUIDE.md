# PhraseStocker モバイルアプリ ビルドガイド

このガイドでは、PhraseStockerをiOSおよびAndroidアプリとしてビルドする手順を説明します。

## 前提条件

### 共通
- Node.js (v18以上)
- npm または yarn

### iOS開発
- **macOS** (必須)
- **Xcode** (最新版推奨、App Storeから入手)
- **CocoaPods** (インストール: `sudo gem install cocoapods`)

### Android開発
- **Android Studio** (最新版推奨)
- **Java Development Kit (JDK)** 17以上
- Android SDK (Android Studioに含まれる)

---

## 初回セットアップ

### 1. 依存関係のインストール

```bash
cd /path/to/phrasestocker
npm install
```

### 2. Webアセットのビルド

モバイル用にWebアセットをビルドします（base pathが `/` になります）:

```bash
npm run build:mobile
```

### 3. Capacitorプロジェクトの初期化

iOSとAndroidのネイティブプロジェクトを生成します:

```bash
npm run cap:sync
```

これにより、`ios/` と `android/` ディレクトリが作成されます。

---

## iOSアプリのビルド

### 1. Xcodeでプロジェクトを開く

```bash
npm run cap:open:ios
```

または手動で開く:
```bash
open ios/App/App.xcworkspace
```

> ⚠️ **注意**: `.xcodeproj` ではなく `.xcworkspace` を開いてください。

### 2. 署名設定

1. Xcodeでプロジェクトナビゲーターから **App** を選択
2. **Signing & Capabilities** タブを開く
3. **Team** を選択（Apple Developer Programのアカウントが必要）
4. **Bundle Identifier** を確認（デフォルト: `com.phrasestocker.app`）

### 3. シミュレーターで実行

1. Xcodeの上部でターゲットデバイスを選択（例: iPhone 15 Pro）
2. **Run** ボタン (▶️) をクリック
3. アプリがシミュレーターで起動します

### 4. 実機で実行

1. iPhoneをMacに接続
2. Xcodeのデバイス選択で接続したiPhoneを選択
3. **Run** ボタンをクリック
4. 初回は「信頼されていない開発者」エラーが出る場合があります:
   - iPhone: 設定 → 一般 → VPNとデバイス管理 → 開発者アプリ → 信頼

### 5. App Storeへの配布

1. Xcodeで **Product** → **Archive**
2. Organizerが開いたら **Distribute App** を選択
3. App Store Connectの指示に従ってアップロード

---

## Androidアプリのビルド

### 1. Android Studioでプロジェクトを開く

```bash
npm run cap:open:android
```

または手動で開く:
```bash
# Android Studioを起動し、android/ フォルダを開く
```

### 2. Gradleの同期

Android Studioが自動的にGradleの同期を開始します。完了するまで待ちます。

### 3. エミュレーターで実行

1. Android Studioの上部で **Device Manager** を開く
2. エミュレーターを作成（例: Pixel 7, Android 14）
3. **Run** ボタン (▶️) をクリック
4. アプリがエミュレーターで起動します

### 4. 実機で実行

1. Androidデバイスで **開発者オプション** を有効化:
   - 設定 → デバイス情報 → ビルド番号を7回タップ
2. **USBデバッグ** を有効化:
   - 設定 → システム → 開発者向けオプション → USBデバッグ
3. デバイスをPCに接続
4. Android Studioのデバイス選択で接続したデバイスを選択
5. **Run** ボタンをクリック

### 5. APK/AABのビルド

#### デバッグAPK（テスト用）
```bash
cd android
./gradlew assembleDebug
# 出力: android/app/build/outputs/apk/debug/app-debug.apk
```

#### リリースAAB（Google Play配布用）
```bash
cd android
./gradlew bundleRelease
# 出力: android/app/build/outputs/bundle/release/app-release.aab
```

> ⚠️ **注意**: リリースビルドには署名が必要です。`android/app/build.gradle` で署名設定を行ってください。

---

## アプリの更新

コードを変更した後:

1. Webアセットを再ビルド:
```bash
npm run build:mobile
```

2. ネイティブプロジェクトに同期:
```bash
npm run cap:sync
```

3. Xcode/Android Studioで再実行

---

## アイコンとスプラッシュスクリーンの設定

### アイコン

#### iOS
1. `ios/App/App/Assets.xcassets/AppIcon.appiconset/` にアイコン画像を配置
2. 必要なサイズ: 20x20, 29x29, 40x40, 60x60, 76x76, 83.5x83.5, 1024x1024 (@1x, @2x, @3x)

#### Android
1. `android/app/src/main/res/` の各 `mipmap-*` フォルダにアイコンを配置
2. 必要なサイズ: mdpi (48x48), hdpi (72x72), xhdpi (96x96), xxhdpi (144x144), xxxhdpi (192x192)

### スプラッシュスクリーン

Capacitorのスプラッシュスクリーンプラグインを使用:

```bash
npm install @capacitor/splash-screen
```

`capacitor.config.ts` に設定を追加:
```typescript
plugins: {
  SplashScreen: {
    launchShowDuration: 2000,
    backgroundColor: "#0f172a",
    showSpinner: false
  }
}
```

---

## トラブルシューティング

### iOS: CocoaPodsエラー

```bash
cd ios/App
pod install
```

### Android: Gradleビルドエラー

1. Android Studioで **File** → **Invalidate Caches / Restart**
2. `android/` フォルダを削除して再生成:
```bash
rm -rf android
npm run cap:sync
```

### 音声が再生されない

- iOS: `Info.plist` に音声権限を追加（通常は不要）
- Android: `AndroidManifest.xml` に音声権限を追加（通常は不要）

### VexFlowの描画が崩れる

- デバイスのピクセル密度が高い場合、Canvasのスケーリングを調整する必要がある場合があります
- `window.devicePixelRatio` を確認してください

---

## 参考リンク

- [Capacitor公式ドキュメント](https://capacitorjs.com/docs)
- [iOS開発ガイド](https://capacitorjs.com/docs/ios)
- [Android開発ガイド](https://capacitorjs.com/docs/android)
- [App Store配布ガイド](https://developer.apple.com/app-store/submissions/)
- [Google Play配布ガイド](https://developer.android.com/distribute)
