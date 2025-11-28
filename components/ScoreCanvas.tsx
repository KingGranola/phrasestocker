
import React, { useEffect, useRef, useState } from 'react';
import * as Vex from 'vexflow';
import { MeasureData, Phrase, NoteDuration, InputMode } from '../types';
import { INSTRUMENTS, DURATION_VALUES } from '../constants';
import { getYToKey, keyToMidi, canAddNote, validateMeasure, isNoteInRange, getPitchFromVisual, getAccidentalsForContext } from '../services/musicTheory';
import { calculateTabPosition } from '../services/tabLogic';
import { getNoteDegree, isChordTone } from '../services/chordLogic';

interface ScoreCanvasProps {
  phrase: Phrase; width: number; selectedNoteId: string | null; inputMode: InputMode; activeDuration: NoteDuration;
  isDotted: boolean; isRest: boolean; activeTriplet?: boolean;
  onNoteClick: (noteId: string | null, source?: 'score' | 'tab', x?: number, y?: number) => void; 
  onCanvasClick: (measureIndex: number, pitch: string) => void;
  onNoteDrag: (noteId: string, newPitch: string) => void; 
  onChordDrop: (measureIndex: number, position: number, symbol: string) => void;
  onChordClick: (chordId: string) => void;
  onPreviewNote: (pitch: string) => void; 
  showDegrees: boolean;
  primaryColor: string; 
  secondaryColor: string; 
  errorColor: string;
}

interface NoteBBox { x: number; y: number; w: number; h: number; noteId: string; measureIndex: number; noteKey: string; type: 'score' | 'tab'; }
interface ChordBBox { x: number; y: number; w: number; h: number; chordId: string; }
interface StaveRegion { x: number; y: number; w: number; h: number; measureIndex: number; stave: Vex.Stave; topY: number; spacing: number; noteStartX: number; voiceWidth: number; }
interface GhostNoteState { x: number; y: number; pitch: string; noteName: string; visible: boolean; valid: boolean; reason?: string; }

const hexToRgba = (hex: string, alpha: number) => {
    const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? `rgba(${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}, ${alpha})` : hex;
};

