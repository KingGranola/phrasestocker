import React, { useState } from 'react';
import { X, BookOpen, MousePointer2, Layers, Keyboard, Lightbulb, Music, Zap, Grid, Eye, Wrench, Download, Edit2, FileMusic } from 'lucide-react';
import clsx from 'clsx';

export const HelpModal: React.FC<{ isOpen: boolean; onClose: () => void; }> = ({ isOpen, onClose }) => {
    const [activeTab, setActiveTab] = useState<'about' | 'guide' | 'theory' | 'shortcuts'>('about');
    if (!isOpen) return null;
    const TabButton = ({ id, icon: Icon, label }: { id: typeof activeTab, icon: any, label: string }) => (
        <button onClick={() => setActiveTab(id)} className={clsx("flex items-center gap-2 px-4 py-3 text-sm font-bold border-b-2 transition-colors", activeTab === id ? "border-[var(--accent)] text-[var(--accent)]" : "border-transparent text-[var(--text-muted)] hover:text-[var(--text-main)]")}><Icon size={16} />{label}</button>
    );
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-5xl h-[85vh] app-panel overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col">
                <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-color)] bg-[var(--bg-body)] shrink-0">
                    <div className="flex items-center gap-2"><BookOpen size={20} className="text-[var(--accent)]" /><span className="font-bold text-lg">PhraseStocker 取扱説明書</span><span className="text-xs text-[var(--text-muted)] bg-[var(--bg-sub)] px-2 py-0.5 rounded ml-2">v1.0</span></div>
                    <button onClick={onClose} className="hover:text-[var(--text-main)] text-[var(--text-muted)] transition-colors"><X size={20} /></button>
                </div>
                <div className="flex border-b border-[var(--border-color)] bg-[var(--bg-panel)] px-6 shrink-0 overflow-x-auto">
                    <TabButton id="about" icon={Lightbulb} label="はじめに" /><TabButton id="guide" icon={MousePointer2} label="操作ガイド" /><TabButton id="theory" icon={Layers} label="理論・機能" /><TabButton id="shortcuts" icon={Keyboard} label="ショートカット" />
                </div>
                <div className="flex-1 overflow-y-auto p-8 bg-[var(--bg-panel)] text-[var(--text-main)]">
                    {activeTab === 'about' && (
                        <div className="max-w-3xl mx-auto space-y-8">
                            <div className="text-center space-y-4 mb-10">
                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[var(--accent)] text-white shadow-lg mb-2"><Music size={32} /></div>
                                <h2 className="text-2xl font-bold">PhraseStocker へようこそ</h2>
                                <p className="text-[var(--text-muted)] leading-relaxed">PhraseStockerは、ジャズの即興演奏を学ぶギタリスト・ベーシストのための<br /><span className="text-[var(--text-main)] font-bold">「短いフレーズ（Lick）のストック・分析ツール」</span>です。<br />2小節以内の短いアイデアを、五線譜・TAB譜・コード理論と紐づけてメモしておくことができます。</p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="p-5 rounded-lg border border-[var(--border-color)] bg-[var(--bg-body)]">
                                    <h3 className="font-bold text-[var(--accent)] mb-2 flex items-center gap-2"><Edit2 size={16} />タブ譜と五線譜の同期</h3>
                                    <p className="text-sm text-[var(--text-muted)]">五線譜に入力すると、最適な運指（弦・フレット）を自動計算してタブ譜を生成します。</p>
                                </div>
                                <div className="p-5 rounded-lg border border-[var(--border-color)] bg-[var(--bg-body)]">
                                    <h3 className="font-bold text-[var(--accent)] mb-2 flex items-center gap-2"><Grid size={16} />コード理論の可視化</h3>
                                    <p className="text-sm text-[var(--text-muted)]">コード進行に対して、各音が「何度（Degree）」にあたるかをリアルタイム表示。コードトーンは赤色で強調されます。</p>
                                </div>
                            </div>
                            <div className="mt-8 border-t border-[var(--border-color)] pt-6">
                                <h3 className="font-bold text-[var(--text-main)] mb-3 flex items-center gap-2"><FileMusic size={16} /> 更新履歴</h3>
                                <ul className="space-y-2 text-sm text-[var(--text-muted)]">
                                    <li className="flex items-center"><span className="font-mono text-[var(--accent)] font-bold mr-3">v1.0</span><span>AI Phrase Generator (beta)追加、UI完全ダークモード化、ツールバー機能グループ再編成</span></li>
                                    <li className="flex items-center"><span className="font-mono text-[var(--accent)] font-bold mr-3">v0.9</span><span>コード編集機能強化、Chord Preview、ミキサーパネル拡張、Add9コード対応</span></li>
                                    <li className="flex items-center"><span className="font-mono text-[var(--accent)] font-bold mr-3">v0.8</span><span>マニュアル拡充、UI操作感の向上、ポインター表示の改善</span></li>
                                    <li className="flex items-center"><span className="font-mono text-[var(--accent)] font-bold mr-3">v0.7</span><span>リファクタリング、UIコンポーネント整理</span></li>
                                    <li className="flex items-center"><span className="font-mono text-[var(--accent)] font-bold mr-3">v0.6</span><span>小節数制限(1-2)、マニュアル拡充、全消去ボタン</span></li>
                                </ul>
                            </div>
                        </div>
                    )}
                    {activeTab === 'guide' && (
                        <div className="max-w-4xl mx-auto space-y-12">
                            {/* Input Section */}
                            <section className="space-y-4">
                                <h3 className="text-lg font-bold text-[var(--text-main)] border-b border-[var(--border-color)] pb-2 flex items-center gap-2"><Music size={18} /> 1. 基本：音符の入力 (Note Entry)</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-[var(--text-muted)]">
                                    <div>
                                        <p className="mb-2"><strong className="text-[var(--text-main)]">ステップ1: 入力モード開始</strong></p>
                                        <p className="mb-3">キーボードの <kbd className="bg-[var(--bg-sub)] px-1.5 py-0.5 rounded text-[var(--text-main)] font-mono">N</kbd> を押すか、ツールバーの音符アイコンをクリックします。カーソルが鉛筆アイコンに変わり、ゴーストノートが追従します。</p>

                                        <p className="mb-2"><strong className="text-[var(--text-main)]">ステップ2: 長さを決める</strong></p>
                                        <p className="mb-3">数字キーで音符の長さを選びます。<br />
                                            <kbd>1</kbd>: 全音符, <kbd>2</kbd>: 二分音符, <kbd>4</kbd>: 四分音符, <kbd>8</kbd>: 八分音符。<br />
                                            <kbd>.</kbd> キーで付点、<kbd>3</kbd> キーで3連符を切り替えます。</p>
                                    </div>
                                    <div>
                                        <p className="mb-2"><strong className="text-[var(--text-main)]">ステップ3: 配置</strong></p>
                                        <p className="mb-3">五線譜上の希望する高さをクリックして配置します。<br />
                                            <span className="text-[var(--accent)]">※ 小節の拍数を超える配置はできません（赤色で警告）。</span></p>

                                        <p className="mb-2"><strong className="text-[var(--text-main)]">休符の入力</strong></p>
                                        <p className="mb-3"><kbd>0</kbd> キーを押すと休符モードになります。その状態で譜面をクリックすると、選択中の長さの休符が配置されます。</p>

                                        <p className="mb-2"><strong className="text-[var(--text-main)]">Eraserモード</strong></p>
                                        <p>ツールバーの消しゴムアイコンをクリックすると、カーソルが消しゴムに変わり、クリックで音符を削除できます。</p>
                                    </div>
                                </div>
                            </section>

                            {/* Edit Section */}
                            <section className="space-y-4">
                                <h3 className="text-lg font-bold text-[var(--text-main)] border-b border-[var(--border-color)] pb-2 flex items-center gap-2"><MousePointer2 size={18} /> 2. 編集とTAB譜の調整 (Editing)</h3>
                                <div className="space-y-4 text-sm text-[var(--text-muted)]">
                                    <p>入力モードを終了するには <kbd>Esc</kbd> を押します。選択モードでは以下の操作が可能です。</p>

                                    <div className="bg-[var(--bg-body)] p-4 rounded-lg border border-[var(--border-color)] grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <strong className="block text-[var(--text-main)] mb-2">音程の変更</strong>
                                            <ul className="list-disc pl-5 space-y-1">
                                                <li>音符をクリックして選択し、<kbd>↑</kbd> <kbd>↓</kbd> キーで半音単位で移動。</li>
                                                <li>ドラッグ＆ドロップでも変更可能です。</li>
                                                <li>ツールバーの ♯ / ♭ ボタンで異名同音（F# ⇔ Gbなど）を変更できます。</li>
                                            </ul>
                                        </div>
                                        <div>
                                            <strong className="block text-[var(--accent)] mb-2">TAB譜（運指）の変更</strong>
                                            <p className="mb-2">同じ「ド」の音でも、ギターには複数のポジションがあります。</p>
                                            <ul className="list-disc pl-5 space-y-1">
                                                <li><kbd>Ctrl</kbd> + <kbd>↑</kbd> / <kbd>↓</kbd> : 音程を変えずに弦を変更。</li>
                                                <li><strong>TAB譜の数字を直接クリック</strong>: クリックするたびに、次の有効なポジションへ循環します。</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Workflow Example */}
                            <section className="space-y-4">
                                <h3 className="text-lg font-bold text-[var(--text-main)] border-b border-[var(--border-color)] pb-2 flex items-center gap-2"><Zap size={18} /> 3. 実践ワークフロー: II-V-I フレーズを作る</h3>
                                <div className="text-sm text-[var(--text-muted)] space-y-3">
                                    <ol className="list-decimal pl-5 space-y-2">
                                        <li><strong>キー設定:</strong> 画面下のコードパレットで KEY を <code>C</code> に設定します。</li>
                                        <li><strong>コード配置:</strong> パレットから <code>Dm7</code>, <code>G7</code>, <code>C△7</code> を譜面上の拍へドラッグ＆ドロップします。</li>
                                        <li><strong>スケール確認:</strong> <code>Dm7</code> の上で音符を入力する際、コードトーン（R, b3, 5, b7）を意識します。</li>
                                        <li><strong>入力:</strong> アルペジオやスケールを入力します。度数表示（赤文字）を見ながら、コードに合った音を選びます。</li>
                                        <li><strong>再生:</strong> <kbd>Space</kbd> キーで再生し、ボイスリーディング（伴奏の滑らかさ）を確認します。</li>
                                        <li><strong>保存:</strong> <code>Save</code> ボタンでライブラリに保存します。</li>
                                    </ol>
                                </div>
                            </section>

                            {/* AI Phrase Generator */}
                            <section className="space-y-4">
                                <h3 className="text-lg font-bold text-[var(--text-main)] border-b border-[var(--border-color)] pb-2 flex items-center gap-2"><Zap size={18} className="text-purple-500" /> 4. AI Phrase Generator (beta)</h3>
                                <div className="text-sm text-[var(--text-muted)] space-y-3">
                                    <p className="bg-purple-500/10 border-l-4 border-purple-500 pl-3 py-2">ツールバー右端の紫色の杖アイコンから、AIによる自動フレーズ生成機能を利用できます。<span className="text-[var(--text-main)] font-bold ml-2">(ベータ版)</span></p>
                                    <div className="bg-[var(--bg-body)] p-4 rounded-lg border border-[var(--border-color)]">
                                        <h4 class Name="font-bold text-[var(--text-main)] mb-2">使い方</h4>
                                        <ol className="list-decimal pl-5 space-y-2">
                                            <li><strong>Note Density:</strong> Low/Medium/Highから音符の密度を選択</li>
                                            <li><strong>Style:</strong> スライダーでBebop（伝統的）→ Modern → Contemporary（現代的）を調整</li>
                                            <li><strong>Target:</strong> 全小節に適用</li>
                                            <li><strong>Generate Phrase:</strong> ボタンを押して生成</li>
                                        </ol>
                                        <p className="mt-3 text-xs italic text-[var(--text-muted)]">※ ベータ版のため、生成されるフレーズは必ずしも完璧ではありません。生成後に手動で調整してください。</p>
                                    </div>
                                </div>
                            </section>

                            {/* Mixer & Metronome */}
                            <section className="space-y-4">
                                <h3 className="text-lg font-bold text-[var(--text-main)] border-b border-[var(--border-color)] pb-2 flex items-center gap-2"><Music size={18} /> 5. Mixer & Metronome</h3>
                                <div className="text-sm text-[var(--text-muted)] space-y-3">
                                    <p>再生コントロール横のスライダーアイコンをクリックすると、詳細な音声設定パネルが開きます。</p>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="bg-[var(--bg-body)] p-4 rounded-lg border border-[var(--border-color)]">
                                            <h4 className="font-bold text-[var(--text-main)] mb-2">Volume Control</h4>
                                            <ul className="space-y-1 text-xs">
                                                <li>• <strong>Melody Vol:</strong> メロディの音量</li>
                                                <li>• <strong>Chords Vol:</strong> 伴奏の音量</li>
                                                <li>• <strong>Metronome Vol:</strong> メトロノームの音量</li>
                                            </ul>
                                        </div>
                                        <div className="bg-[var(--bg-body)] p-4 rounded-lg border border-[var(--border-color)]">
                                            <h4 className="font-bold text-[var(--text-main)] mb-2">Metronome Settings</h4>
                                            <ul className="space-y-1 text-xs">
                                                <li>• <strong>Sound:</strong> Click/Kick/Beep</li>
                                                <li>• <strong>Pattern:</strong> All Beats (1-2-3-4) または Jazz (2 & 4)</li>
                                                <li>• ON/OFFスイッチで切り替え</li>
                                            </ul>
                                        </div>
                                    </div>
                                    <div className="bg-[var(--bg-sub)] p-4 rounded-lg border border-[var(--border-color)]">
                                        <h4 className="font-bold text-[var(--accent)] mb-2">Piano Voicing</h4>
                                        <ul className="space-y-2 text-xs">
                                            <li><strong>Standard:</strong> Root + 3 + 5 + 9 の基本形</li>
                                            <li><strong>Closed:</strong> シンプルな密集配置</li>
                                            <li><strong>Shell:</strong> ジャズピアノ左手風（Root + 3 + 7）</li>
                                            <li><strong>Drop 2:</strong> ギター向け転回形</li>
                                            <li><strong>Rootless:</strong> Bill Evans風ルートレスボイシング</li>
                                        </ul>
                                    </div>
                                </div>
                            </section>

                            {/* Import/Export */}
                            <section className="space-y-4">
                                <h3 className="text-lg font-bold text-[var(--text-main)] border-b border-[var(--border-color)] pb-2 flex items-center gap-2"><Download size={18} /> 6. Import/Export</h3>
                                <div className="text-sm text-[var(--text-muted)] space-y-3">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="bg-[var(--bg-body)] p-4 rounded-lg border border-[var(--border-color)]">
                                            <h4 className="font-bold text-[var(--text-main)] mb-2">Import JSON</h4>
                                            <p className="text-xs">保存したライブラリファイル（JSON）を読み込んで復元します。複数デバイス間でのデータ同期に便利です。</p>
                                        </div>
                                        <div className="bg-[var(--bg-body)] p-4 rounded-lg border border-[var(--border-color)]">
                                            <h4 className="font-bold text-[var(--text-main)] mb-2">Export MIDI</h4>
                                            <p className="text-xs">DAW（Logic Pro, Ableton等）で使用できるMIDIファイルとしてエクスポートします。</p>
                                        </div>
                                        <div className="bg-[var(--bg-body)] p-4 rounded-lg border border-[var(--border-color)]">
                                            <h4 className="font-bold text-[var(--text-main)] mb-2">Export MusicXML</h4>
                                            <p className="text-xs">MuseScore、Finale等の楽譜ソフトで開けるMusicXML形式でエクスポートします。</p>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Chord Editing */}
                            <section className="space-y-4">
                                <h3 className="text-lg font-bold text-[var(--text-main)] border-b border-[var(--border-color)] pb-2 flex items-center gap-2"><Edit2 size={18} /> 7. Chord Editing</h3>
                                <div className="text-sm text-[var(--text-muted)] space-y-3">
                                    <p>譜面上のコードシンボルをクリックすると、コード編集パネルが開きます。</p>
                                    <div className="bg-[var(--bg-body)] p-4 rounded-lg border border-[var(--border-color)]">
                                        <ul className="space-y-2">
                                            <li><strong>Root:</strong> コードのルート音（C, D, Eb等）</li>
                                            <li><strong>Quality:</strong> コードの性質（Maj, m, 7, m7, maj7, dim等）</li>
                                            <li><strong>Tensions:</strong> テンション（b9, 9, #9, 11, #11, b13, 13）を複数選択可能</li>
                                            <li><strong>Bass:</strong> 分数コードのベース音（/G等）</li>
                                            <li><strong>Preview:</strong> スピーカーアイコンで編集中のコードを試聴</li>
                                        </ul>
                                    </div>
                                </div>
                            </section>

                            {/* Troubleshooting */}
                            <section className="space-y-4">
                                <h3 className="text-lg font-bold text-[var(--text-main)] border-b border-[var(--border-color)] pb-2 flex items-center gap-2"><Wrench size={18} /> 8. トラブルシューティング & データ管理</h3>
                                <div className="space-y-4 text-sm text-[var(--text-muted)]">
                                    <div>
                                        <h4 className="font-bold text-[var(--text-main)] mb-1">Q. 音が出ない</h4>
                                        <p>A. ブラウザの制限により、最初のクリック操作まで音声が無効化されることがあります。再生ボタンを一度クリックしてください。音量はミキサーアイコン（スライダー）で確認できます。</p>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-[var(--text-main)] mb-1">Q. TAB譜が選択できない</h4>
                                        <p>A. TAB譜の数字をクリックする際は、数字の中心付近を狙ってください。選択されると数字が青色になります。選択できない場合、一度 <code>Esc</code> を押して選択モードになっているか確認してください。</p>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-[var(--text-main)] mb-1">Q. データのエクスポート</h4>
                                        <p>A. ツールバー右側の <Download size={14} className="inline" /> アイコンから、MIDIまたはMusicXML形式でダウンロードできます。MusicXMLはMuseScore等の楽譜ソフトで開くことができます。</p>
                                    </div>
                                </div>
                            </section>
                        </div>
                    )}
                    {activeTab === 'theory' && (
                        <div className="max-w-4xl mx-auto space-y-10">
                            <section>
                                <h3 className="text-lg font-bold text-[var(--text-main)] mb-4 flex items-center gap-2"><Grid size={20} className="text-[var(--accent)]" /> コードパレット活用術</h3>
                                <div className="p-5 bg-[var(--bg-body)] border border-[var(--border-color)] rounded-lg text-sm leading-relaxed text-[var(--text-muted)]">
                                    <p className="mb-4">画面下部のコードパレットは、単なるボタンではありません。現在設定されている <strong>KEY</strong> と <strong>SCALE</strong> に基づいて、理論的に使用可能なコードを動的に提案します。</p>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <h4 className="font-bold text-[var(--text-main)] mb-2">Major Scale (長調) の場合</h4>
                                            <ul className="space-y-2">
                                                <li><span className="text-[var(--accent)] font-bold">ダイアトニック:</span> 基本の7コード。迷ったらこれを使います。</li>
                                                <li><span className="text-[var(--text-main)] font-bold">セカンダリー:</span> 一時的な緊張感を作るドミナント (例: A7 → Dm7)。</li>
                                                <li><span className="text-[var(--text-main)] font-bold">裏コード (Sub V):</span> 半音下行で解決するジャズらしいコード。</li>
                                            </ul>
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-[var(--text-main)] mb-2">Minor Scale (短調) の場合</h4>
                                            <ul className="space-y-2">
                                                <li>マイナーキーは複雑ですが、このアプリでは「自然的・和声的・旋律的短音階」を統合して、よく使われるコードを提案します。</li>
                                                <li><code>Im6</code> や <code>Im(maj7)</code> など、トニックマイナーの代理コードも充実しています。</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            <section>
                                <h3 className="text-lg font-bold text-[var(--text-main)] mb-4 flex items-center gap-2"><Eye size={20} className="text-[var(--accent)]" /> 度数 (Degree) 表示の見方</h3>
                                <div className="space-y-4 text-sm text-[var(--text-muted)]">
                                    <p>ツールバーの「目のアイコン」をONにすると、音符の下に度数が表示されます。これはアドリブ学習において最も重要な機能です。</p>
                                    <div className="flex flex-col sm:flex-row gap-6 items-center justify-center p-6 bg-[var(--bg-sub)] rounded-lg border border-[var(--border-color)]">
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-red-500 mb-1">R, 3, 5, 7</div>
                                            <div className="text-xs font-bold text-[var(--text-main)]">コードトーン (赤色)</div>
                                            <p className="text-[10px] mt-1 max-w-[150px]">和音の骨格となる音。フレーズの解決先として最適です。</p>
                                        </div>
                                        <div className="h-px w-full sm:w-px sm:h-16 bg-[var(--border-color)]"></div>
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-[var(--text-main)] mb-1">9, 11, 13</div>
                                            <div className="text-xs font-bold text-[var(--text-main)]">テンション (黒色)</div>
                                            <p className="text-[10px] mt-1 max-w-[150px]">彩りを加える音。次のコードトーンへ解決させると美しいです。</p>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            <section>
                                <h3 className="text-lg font-bold text-[var(--text-main)] mb-4 flex items-center gap-2"><Zap size={20} className="text-[var(--accent)]" /> 自動ボイスリーディング</h3>
                                <div className="p-4 bg-[var(--bg-body)] border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-muted)]">
                                    <p>再生時、コードの伴奏は「前のコードの構成音」を参照して、指の移動が最小になる転回形を自動的に選択します。これにより、プロのピアニストのような滑らかなバッキングが生成されます。</p>
                                    <p className="mt-2 text-xs italic text-[var(--text-muted)]">※ Voicing設定（ミキサーパネル）が「Closed」または「Rootless」の場合に有効です。</p>
                                </div>
                            </section>
                        </div>
                    )}
                    {activeTab === 'shortcuts' && (
                        <div className="max-w-3xl mx-auto space-y-6">
                            <div className="border border-[var(--border-color)] rounded-lg overflow-hidden text-sm">
                                <table className="w-full text-left">
                                    <thead className="bg-[var(--bg-sub)] text-[var(--text-muted)] font-bold"><tr><th className="p-3 pl-4">キー</th><th className="p-3">機能</th></tr></thead>
                                    <tbody className="divide-y divide-[var(--border-color)] text-[var(--text-main)]">
                                        <tr className="bg-[var(--bg-body)]"><td colSpan={2} className="p-2 pl-4 text-xs font-bold text-[var(--accent)]">入力モード</td></tr>
                                        <tr><td className="p-3 pl-4 font-mono text-[var(--accent)] font-bold">N</td><td className="p-3">音符入力モード 切替</td></tr>
                                        <tr><td className="p-3 pl-4 font-mono text-[var(--accent)] font-bold">Esc</td><td className="p-3">選択モードへ戻る / 選択解除</td></tr>
                                        <tr><td className="p-3 pl-4 font-mono">E</td><td className="p-3">Eraserモード 切替</td></tr>

                                        <tr className="bg-[var(--bg-body)]"><td colSpan={2} className="p-2 pl-4 text-xs font-bold text-[var(--accent)]">音符プロパティ</td></tr>
                                        <tr><td className="p-3 pl-4 font-mono">1 - 8</td><td className="p-3">音価選択 (1:全, 2:二, 4:四, 8:八, 6:16分)</td></tr>
                                        <tr><td className="p-3 pl-4 font-mono">. (ドット)</td><td className="p-3">付点 ON/OFF</td></tr>
                                        <tr><td className="p-3 pl-4 font-mono">3</td><td className="p-3">3連符モード ON/OFF</td></tr>
                                        <tr><td className="p-3 pl-4 font-mono">0</td><td className="p-3">休符モード ON/OFF</td></tr>

                                        <tr className="bg-[var(--bg-body)]"><td colSpan={2} className="p-2 pl-4 text-xs font-bold text-[var(--accent)]">編集</td></tr>
                                        <tr><td className="p-3 pl-4 font-mono">↑ / ↓</td><td className="p-3">選択中の音符を半音上下に移動</td></tr>
                                        <tr><td className="p-3 pl-4 font-mono">Ctrl + ↑ / ↓</td><td className="p-3">TAB譜の弦を変更（音程維持）</td></tr>
                                        <tr><td className="p-3 pl-4 font-mono">Delete / Backspace</td><td className="p-3">選択中の音符を削除</td></tr>

                                        <tr className="bg-[var(--bg-body)]"><td colSpan={2} className="p-2 pl-4 text-xs font-bold text-[var(--accent)]">再生</td></tr>
                                        <tr><td className="p-3 pl-4 font-mono text-[var(--accent)] font-bold">Space</td><td className="p-3">再生 / 停止</td></tr>
                                    </tbody>
                                </table>
                            </div>
                            <p className="text-xs text-[var(--text-muted)] text-center">※ 一部のショートカットは入力モード中のみ有効です</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};