# ジャズフレーズ自動生成ロジック仕様書 (Ver 2.0)

（統合ソース：『ツー・ファイブ・ジャズ・ライン』他、ベース・ギター教則本）

本ドキュメントは、ジャズのアドリブ・フレーズをアルゴリズムによって生成するための論理構造、ルールセット、パラメータ定義をまとめたものです。

-----

## 1. 基本データ定義 (Data Definitions)

フレーズ生成の基礎となる音楽理論要素の定義です。

### 1.1. コード・スケール マッピングテーブル

コードタイプと機能（Function）に基づき、使用可能なスケール（Available Scales）を定義します。

| コードタイプ | 機能 (Function) | 推奨スケール (Priority High $\to$ Low) | 構成音・特徴 | ソース |
| :--- | :--- | :--- | :--- | :--- |
| **Major 7** ($I\Delta7$) | Tonic | 1. Ionian (Major)<br>2. Lydian | [cite\_start]$1, 3, 5, 7$<br>Lydianは $\#4$ (アボイドなし) | [cite: 364, 301] |
| **Minor 7** ($IIm7$) | Sub-Dominant | 1. Dorian<br>2. Minor Pentatonic | [cite\_start]$1, b3, 5, b7$<br>Avoid: 6 (条件による) | [cite: 363, 511, 522] |
| **Dominant 7** ($V7$) | Dominant | 1. Mixolydian (基本)<br>2. Altered (緊張)<br>3. HMP5$\downarrow$ (解決感強)<br>4. Combination of Diminished<br>5. Whole Tone | [cite\_start]$1, 3, 5, b7$<br>Alt: $b9, \#9, \#11, b13$ | [cite: 363, 579, 587, 597, 605] |
| **Minor 7(b5)** | Sub-Dominant (Minor) | 1. Locrian<br>2. Locrian $\natural2$ (Aeolian $b5$) | [cite\_start]$1, b3, b5, b7$<br>Locrianは $b2$ がアボイド | [cite: 365, 523] |
| **Diminished 7** | Passing / Tonic | 1. Diminished (Whole-Half)<br>2. Chord Tones Only | [cite\_start]$1, b3, b5, bb7(6)$ | [cite: 730] |

### 1.2. ターゲット・ノート (Target Notes) 定義

フレーズの着地点となる音。小節の強拍（1拍目、3拍目）に配置することを推奨します。

  * **Primary Targets (Guide Tones):** コードの **3度 (3rd)** および **7度 (7th)**。コードの響きを決定づける最重要音。
  * **Secondary Targets (Chord Tones):** ルート (Root) および 5度 (5th)。安定感を与える。
  * **Tensions (Color Tones):** 9th, 11th, 13th (およびそのAlteration)。フレーズのトップノートやロングトーンで使用し、色彩を与える。

-----

## 2. フレーズ生成アルゴリズム (Generation Algorithm)

フレーズ生成は、「ターゲット設定」$\rightarrow$「アプローチ経路の決定」$\rightarrow$「装飾」の3段階で実行します。

### Step 1: ターゲット設定 (Targeting)

次のコードチェンジのタイミング（小節頭など）におけるターゲット音を決定します。

  * **ロジック:**
      * 現在のコードから次のコードへの連結（Voice Leading）が滑らかになる音を選択する。
      * **全音または半音で接続できる音**を優先する（例：$G7$の$F$(b7) $\to$ $C\Delta7$の$E$(3)）。
  * **判定基準:**
      * `Target_Note` = `Next_Chord.3rd` or `Next_Chord.7th` (優先度: 高)
      * `Target_Note` = `Next_Chord.Root` or `Next_Chord.5th` (優先度: 中)

### Step 2: パス・ファインディング (Pathfinding)

現在の音からターゲット音までの「埋め方」を決定します。以下の4つのメソッドをランダムまたは意図的に選択します。

#### (A) [cite\_start]アルペジオ・モード (Arpeggiator) [cite: 368]

  * **動作:** コードトーン（1-3-5-7）を跳躍進行で繋ぐ。
  * **拡張:** $V7$の場合、$b9$などのテンションを含めたアルペジオ（例: $3-5-b7-b9$）を使用可能。

#### (B) [cite\_start]スケール・モード (Linear Motion) [cite: 369]

  * **動作:** 指定されたスケール（例：ミクソリディアン）上を隣接音で上行または下行する。
  * **制約:** 強拍（1, 3拍目）にアボイドノート（Avoid Note）を配置しない。
      * *Avoid Note例:* $Ionian$の4度, $Mixolydian$の4度, $Dorian$の6度(文脈による)。

#### (C) [cite\_start]アルペジオ＋スケール複合 [cite: 370]

  * **パターン例:** 「1-3-5-7（上昇アルペジオ）」 $\to$ 「9-8-7-6（下降スケール）」のように、方向転換時に挙動を切り替える。

#### (D) [cite\_start]ターゲット・アプローチ [cite: 371]

  * **動作:** ターゲット音を挟み込む（Enclosure）動きを生成する。
  * **パターン:** `[Target + 1 scale step] -> [Target - 1 semitone] -> [Target]`

### Step 3: 装飾とリズム処理 (Embellishment & Rhythm)

#### [cite\_start]クロマチック・アプローチ (Chromatic Approach) [cite: 377, 378]

ターゲット音の直前に、半音下の音または半音上の音を挿入します。

  * **生成ルール:** `Note[i]` がターゲットの場合、`Note[i-1]` を `Note[i] - 1 (semitone)` に変更する。
  * **ダブル・クロマチック:** ターゲット音へ向かって半音2つ分進む（例: $G \to G\# \to A$）。

