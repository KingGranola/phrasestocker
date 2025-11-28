# PhraseStocker - プロジェクト構成ドキュメント

このドキュメントでは、アプリケーションを構成する全ファイルの役割と概要を説明します。

## 📂 ディレクトリ構造

```
/
├── index.html              # エントリーポイントHTML (Tailwind CSS読み込み、Global Style)
├── index.tsx               # Reactアプリケーションのエントリーポイント
├── App.tsx                 # メインコンポーネント (状態管理、レイアウト統合、ルーティング的役割)
├── types.ts                # TypeScript型定義 (ドメインモデル、State型)
├── constants.ts            # 定数定義 (楽器データ、初期値、設定値、理論定数)
├── metadata.json           # アプリケーションのメタデータ
│
├── components/             # UIコンポーネント
│   ├── ScoreCanvas.tsx     # 楽譜描画 (VexFlow) & インタラクション制御 (Core)
│   ├── Toolbar.tsx         # 編集ツールバー (音符入力、モード切替、編集操作)
│   └── ChordPalette.tsx    # コード理論パレット (キー/スケール設定、コード提案)
│
├── services/               # ビジネスロジック・計算処理
│   └── musicTheory.ts      # 音楽理論エンジン (コード生成、タブ譜計算、バリデーション、度数計算)
│
└── hooks/                  # カスタムHooks
    └── useAudio.ts         # 音声再生ロジック (Tone.jsラッパー)
```

---

## 📄 ファイル詳細解説

### 1. ルートファイル

- **`index.html`**
  - アプリの土台となるHTML。
  - `Tailwind CSS` のCDN読み込み。
  - カスタムスクロールバーなどのグローバルCSS定義。
  - `importmap` による依存ライブラリの解決。

- **`index.tsx`**
  - Reactの起動ファイル。
  - `App.tsx` をDOMの `#root` にマウントします。

- **`App.tsx`**
  - **役割**: アプリケーションの「司令塔」。
  - **主な責務**:
    - **全状態の一元管理**: `phrase` (楽曲データ), `inputMode` (操作モード), `isDarkMode` (テーマ) など。
    - **レイアウト構築**: ヘッダー、サイドバー（ライブラリ）、メインエリアの配置。
    - **イベントハンドリング**: キーボードショートカット、メニュー操作の受け口。
    - **データ永続化**: ローカルストレージへの保存・読み込み。
    - **通知**: バリデーションエラーのトースト表示。

- **`types.ts`**
  - **役割**: 型定義の集約。
  - **主な型**:
    - `Phrase`: 曲全体のデータ構造（小節、BPM、Key、Scale等）。
    - `NoteData`: 音符1つの詳細情報（音高、長さ、付点、タブ位置）。
    - `MeasureData`: 小節単位のデータ。
    - `InstrumentConfig`: 楽器（ギター/ベース）の物理的特性（弦、音域）。

- **`constants.ts`**
  - **役割**: アプリ全体で使う「変わらない値」。
  - **主な内容**:
    - `INSTRUMENTS`: 各弦のMIDIノート番号、移調設定。
    - `DURATION_VALUES`: 音価の計算用数値。
    - `KEYS`: 五度圏順に並べたキーリスト。
    - `INITIAL_PHRASE`: 新規作成時のテンプレート。

### 2. Components (UIパーツ)

- **`components/ScoreCanvas.tsx`**
  - **役割**: 五線譜とタブ譜の描画エンジン。
  - **技術**: `vexflow` ライブラリを使用。
  - **機能**:
    - `phrase` データを受け取り、SVGとしてリアルタイムレンダリング。
    - 五線譜とタブ譜の同期描画。
    - クリック（音符入力/選択）、ドラッグ（音程変更）の検知。
    - **視覚的フィードバック**: バリデーションエラー時の赤背景、選択音符のハイライト、ゴーストノート。
    - コード度数（Annotation）の描画。

- **`components/Toolbar.tsx`**
  - **役割**: 音符入力・編集のためのツール群。
  - **機能**:
    - 入力モード切替（Entry / Select / Tab-Edit）。
    - 音符の長さ（全音符〜16分音符）の選択（SVGアイコン）。
    - 修飾子（付点、休符）の切り替え。
    - 編集操作（Undo, Redo, Delete, Clear, Save）。
    - 再生コントロール。

- **`components/ChordPalette.tsx`**
  - **役割**: 音楽理論に基づくコード入力支援エリア。
  - **機能**:
    - **Key & Scale設定**: 楽曲の調とスケール（Major/Minor）を設定。
    - **コード提案**: 理論エンジンから取得したコード（ダイアトニック、セカンダリードミナント等）をカテゴリ別に表示。
    - ドラッグ&ドロップによるコード配置の起点。

### 3. Services (ロジック)

- **`services/musicTheory.ts`**
  - **役割**: アプリの「頭脳」。音楽理論計算を担当。
  - **主な関数**:
    - **`getAllChords(key, scale)`**: 指定されたキー・スケールで使えるコード群を動的に生成。
    - **`calculateTabPosition(pitch, instrument)`**: 五線譜の音高から最適なタブ譜（弦・フレット）を計算。
    - **`getValidTabPositions(...)`**: タブ編集モード用に、同じ音が出るポジションを全列挙。
    - **`validateMeasure(measure)`**: 小節内の拍数が正しいか判定。
    - **`getNoteDegree(note, chord)`**: 音符がコードに対して何度（3rd, 5th, b7等）にあたるかを計算。

### 4. Hooks (機能フック)

- **`hooks/useAudio.ts`**
  - **役割**: ブラウザでの音声再生機能の提供。
  - **技術**: `tone` (Tone.js) ライブラリを使用。
  - **機能**:
    - `phrase` データを解析し、タイムラインに沿って発音。
    - BPMの動的変更への追従。
    - 再生/停止の状態管理。
