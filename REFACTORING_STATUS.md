# PhraseStocker リファクタリング実装状況

## 実装済み項目

### ✅ Phase 1: 状態管理のリファクタリング

#### contexts/EditorContext.tsx
エディタの状態を一元管理するContextを作成しました。以下の機能を提供:
- フレーズの管理（phrase、updatePhrase）
- 音符選択状態の管理（selectedNoteId、selectedNote）
- 入力モード管理（inputMode）
- アクティブな音符設定（activeDuration、isDotted、isRest、isTriplet）
- UI状態（showDegrees）
- ヘルパーメソッド（updateSelectedNote、deleteNote、deleteChord、clearPhrase、newPhrase）

**メリット**:
- `App.tsx`から20個以上のstate変数を削除可能
- 状態ロジックの一元化により保守性向上
- `useEditor()` フックで簡潔なアクセス

#### contexts/LibraryContext.tsx
フレーズライブラリの管理を独立させました。以下の機能を提供:
- ライブラリの自動ロード・保存（LocalStorage連携）
- フレーズの保存・削除・検索
- `useLibrary()` フックで簡潔なアクセス

**メリット**:
- ライブラリ管理ロジックの分離
- LocalStorageとの連携を一箇所に集約
- エラーハンドリングの改善

---

### ✅ Phase 2: モーダルコンポーネントの分割（部分的）

#### components/modals/NotificationToast.tsx
通知トーストを独立コンポーネント化
- 3秒後の自動非表示
- 成功/情報タイプのスタイリング

#### components/modals/ConfirmationModal.tsx
確認ダイアログを独立コンポーネント化
- 汎用的な確認UI
- Cancel/Confirmアクション

#### components/modals/SavePhraseModal.tsx
フレーズ保存モーダルを独立コンポーネント化
- タグ選択機能
- バリデーション

#### components/modals/index.ts
モーダルの再エクスポート用ファイル

**メリット**:
- `Modals.tsx`（279行）の分割により保守性向上
- 各モーダルの独立したテスト・再利用が可能
- importが明確化

---

## 未実装項目（次のステップ）

### 🔲 Phase 2: 残りのモーダル分割
- [ ] HelpModal.tsx の個別ファイル化（210行+）
- [ ] Modals.tsx の削除

### 🔲 Phase 3: サービスレイヤーの最適化
- [ ] `services/tabLogic.ts` の `simpleKeyToMidi` 削除、`musicTheory.ts` から再利用
- [ ] 循環参照の完全解消
- [ ] JSDocコメントの追加

### 🔲 Phase 4:型定義の強化
- [ ] `types.ts` にユーティリティ型追加
- [ ] 型ガードの実装
- [ ] 厳密な型定義（any の削除）

### 🔲 Phase 5: App.tsx のリファクタリング
- [ ] EditorProviderとLibraryProviderでラップ
- [ ] 状態管理ロジックをContextに移行
- [ ] イベントハンドラーの簡素化

### 🔲 Phase 6: ScoreCanvas の分割
- [ ] ScoreRenderer.tsx（描画ロジック）
- [ ] ScoreInteraction.tsx（イベント処理）
- [ ] ScoreCanvas.tsx（統合）

### 🔲 Phase 7: パフォーマンス最適化
- [ ] useCallback/useMemo の適用
- [ ] React.memo の適用
- [ ] VexFlow再描画の最適化

### 🔲 Phase 8: エラーハンドリング
- [ ] ErrorBoundary コンポーネント
- [ ] エラーハンドリングユーティリティ

### 🔲 Phase 9: ドキュメンテーション
- [ ] JSDocコメント追加
- [ ] ARCHITECTURE.md作成
- [ ] README.md更新

---

## 今後の作業手順

1. **HelpModalの分離**
   ```bash
   # 既存のModals.tsxからHelpModalを抽出
   # components/modals/HelpModal.tsx として作成
   ```

2. **App.tsxのリファクタリング**
   ```tsx
   import { EditorProvider } from './contexts/EditorContext';
   import { LibraryProvider } from './contexts/LibraryContext';
   
   function App() {
     return (
       <EditorProvider>
         <LibraryProvider>
           {/* 既存のコンポーネント */}
         </LibraryProvider>
       </EditorProvider>
     );
   }
   ```

3. **個別コンポーネントでの利用**
   ```tsx
   import { useEditor } from '../contexts/EditorContext';
   import { useLibrary } from '../contexts/LibraryContext';
   
   function SomeComponent() {
     const { phrase, updatePhrase, selectedNote } = useEditor();
     const { library, savePhrase } = useLibrary();
     // ...
   }
   ```

4. **サービスレイヤー最適化**
   - `tabLogic.ts` から `simpleKeyToMidi` を削除
   - `musicTheory.ts` の `keyToMidi` をインポート

5. **段階的なテストとデバッグ**
   - 各フェーズ完了後に動作確認
   - 既存機能の regression テスト

---

## 期待される効果（再確認）

### コード品質
- **行数削減**: App.tsx が約200行から100行程度に削減予定
- **責務の明確化**: 各モジュールが単一の責務を持つ
- **再利用性向上**: Context、Hook、個別コンポーネントの再利用が容易

### 保守性
- **変更の局所化**: 状態管理変更時はContextのみを修正
- **テスタビリティ**: 各モジュールの独立したテストが可能
- **可読性**: ファイルサイズの縮小により、理解が容易

### 開発効率
- **並行開発**: 各モジュールが独立しているため、並行作業が可能
- **デバッグ**: エラー発生箇所の特定が容易
- **機能追加**: 新機能追加時の影響範囲が限定的

---

## 検証項目チェックリスト

### 機能テスト
- [ ] 音符の入力・編集・削除
- [ ] フレーズの保存・読み込み
- [ ] 再生機能
- [ ] キーボードショートカット
- [ ] タブ譜の自動生成・編集
- [ ] コード配置とドラッグ＆ドロップ
- [ ] エクスポート（MIDI、MusicXML）

### パフォーマンステスト
- [ ] 初期ロード時間
- [ ] 大量の音符入力時の動作
- [ ] 再描画のパフォーマンス

### 品質チェック
- [ ] TypeScriptコンパイルエラーなし
- [ ] コンソールエラー・警告なし
- [ ] ESLint警告なし
- [ ] 循環依存の解消

---

## 推奨される実装順序

1. ✅ **Context作成**（完了）
2. ✅ **モーダル分割**（部分完了）
3. 🔄 **App.tsx への適用**（次のステップ）
4. 🔄 **HelpModal分離**
5. 🔄 **サービスレイヤー最適化**
6. 🔄 **ScoreCanvas分割**
7. 🔄 **パフォーマンス最適化**
8. 🔄 **エラーハンドリング**
9. 🔄 **ドキュメンテーション**

---

## 注意事項

> [!WARNING]
> App.txへのContext適用は、アプリ全体の動作に影響する大きな変更です。
> 段階的にテストしながら進めることを推奨します。

> [!TIP]
> まずは小さなコンポーネント（例: Toolbar、Layout）でContext hookを使用してみて、動作を確認することをお勧めします。