#### リズム・バリエーション

単調な8分音符の羅列を避けるための処理。

  * [cite\_start]**3連符化 (Tripletize):** 2拍分（4つの8分音符）を、3連符×2 または 3連符＋4分音符などのパターンに置換する [cite: 387]。
  * [cite\_start]**アンティシペーション (Anticipation):** フレーズの解決を半拍（または1拍）前に倒し、次の小節のコードを先取りする（シンコペーション）[cite: 452]。

-----

## 3. コード進行別 生成テンプレート

特定のコード進行パターンに対する専用ロジックです。

### 3.1. メジャー II-V-I ($IIm7 - V7 - I\Delta7$)

  * **$IIm7$ (例: Dm7):**
      * **Scale:** Dorian.
      * [cite\_start]**Start:** Rootから入るのが基本だが、3rdや5th、7thから入るパターンも用意 [cite: 373]。
  * **$V7$ (例: G7):**
      * **Scale Selection:**
          * [cite\_start]解決先が $I\Delta7$ (安定) $\to$ Mixolydian, Altered, HMP5$\downarrow$[cite: 579, 587].
          * [cite\_start]*アウト感を出したい場合:* Whole Tone, Diminished (半音-全音)[cite: 583, 597].
      * [cite\_start]**Substitution (代理コード):** 裏コード（$D^b7$）とみなし、Lydian b7スケールを適用するロジックを組み込む[cite: 394, 605].
  * **$I\Delta7$ (例: Cmaj7):**
      * **Scale:** Ionian.
      * **End:** ルートで終わらせず、9thやMaj7で終わらせると「浮遊感」が出る。

### 3.2. マイナー II-V-I ($IIm7^{(b5)} - V7 - Im7$)

  * **$IIm7^{(b5)}$ (例: Dm7(b5)):**
      * [cite\_start]**Scale:** Locrian \#2 (9thがナチュラルになる) が現代的で使いやすい [cite: 523]。通常のLocrianも可。
      * **Arpeggio:** $1 - b3 - b5 - b7$.
  * **$V7$ (例: G7alt):**
      * [cite\_start]**Constraint:** 解決先がマイナーコードのため、必ず $b9$ または $b13$ を含むスケール（Altered, HMP5$\downarrow$）を選択すること[cite: 588].

### 3.3. ブルース進行 (Jazz Blues)

  * **Logic:**
      * 各コード（$I7, IV7, V7$）に対して、対応する **Mixolydian** を適用するのが基本。
      * [cite\_start]**Blue Note:** 全体に「マイナーペンタトニック + $b5$ (Blue Note)」を適用する「Blues Scale」モードを用意する [cite: 385]。
      * [cite\_start]**Turnaround:** ラスト2小節（$I - VI - II - V$）は、循環コード用のフレーズ生成ロジックを適用する [cite: 402]。

-----

## 4. 楽器別パラメータ (Instrument Constraints)

生成エンジンに渡す楽器ごとの制約条件です。

### Bass (ベース)

  * **Range:** 低音域中心（E1〜G2程度）。
  * **Role:** ルートと5度を骨格にする。
  * [cite\_start]**Rhythm:** 4分音符（ウォーキング）が基本。ゴーストノートを混ぜる [cite: 51, 54, 55]。
  * [cite\_start]**Strong Beat Rule:** 1拍目は必ずコードトーン（特にRoot推奨）にする [cite: 363]。

### Guitar / Piano (コード楽器)

  * **Voicing:** コードトーンだけでなく、テンション（9, 11, 13）を含むボイシングを形成する。
  * [cite\_start]**Rhythm:** コンピング（Comping）パターンとして、裏拍を強調したリズムを生成する [cite: 219]。
  * **Top Note:** トップノートが滑らかにつながる（Voice Leading）ように構成音を選択する。

### Sax / Trumpet (ソロ楽器)

  * [cite\_start]**Range:** 楽器の「おいしい音域」を使う（例：アルトサックスなら実音Eb4〜Bb5あたり）[cite: 865, 1150]。
  * **Breath:** 継続して音を詰め込みすぎない。休符（ブレス）を入れるロジックを確率的に組み込む（例：8小節のうち2小節は休む、など）。
  * **Expression:** ベンドやグリッサンドなどのニュアンスは、特定の音（ブルーノートなど）に付与する。

-----

## 5. 実装用疑似コード (Pseudo-Code Example)

```python
def generate_phrase(current_chord, next_chord, num_beats):
    phrase = []
    current_note = select_start_note(current_chord)
    
    # 1. Target Selection
    target_note = select_guide_tone(next_chord) # 3rd or 7th
    
    # 2. Determine path
    steps = num_beats * 2 # Assuming 8th notes
    path_notes = []
    
    for i in range(steps - 1): # Generate up to just before target
        next_step_note = get_next_step(current_note, target_note, current_chord.scale)
        
        # Apply Chromatic Approach Logic at the end
        if i == steps - 2: 
            if is_chromatic_allowed(current_chord):
                next_step_note = get_chromatic_neighbor(target_note)
        
        path_notes.append(next_step_note)
        current_note = next_step_note
        
    # 3. Rhythmic Processing
    rhythm_pattern = apply_swing_feel(path_notes)
    
    return rhythm_pattern

def select_scale(chord):
    if chord.type == "Dominant7":
        if chord.is_minor_resolution:
            return "HMP5_Down" # or Altered
        else:
            return "Mixolydian"
    # ... other chord types
```

このドキュメントは、提供された資料に基づき、ジャズのアドリブ演奏における「暗黙知」を「形式知（ロジック）」へと変換したものです。
