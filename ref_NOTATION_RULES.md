# 📐 楽譜記譜法ルール

ジャズフレーズ学習アプリでの入力チェック用ルール集

## 📚 参考文献

- [YAMAHA MUSIC PAL - 楽譜について学ぶ 第2日 音の形](https://jp.yamaha.com/services/music_pal/study/score/rest/index.html)
- ヤマハぷりんと楽譜 記譜ガイド

---

## 1. 音符と休符の基礎

### 単純音符・単純休符（付点なし）

| 名称 | 音符 | 休符 | 長さ（4/4拍子） | 説明 |
|------|------|------|-----------------|------|
| 全音符 | 𝅝 | 𝄻 | 4拍 | 1小節分 |
| 二分音符 | 𝅗𝅥 | 𝄼 | 2拍 | 半小節分 |
| 四分音符 | ♩ | 𝄽 | 1拍 | 基本単位 |
| 八分音符 | ♪ | 𝄾 | 0.5拍 | 四分音符の半分 |
| 十六分音符 | 𝅘𝅥𝅯 | 𝄿 | 0.25拍 | 四分音符の1/4 |
| 三十二分音符 | 𝅘𝅥𝅰 | - | 0.125拍 | 四分音符の1/8 |

### 付点音符・付点休符

**付点の効果：元の音符 + その半分の長さ = 1.5倍**

| 名称 | 記号 | 計算 | 長さ |
|------|------|------|------|
| 付点二分音符 | 𝅗𝅥. | 2拍 + 1拍 | 3拍 |
| 付点四分音符 | ♩. | 1拍 + 0.5拍 | 1.5拍 |
| 付点八分音符 | ♪. | 0.5拍 + 0.25拍 | 0.75拍 |

**複付点（付点が2つ）：元の音符 + 1/2 + 1/4 = 1.75倍**

---

## 2. 音符の構造と名称

```
      はた（符尾）
       ╱
      ┃  ← ぼう（符幹）
     ●  ← たま（符頭）
```

### 各部の役割

- **たま（符頭）**: 音の高さを示す（五線上の位置）
- **ぼう（符幹）**: 音符の長さを示す（二分音符以下）
- **はた（符尾）**: より短い音価を示す（八分音符以下）

---

## 3. 音符の正しい書き方

### A. ぼう（符幹）の向きルール

**基準：第3線（五線の真ん中の線）**

| 音符の位置 | ぼうの向き | たまの位置 | 図 |
|------------|------------|------------|-----|
| 第3線より**上** | **下向き** | ぼうの左 | `●╲` |
| 第3線より**下** | **上向き** | ぼうの右 | `╱●` |
| 第3線**上** | 上下どちらでも可 | 前後の流れで判断 | `●╲` or `╱●` |

```
五線の例：

E5 ━━━━●━━━━  第5線（上）→ ぼう下向き
             ╲
C5 ━━━━━━━━━  第4線

A4 ━━━━━━━━━  第3線（基準）→ どちらでも可

F4 ━━━━━━━━━  第2線
       ╱
D4 ━━━━●━━━━  第1線（下）→ ぼう上向き
```

### B. ぼうの長さ

- 基本は**1オクターブ分**（約8線分）
- 五線内に収まる場合：第1線～第5線の範囲
- 加線上の音符：五線内まで届く長さ

### C. 複数音符の向き決定

**和音や同時進行する声部がある場合**

1. **数の多い方**にぼうの向きを合わせる
2. バランスと視認性を優先
3. 全体の流れを考慮

```
例：C4, E4, G4, C5 の和音

C5 ●  ← 上声部（1音）：下向き
G4  ●╲
E4 ●
C4  ●╱ ← 下声部（3音）：上向きが優勢

→ 全体として上向きにする
```

---

## 4. 連桁（連こう／Beam）のルール

### 基本原則

**8分音符以上の短い音符を2つ以上つなぐ横線**

```
❌ 悪い例：
♪ ♪ ♪ ♪（連桁なし・読みにくい）

✅ 良い例：
♫ ♫（連桁でグループ化）
```

### 連桁の使用基準

#### 1. 拍の境界を明確にする

```
4/4拍子の場合：

✅ 正しい：
|♫ ♫|♫ ♫|
 1拍 2拍 3拍 4拍

❌ 間違い：
|♪♪♪♪|♪♪♪♪|
 拍の区切りが不明瞭
```

#### 2. グループ化の基準

- **1拍単位**でグループ化（基本）
- **2拍単位**も可（ゆっくりなテンポ）
- **拍をまたがない**

#### 3. 十六分音符の連桁

```
✅ 正しい（1拍ごと）：
|𝅘𝅥𝅮𝅘𝅥𝅮𝅘𝅥𝅮𝅘𝅥𝅮|𝅘𝅥𝅮𝅘𝅥𝅮𝅘𝅥𝅮𝅘𝅥𝅮|
 ￣￣￣￣  ￣￣￣￣
   1拍      2拍
```

#### 4. 混合リズムの連桁

```
✅ 八分音符と十六分音符の混合：
|♪𝅘𝅥𝅮𝅘𝅥𝅮|
 ￣￣￣
  1拍分
```

### 連桁の角度

- 基本は**水平**または**緩やかな傾斜**
- 音符の高さの変化に応じて調整
- 極端な角度は避ける

---

## 5. タイのルール

### タイとは

**同じ高さの2つ以上の音符を切らずに演奏する記号**

```
記号：⌢ または ⌣

♩⌢♩ = 2拍分の長さを切らずに
```

### タイを使う場面

#### A. 小節線をまたぐとき（必須）

```
4/4拍子で2拍目から次の小節へ：

|♩ ♩⌢|⌢♩ ♩|
  1 2   1 2
```

#### B. 拍子を明確にするため

```
4/4拍子で3拍分の音：

❌ 間違い：
|♩. 𝅗𝅥.|  （付点二分音符は使えない）

✅ 正しい：
|♩. ♩⌢♩|  （タイで3拍を表現）
  or
|𝅗𝅥⌢♩|
```

#### C. 表現できない長さを作る

```
5拍分の音：

|𝅝⌢|⌢♩ |
 4拍  +1拍
```

### タイとスラーの違い

| 項目 | タイ | スラー |
|------|------|--------|
| 音の高さ | **同じ** | **異なる** |
| 目的 | 音符をつなぐ | 滑らかに演奏 |
| 記号 | ⌢ | ⌢（同じ形） |
| 判別 | 音符の高さで判断 | 音符の高さで判断 |

```
タイ：♩⌢♩（C→C：同じ音）
      C4 C4

スラー：♩⌢♩（C→E：異なる音）
       C4 E4
```

---

## 6. 休符の表わし方

### 全休符の2つの意味

**1. 4拍分の休止**
```
4/4拍子：|𝄻| = 4拍休み
```

**2. 1小節すべての休止（拍子に関わらず）**
```
3/4拍子：|𝄻| = 3拍休み（1小節）
2/4拍子：|𝄻| = 2拍休み（1小節）
6/8拍子：|𝄻| = 6拍休み（1小節）
```

### 長い休止の表記

**複数小節の休止**

```
  6
￣￣￣ = 6小節休み

  10
￣￣￣￣ = 10小節休み
```

オーケストラやバンドのパート譜でよく使用

---

## 7. 拍子とバリデーション

### 拍子記号の構造

```
  4  ← 分子：1小節の拍数
  ─
  4  ← 分母：何分音符を1拍とするか
```

### 主な拍子

| 拍子記号 | 1小節の拍数 | 1拍の長さ | 用途 |
|----------|-------------|-----------|------|
| 4/4 | 4拍 | 四分音符 | 最も一般的 |
| 3/4 | 3拍 | 四分音符 | ワルツ |
| 2/4 | 2拍 | 四分音符 | マーチ |
| 6/8 | 6拍（2拍×3連） | 八分音符 | シャッフル |
| 5/4 | 5拍 | 四分音符 | 変則 |

### 小節内の拍数チェック

**最重要ルール：小節内の音符・休符の合計 = 拍子記号の分子**

#### 4/4拍子の例

```
✅ 正しい例：
|♩ ♩ 𝅗𝅥| = 1 + 1 + 2 = 4拍 ✓

❌ エラー例1（不足）：
|♩ ♩ ♩| = 1 + 1 + 1 = 3拍 ✗
→ エラー: 「1拍不足しています」

❌ エラー例2（超過）：
|𝅗𝅥 𝅗𝅥 ♩| = 2 + 2 + 1 = 5拍 ✗
→ エラー: 「1拍超過しています」

✅ 正しい例（付点音符）：
|♩. ♪ ♩ ♩| = 1.5 + 0.5 + 1 + 1 = 4拍 ✓
```

#### 3/4拍子の例

```
✅ 正しい：
|𝅗𝅥 ♩| = 2 + 1 = 3拍 ✓

❌ エラー：
|𝅝| = 4拍（3拍を超過）✗
```

---

## 8. 実装すべきエラーチェック

### Priority 1: 必須チェック

#### ❌ エラー1：小節内の拍数不一致

```javascript
// 検証ロジック
function validateMeasure(notes, timeSignature) {
  const [beatsPerMeasure, beatUnit] = timeSignature; // 例: [4, 4]
  
  // 音符の合計拍数を計算
  const totalBeats = notes.reduce((sum, note) => {
    return sum + note.duration;
  }, 0);
  
  if (totalBeats !== beatsPerMeasure) {
    if (totalBeats < beatsPerMeasure) {
      return {
        error: true,
        message: `${beatsPerMeasure - totalBeats}拍不足しています`,
        expected: beatsPerMeasure,
        actual: totalBeats
      };
    } else {
      return {
        error: true,
        message: `${totalBeats - beatsPerMeasure}拍超過しています`,
        expected: beatsPerMeasure,
        actual: totalBeats
      };
    }
  }
  
  return { error: false };
}
```

**エラーメッセージ例：**
- 「この小節は4拍必要ですが、現在3拍しかありません」
- 「この小節は4拍を超えています（現在5拍）」

#### ❌ エラー2：付点音符の計算ミス

```javascript
// 付点音符の長さ計算
function getDuration(noteType, dotted = false) {
  const baseDurations = {
    'w': 4,    // 全音符
    'h': 2,    // 二分音符
    'q': 1,    // 四分音符
    '8': 0.5,  // 八分音符
    '16': 0.25 // 十六分音符
  };
  
  const base = baseDurations[noteType];
  
  if (dotted) {
    return base * 1.5; // 付点は1.5倍
  }
  
  return base;
}
```

**チェック例：**
```javascript
// 4/4拍子
♩. + 𝅗𝅥 = 1.5 + 2 = 3.5拍
→ エラー: 「0.5拍不足」
```

#### ❌ エラー3：タイが必要なのに使われていない

```javascript
// 小節をまたぐ音符のチェック
function checkCrossingBarline(notes, measureIndex) {
  const lastNote = notes[measureIndex].slice(-1)[0];
  const firstNote = notes[measureIndex + 1]?.[0];
  
  if (lastNote && firstNote && 
      lastNote.pitch === firstNote.pitch &&
      !lastNote.hasTie) {
    return {
      warning: true,
      message: '小節をまたぐ同じ音にはタイが必要です'
    };
  }
}
```

### Priority 2: 推奨チェック（警告）

#### ⚠️ 警告1：ぼうの向きが不適切

```javascript
function checkStemDirection(note) {
  const middleLine = 3; // 第3線（B4）
  
  if (note.line > middleLine && note.stemDirection === 'up') {
    return {
      warning: true,
      message: '第3線より上の音符は、ぼうを下向きにすることを推奨します'
    };
  }
  
  if (note.line < middleLine && note.stemDirection === 'down') {
    return {
      warning: true,
      message: '第3線より下の音符は、ぼうを上向きにすることを推奨します'
    };
  }
  
  return { warning: false };
}
```

#### ⚠️ 警告2：連桁が長すぎる

```javascript
function checkBeamLength(beamedNotes) {
  if (beamedNotes.length > 8) {
    return {
      warning: true,
      message: '連桁が長すぎます。拍ごとに分割すると読みやすくなります'
    };
  }
}
```

#### ⚠️ 警告3：拍の境界が不明瞭

```javascript
function checkBeatCrossing(beamedNotes, beatPosition) {
  // 連桁が拍をまたいでいるかチェック
  const startBeat = Math.floor(beatPosition);
  const endBeat = Math.floor(beatPosition + getTotalDuration(beamedNotes));
  
  if (endBeat > startBeat) {
    return {
      warning: true,
      message: '拍の区切りで連桁を分けると、リズムがわかりやすくなります'
    };
  }
}
```

### Priority 3: 美化提案（情報）

#### 💡 提案1：より読みやすい記譜法

```javascript
// 例：全音符の代わりに2つの二分音符+タイを提案
function suggestBetterNotation(notes) {
  // 実装例
}
```

---

## 9. 実装サンプルコード

### 完全なバリデーション関数

```javascript
/**
 * 五線譜の音符配置をバリデーション
 */
function validateStaffNotation(staffNotes, timeSignature = [4, 4]) {
  const errors = [];
  const warnings = [];
  const suggestions = [];
  
  // 1. 小節ごとに分割
  const measures = splitIntoMeasures(staffNotes);
  
  measures.forEach((measure, index) => {
    // エラーチェック
    const beatCheck = validateMeasure(measure, timeSignature);
    if (beatCheck.error) {
      errors.push({
        measure: index + 1,
        ...beatCheck
      });
    }
    
    // 警告チェック
    measure.forEach((note, noteIndex) => {
      const stemCheck = checkStemDirection(note);
      if (stemCheck.warning) {
        warnings.push({
          measure: index + 1,
          note: noteIndex + 1,
          ...stemCheck
        });
      }
    });
  });
  
  return {
    valid: errors.length === 0,
    errors,
    warnings,
    suggestions
  };
}

/**
 * ユーザーにフィードバックを表示
 */
function showValidationFeedback(validation) {
  if (!validation.valid) {
    // エラーを表示（赤色）
    validation.errors.forEach(error => {
      showSnackbar(`❌ 第${error.measure}小節: ${error.message}`, 'error');
    });
  }
  
  if (validation.warnings.length > 0) {
    // 警告を表示（黄色）
    validation.warnings.forEach(warning => {
      showSnackbar(`⚠️ 第${warning.measure}小節: ${warning.message}`, 'warning');
    });
  }
  
  if (validation.suggestions.length > 0) {
    // 提案を表示（青色）
    validation.suggestions.forEach(suggestion => {
      showSnackbar(`💡 ${suggestion.message}`, 'info');
    });
  }
}
```

---

## 10. UI実装の推奨事項

### エラー表示のベストプラクティス

1. **即座のフィードバック**
   - 音符を配置した瞬間にチェック
   - リアルタイムで拍数を表示

2. **視覚的なハイライト**
   ```
   問題のある小節を赤く枠で囲む
   不足している拍数を視覚化
   ```

3. **修正の提案**
   ```
   「あと0.5拍必要です」
   → 「八分音符(♪)または八分休符を追加してください」
   ```

4. **段階的な学習**
   ```
   初心者モード：エラーのみ表示
   中級者モード：警告も表示
   上級者モード：提案も表示
   ```

### 現在の拍数表示（リアルタイム）

```
┌────────────────────────────┐
│ 現在の拍数: 3.5 / 4拍      │
│ [■■■■■■■  ]  あと0.5拍   │
└────────────────────────────┘
```

---

## 📊 チェックリスト

### 入力時の必須チェック

- [ ] 小節内の拍数が拍子記号と一致
- [ ] 付点音符の計算が正確
- [ ] タイが適切に使用されている
- [ ] 小節線をまたぐ音符にタイがある

### 推奨チェック（警告）

- [ ] ぼうの向きが適切
- [ ] 連桁が適切な長さ
- [ ] 拍の境界が明確
- [ ] 休符が適切に配置

### 美化提案（オプション）

- [ ] より読みやすい記譜法を提案
- [ ] 一般的な記譜慣習に従っている

---

## 🔗 参考リンク

- [YAMAHA MUSIC PAL - 楽譜について学ぶ](https://jp.yamaha.com/services/music_pal/study/score/rest/index.html)
- [ヤマハぷりんと楽譜 - 記譜ガイド](https://www.print-gakufu.com/guide/4003/)

---

*このドキュメントはジャズフレーズ学習アプリ v2.1 で作成されました。*