const ScoreCanvas: React.FC<ScoreCanvasProps> = ({ 
    phrase, width, selectedNoteId, inputMode, activeDuration, isDotted, isRest, activeTriplet,
    onNoteClick, onCanvasClick, onNoteDrag, onChordDrop, onChordClick, onPreviewNote, showDegrees,
    primaryColor, secondaryColor, errorColor
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [noteBoxes, setNoteBoxes] = useState<NoteBBox[]>([]);
  const [chordBoxes, setChordBoxes] = useState<ChordBBox[]>([]);
  const [staveRegions, setStaveRegions] = useState<StaveRegion[]>([]);
  const [ghostNote, setGhostNote] = useState<GhostNoteState>({ x: 0, y: 0, pitch: '', noteName: '', visible: false, valid: true });
  const [draggingNote, setDraggingNote] = useState<{id: string, startY: number, startMidi: number} | null>(null);
  const [hoveredNoteId, setHoveredNoteId] = useState<string | null>(null);
  const lastPreviewPitch = useRef<string | null>(null);
  const SELECTION_COLOR = '#2E90FF';

  useEffect(() => {
    if (!containerRef.current) return;
    containerRef.current.innerHTML = '';
    const VF = Vex;
    const renderer = new VF.Renderer(containerRef.current, VF.Renderer.Backends.SVG);
    const height = 450; 
    renderer.resize(width, height);
    const context = renderer.getContext();
    context.setFont("Arial", 12, "bold"); 
    context.setFillStyle(primaryColor);
    context.setStrokeStyle(primaryColor);
    context.setBackgroundFillStyle(secondaryColor);

    let xPos = 10;
    const newNoteBoxes: NoteBBox[] = [];
    const newChordBoxes: ChordBBox[] = [];
    const newStaveRegions: StaveRegion[] = [];
    const scoreStaveY = 40;
    const tabStaveY = 180;
    const getAccidentalCount = (key: string) => { const counts: Record<string, number> = { 'C': 0, 'F': 1, 'Bb': 2, 'Eb': 3, 'Ab': 4, 'Db': 5, 'Gb': 6, 'G': 1, 'D': 2, 'A': 3, 'E': 4, 'B': 5 }; return counts[key] || 0; };
    const totalMeasures = phrase.measures.length;
    const firstMeasurePadding = 70 + (getAccidentalCount(phrase.keySignature) * 15);
    const availableWidth = width - 20 - firstMeasurePadding;
    const standardMeasureWidth = availableWidth / totalMeasures;
    let runningChordSymbol: string | null = null;

    phrase.measures.forEach((measure, measureIndex) => {
      const isFirst = measureIndex === 0;
      const measureWidth = isFirst ? standardMeasureWidth + firstMeasurePadding : standardMeasureWidth;
      const validation = validateMeasure(measure);
      if (validation.type === 'error') { context.save(); context.setFillStyle(errorColor); context.fillRect(xPos, scoreStaveY - 10, measureWidth, 100 + 10); context.restore(); }

      const stave = new VF.Stave(xPos, scoreStaveY, measureWidth);
      if (isFirst) { stave.addClef(INSTRUMENTS[phrase.instrument].clef); stave.addKeySignature(phrase.keySignature); stave.addTimeSignature(measure.timeSignature); }
      
      const tabStave = new VF.TabStave(xPos, tabStaveY, measureWidth);
      tabStave.setNumLines(phrase.instrument === 'guitar' ? 6 : 4);
      if (isFirst) { tabStave.addTabGlyph(); tabStave.addKeySignature(phrase.keySignature); tabStave.addTimeSignature(measure.timeSignature); }

      stave.setContext(context).draw();
      tabStave.setContext(context).draw();
      
      const finalNoteStartX = Math.max(stave.getNoteStartX(), tabStave.getNoteStartX());
      stave.setNoteStartX(finalNoteStartX);
      tabStave.setNoteStartX(finalNoteStartX);
      const noteStartX = finalNoteStartX;
      const voiceWidth = (stave.getX() + stave.getWidth()) - noteStartX - 10;

      context.save();
      context.setStrokeStyle(hexToRgba(primaryColor, 0.3));
      context.setLineWidth(1);
      for (let beat = 2; beat < 4; beat += 2) { const beatX = noteStartX + (beat / 4) * voiceWidth; context.setLineDash([2, 2]); context.beginPath(); context.moveTo(beatX, scoreStaveY - 25); context.lineTo(beatX, scoreStaveY); context.stroke(); }
      context.restore();

      newStaveRegions.push({ x: xPos, y: stave.getYForTopText(), w: measureWidth, h: stave.getHeight(), measureIndex, stave, topY: stave.getYForLine(0), spacing: stave.getSpacingBetweenLines(), noteStartX, voiceWidth });

      const notes: Vex.StaveNote[] = []; 
      const tabNotes: (Vex.TabNote | Vex.StaveNote)[] = [];
      const tuplets: Vex.Tuplet[] = [];
      const tabTuplets: Vex.Tuplet[] = [];
      const degreeLabels: { text: string, index: number, chordSymbol: string }[] = [];
      let currentBeat = 0; 
      let currentTupletNotes: Vex.StaveNote[] = [];
      let currentTabTupletNotes: (Vex.TabNote | Vex.StaveNote)[] = [];

      measure.notes.forEach((noteData, idx) => {
        let noteDurationVal = DURATION_VALUES[noteData.duration] * (noteData.dotted ? 1.5 : 1);
        if (noteData.tuplet) noteDurationVal *= (2/3);
        const displayAccidentals = getAccidentalsForContext(noteData.keys[0], phrase.keySignature);
        const vfNote = new VF.StaveNote({ keys: noteData.keys, duration: noteData.duration + (noteData.isRest ? 'r' : ''), clef: INSTRUMENTS[phrase.instrument].clef, autoStem: true });
        displayAccidentals.forEach((acc, idx) => vfNote.addModifier(new VF.Accidental(acc), idx));
        if (noteData.dotted) vfNote.addModifier(new VF.Dot());
        if (noteData.id === selectedNoteId) { 
            vfNote.setStyle({ fillStyle: SELECTION_COLOR, strokeStyle: SELECTION_COLOR }); 
            vfNote.addClass('selected'); 
        } else { 
            vfNote.setStyle({ fillStyle: primaryColor, strokeStyle: primaryColor }); 
        }
        
        if (showDegrees && !noteData.isRest) {
            const localChord = [...measure.chords].filter(c => c.position <= (currentBeat + 0.05)).sort((a, b) => b.position - a.position)[0];
            const activeChordSymbol = localChord ? localChord.symbol : runningChordSymbol;
            if (activeChordSymbol) { const degree = getNoteDegree(noteData.keys[0], activeChordSymbol, phrase.keySignature, noteData.accidentals); if (degree) degreeLabels.push({ text: degree, index: idx, chordSymbol: activeChordSymbol }); }
        }

        notes.push(vfNote);
        
        let tabNote: Vex.TabNote | Vex.StaveNote;
        if (noteData.isRest) {
             tabNote = new VF.StaveNote({ keys: ["b/4"], duration: noteData.duration + "r", clef: "treble" });
             if (noteData.dotted) tabNote.addModifier(new VF.Dot());
             tabNote.setStyle({ fillStyle: primaryColor, strokeStyle: primaryColor });
             tabNotes.push(tabNote);
        } else {
             let pos = { string: noteData.string, fret: noteData.fret };
             if (!pos.string || pos.fret === undefined) pos = calculateTabPosition(noteData.keys[0], phrase.instrument);
             tabNote = new VF.TabNote({ positions: [{ str: pos.string || 1, fret: pos.fret || 0 }], duration: noteData.duration, stemDirection: -1 });
             if (noteData.dotted) tabNote.addModifier(new VF.Dot());
             
             if (noteData.id === selectedNoteId) { 
                 tabNote.setStyle({ fillStyle: SELECTION_COLOR, strokeStyle: SELECTION_COLOR }); 
                 tabNote.addClass('selected');
             } else { 
                 tabNote.setStyle({ fillStyle: primaryColor, strokeStyle: primaryColor }); 
             }
             
             tabNotes.push(tabNote);
        }

        // --- 3連符の処理 ---
        if (noteData.tuplet) {
            currentTupletNotes.push(vfNote);
            currentTabTupletNotes.push(tabNote);
        }
        
        // 3連符グループの終了判定 (3音ごと、または連符の切れ目で区切る)
        const nextNote = measure.notes[idx + 1];
        const isGroupFull = currentTupletNotes.length === 3;
        const isEnd = !nextNote || !nextNote.tuplet;

        if (noteData.tuplet && (isEnd || isGroupFull)) { 
            if (currentTupletNotes.length > 0) { 
                // 五線譜用
                const tuplet = new VF.Tuplet(currentTupletNotes, {
                    numNotes: 3,
                    notesOccupied: 2,
                    ratioed: false, // "3" と表示
                    bracketed: true,
                });
                tuplets.push(tuplet); 

                // TAB譜用 (下側に表示)
                const tabTuplet = new VF.Tuplet(currentTabTupletNotes, {
                    numNotes: 3,
                    notesOccupied: 2,
                    ratioed: false, 
                    bracketed: true,
                    location: -1 // Bottom
                });
                tabTuplets.push(tabTuplet);
                
                currentTupletNotes = []; 
                currentTabTupletNotes = [];
            } 
        }

        currentBeat += noteDurationVal;
      });

      if (measure.chords.length > 0) { const lastChordInMeasure = [...measure.chords].sort((a, b) => b.position - a.position)[0]; runningChordSymbol = lastChordInMeasure.symbol; }

      if (notes.length > 0 && tabNotes.length > 0) {
          const voice = new VF.Voice({ numBeats: 4, beatValue: 4 });
          voice.setMode(VF.Voice.Mode.SOFT); voice.addTickables(notes);
          const tabVoice = new VF.Voice({ numBeats: 4, beatValue: 4 });
          tabVoice.setMode(VF.Voice.Mode.SOFT); tabVoice.addTickables(tabNotes);
          const formatter = new VF.Formatter();
          formatter.joinVoices([voice]); formatter.joinVoices([tabVoice]); formatter.format([voice, tabVoice], voiceWidth);
          
          const beams = VF.Beam.generateBeams(notes);
          voice.draw(context, stave);
          
          beams.forEach(b => { 
              const notesInBeam = b.getNotes();
              const hasSelected = notesInBeam.some(n => n.getAttribute('class')?.includes('selected'));
              const style = hasSelected ? SELECTION_COLOR : primaryColor;
              b.setStyle({ fillStyle: style, strokeStyle: style }); 
              b.setContext(context).draw(); 
          });
          
          // 3連符描画
          tuplets.forEach(t => t.setContext(context).draw());
          
          const stemmableTabNotes = tabNotes.filter(n => !n.isRest());
          const tabBeams = VF.Beam.generateBeams(stemmableTabNotes, { stemDirection: -1 });
          tabVoice.draw(context, tabStave);
          
          tabBeams.forEach(b => { 
              b.setStyle({ fillStyle: primaryColor, strokeStyle: primaryColor }); 
              b.setContext(context).draw(); 
          });
          
          // TAB譜の3連符描画
          tabTuplets.forEach(t => t.setContext(context).draw());

          if (showDegrees) {
              context.save(); context.setFont("bold 11px Arial");
              degreeLabels.forEach(item => {
                  const isTone = isChordTone(item.text, item.chordSymbol);
                  context.setFillStyle(isTone ? '#ef4444' : '#000000');
                  const note = notes[item.index];
                  const x = note.getAbsoluteX(); const y = stave.getYForLine(5) + 25; const textWidth = context.measureText(item.text).width;
                  context.fillText(item.text, x - (textWidth / 2) + 4, y);
              });
              context.restore();
          }

          notes.forEach((n, i) => { const bbox = n.getBoundingBox(); newNoteBoxes.push({ x: bbox.getX(), y: bbox.getY(), w: bbox.getW(), h: bbox.getH(), noteId: measure.notes[i].id, measureIndex, noteKey: measure.notes[i].keys[0], type: 'score' }); });
          tabNotes.forEach((n, i) => { 
              if (measure.notes[i].isRest) return;
              const noteData = measure.notes[i];
              const stringIndex = (noteData.string || 1) - 1; 
              const expectedY = tabStave.getYForLine(stringIndex);
              const centerX = n.getAbsoluteX();
              const hitWidth = 40; const hitHeight = 30;
              newNoteBoxes.push({ x: centerX - (hitWidth / 2), y: expectedY - (hitHeight / 2), w: hitWidth, h: hitHeight, noteId: measure.notes[i].id, measureIndex, noteKey: measure.notes[i].keys[0], type: 'tab' }); 
          });
      }

      measure.chords.forEach(chord => {
         const chordX = noteStartX + (chord.position / 4) * voiceWidth; const chordY = scoreStaveY - 5;
         context.save(); context.font = "bold 14px Arial"; context.fillStyle = primaryColor; context.fillText(chord.symbol, chordX + 5, chordY); context.restore();
         const textWidth = context.measureText(chord.symbol).width;
         newChordBoxes.push({ x: chordX - 2, y: chordY - 20, w: textWidth + 14, h: 30, chordId: chord.id });
      });
      xPos += measureWidth;
    });

    // Post-process SVG
    const svg = containerRef.current.querySelector('svg');
    if (svg) {
        svg.style.backgroundColor = secondaryColor;
        svg.querySelectorAll('path').forEach(p => {
             if (p.closest('.selected') || p.getAttribute('stroke') === SELECTION_COLOR || p.getAttribute('fill') === SELECTION_COLOR) return;
             const fill = p.getAttribute('fill');
             if ((fill && fill.toLowerCase() === SELECTION_COLOR.toLowerCase())) return;
             if (!p.getAttribute('stroke') || p.getAttribute('stroke') === 'none') { 
                 p.style.fill = primaryColor; 
             } else { 
                 p.style.stroke = primaryColor; 
                 p.style.fill = p.getAttribute('fill') === 'none' ? 'none' : primaryColor; 
             }
        });
        
        svg.querySelectorAll('text').forEach(t => {
            if (t.closest('.selected') || t.parentElement?.classList.contains('selected')) {
                t.style.fill = SELECTION_COLOR;
                t.style.fontWeight = 'bold';
                return;
            }
            const fill = t.getAttribute('fill');
            if (fill && fill.toLowerCase() === SELECTION_COLOR.toLowerCase()) return;
            if (fill && fill !== 'none' && fill !== '#000000' && fill !== 'black' && fill !== primaryColor && fill !== '#ef4444') return;
            if (fill === '#ef4444') return;
            t.style.fill = primaryColor;
        });
    }
    setNoteBoxes(newNoteBoxes); setChordBoxes(newChordBoxes); setStaveRegions(newStaveRegions);
  }, [phrase, width, selectedNoteId, inputMode, showDegrees, primaryColor, secondaryColor, errorColor]);

  const getEventPos = (e: React.MouseEvent | React.DragEvent) => { if (!containerRef.current) return { x: 0, y: 0 }; const rect = containerRef.current.getBoundingClientRect(); return { x: e.clientX - rect.left, y: e.clientY - rect.top }; };
  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); e.dataTransfer.dropEffect = "copy"; };
  const handleDrop = (e: React.DragEvent) => { e.preventDefault(); const symbol = e.dataTransfer.getData("text/plain"); if (!symbol) return; const { x } = getEventPos(e); const region = staveRegions.find(r => x >= r.x && x <= r.x + r.w); if (region) { const relativeX = Math.max(0, Math.min(region.voiceWidth, x - region.noteStartX)); const beats = (relativeX / region.voiceWidth) * 4; const snappedBeat = Math.round(beats * 4) / 4; onChordDrop(region.measureIndex, snappedBeat, symbol); } };
  
  const handleMouseDown = (e: React.MouseEvent) => {
      const { x, y } = getEventPos(e);
      const hitChord = chordBoxes.find(b => x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h);
      if (hitChord) { onChordClick(hitChord.chordId); e.stopPropagation(); return; }
      const hitNote = noteBoxes.find(b => x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h);
      if (hitNote) { onNoteClick(hitNote.noteId, hitNote.type, e.clientX, e.clientY); if (inputMode === 'entry' || inputMode === 'select') setDraggingNote({ id: hitNote.noteId, startY: y, startMidi: keyToMidi(hitNote.noteKey) }); e.stopPropagation(); return; }
      if (inputMode !== 'entry') { onNoteClick(null); }
      if (inputMode === 'entry') { const hitStave = staveRegions.find(s => x >= s.x && x <= s.x + s.w && y >= s.y && y <= s.y + 120); if (hitStave) { const relativeLine = (y - hitStave.topY) / hitStave.spacing; const snappedLine = Math.round(relativeLine * 2) / 2; const pitch = getYToKey(snappedLine, INSTRUMENTS[phrase.instrument].clef); onCanvasClick(hitStave.measureIndex, pitch); } }
  };
  
  const handleMouseMove = (e: React.MouseEvent) => {
      const { x, y } = getEventPos(e);
      
      if (containerRef.current) {
          containerRef.current.style.cursor = '';
      }

      if (draggingNote) {
          const diffY = draggingNote.startY - y; const steps = Math.round(diffY / 5);
          if (steps !== 0) { const bbox = noteBoxes.find(n => n.noteId === draggingNote.id); const staveRegion = staveRegions.find(s => s.measureIndex === bbox?.measureIndex); if (staveRegion) { const relativeLine = (y - staveRegion.topY) / staveRegion.spacing; const visualPitch = getYToKey(relativeLine, INSTRUMENTS[phrase.instrument].clef); if (visualPitch !== lastPreviewPitch.current) { onPreviewNote(visualPitch); lastPreviewPitch.current = visualPitch; } onNoteDrag(draggingNote.id, visualPitch); } }
          return;
      }
      if (inputMode === 'entry') {
          setHoveredNoteId(null);
          const hitStave = staveRegions.find(s => x >= s.x && x <= s.x + s.w && y >= s.y && y <= s.y + 120);
          if (hitStave) {
              let relativeLine = (y - hitStave.topY) / hitStave.spacing; let snappedLine = Math.round(relativeLine * 2) / 2; if (isRest) snappedLine = 2; const ghostY = hitStave.topY + (snappedLine * hitStave.spacing); const visualPitch = getYToKey(snappedLine, INSTRUMENTS[phrase.instrument].clef); const logicalPitch = isRest ? visualPitch : getPitchFromVisual(visualPitch, phrase.keySignature); const [noteName, octave] = logicalPitch.split('/'); const accidentals = getAccidentalsForContext(logicalPitch, phrase.keySignature); const accSymbol = accidentals.includes('#') ? '#' : accidentals.includes('b') ? 'b' : accidentals.includes('n') ? '♮' : ''; const measure = phrase.measures[hitStave.measureIndex]; const isTimeValid = canAddNote(measure, activeDuration, isDotted, activeTriplet); const isRangeValid = isRest ? true : isNoteInRange(logicalPitch, phrase.instrument); const isValid = isTimeValid && isRangeValid; const reason = !isRangeValid ? "Range" : !isTimeValid ? "Full" : "";
              
              setGhostNote({ x: x, y: ghostY, pitch: logicalPitch, noteName: isRest ? "REST" : `${noteName.toUpperCase()}${accSymbol}${octave}`, visible: true, valid: isValid, reason: reason });
          } else { setGhostNote(prev => ({ ...prev, visible: false })); lastPreviewPitch.current = null; }
      } else if (inputMode === 'eraser') {
          const hitNote = noteBoxes.find(b => x >= b.x - 5 && x <= b.x + b.w + 5 && y >= b.y - 10 && y <= b.y + b.h + 10);
          if (hitNote) setHoveredNoteId(hitNote.noteId);
          else setHoveredNoteId(null);
          setGhostNote(prev => ({ ...prev, visible: false }));
      } else {
        const hitNote = noteBoxes.find(b => x >= b.x - 5 && x <= b.x + b.w + 5 && y >= b.y - 10 && y <= b.y + b.h + 10);
        const hitChord = chordBoxes.some(b => x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h);
        
        if (hitNote) setHoveredNoteId(hitNote.noteId);
        else setHoveredNoteId(null);

        const hitNoteSelect = inputMode === 'select' && hitNote; 
        setGhostNote(prev => ({ ...prev, visible: false })); 
        lastPreviewPitch.current = null; 
        
        if (containerRef.current) {
            containerRef.current.style.cursor = (hitNoteSelect || hitChord) ? 'pointer' : '';
        }
      }
  };
  const handleMouseUp = () => setDraggingNote(null);
  
  const getCursorClass = () => {
    if (inputMode === 'entry') return 'cursor-pencil';
    if (inputMode === 'eraser') return 'cursor-eraser';
    if (inputMode === 'select') return 'cursor-select';
    return '';
  };

  return (
    <div className="relative" onDragOver={handleDragOver} onDrop={handleDrop} style={{ backgroundColor: secondaryColor }}>
        <div className="relative mx-auto" style={{ width: width, minHeight: '450px' }}>
            <div ref={containerRef} className={`overflow-hidden select-none ${getCursorClass()}`} style={{ width: '100%', height: '100%' }} onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={() => { handleMouseUp(); setGhostNote(prev => ({ ...prev, visible: false })); lastPreviewPitch.current = null; setHoveredNoteId(null); }} />
            
            {hoveredNoteId && (inputMode === 'select' || inputMode === 'eraser') && (
                (() => {
                    const box = noteBoxes.find(b => b.noteId === hoveredNoteId);
                    if (!box) return null;
                    return (
                        <div className="absolute border-2 pointer-events-none rounded transition-all duration-75 animate-pulse" 
                             style={{ 
                                left: box.x - 4, top: box.y - 4, width: box.w + 8, height: box.h + 8, 
                                borderColor: inputMode === 'eraser' ? '#ef4444' : SELECTION_COLOR, opacity: 0.8, borderRadius: '4px',
                                boxShadow: `0 0 8px ${inputMode === 'eraser' ? '#ef4444' : SELECTION_COLOR}`
                             }} 
                        />
                    );
                })()
            )}

            {ghostNote.visible && !draggingNote && (
                <div className="absolute pointer-events-none z-10 flex flex-col items-center gap-1" style={{ left: ghostNote.x, top: ghostNote.y, transform: 'translate(-50%, -50%)' }}>
                    {activeTriplet && (
                        <div className="flex items-center justify-center -mb-1">
                            <span className="text-[10px] font-bold border-b border-current leading-none px-1" style={{ color: primaryColor }}>3</span>
                        </div>
                    )}
                    <div className="flex items-center gap-2">
                        <div className={`w-4 h-3 rounded-[50%] ${isRest ? `bg-transparent border-2` : ghostNote.valid ? 'bg-current' : 'bg-transparent border-2 border-dashed'} opacity-60`} style={{ borderColor: primaryColor, color: primaryColor, backgroundColor: ghostNote.valid && !isRest ? primaryColor : 'transparent' }}>{isRest && <div className={`w-full h-[2px] absolute top-1/2 -translate-y-1/2 rotate-45`} style={{ backgroundColor: primaryColor }}></div>}</div>
                        <div className={`text-xs px-1 py-0.5 border font-mono`} style={{ backgroundColor: secondaryColor, color: primaryColor, borderColor: primaryColor }}>{ghostNote.noteName} {!ghostNote.valid && `(${ghostNote.reason})`}</div>
                    </div>
                </div>
            )}
        </div>
    </div>
  );
};
export default ScoreCanvas;
