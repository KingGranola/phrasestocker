

import React, { useState } from 'react';
import { getAllChords } from '../services/chordLogic';
import clsx from 'clsx';
import { Music2 } from 'lucide-react';

interface ChordPaletteProps {
  currentKey: string; currentScale: 'major' | 'minor'; onChordClick: (symbol: string) => void;
  onKeyChange: (key: string) => void; onScaleChange: (scale: 'major' | 'minor') => void; keys: string[];
}
const ChordCard: React.FC<{ chord: string; degree?: string; onClick: () => void; }> = ({ chord, degree, onClick }) => {
    return (
        <div draggable onDragStart={(e) => e.dataTransfer.setData("text/plain", chord)} onClick={onClick} className="group relative w-20 h-16 bg-[var(--bg-sub)] rounded-lg cursor-grab active:cursor-grabbing flex flex-col justify-center items-center select-none hover:bg-[var(--accent)] hover:text-white transition-all duration-200 border border-transparent hover:border-[var(--accent)] hover:shadow-lg hover:-translate-y-1 active:scale-95 active:shadow-sm active:translate-y-0">
            <span className="font-bold text-sm tracking-tight">{chord}</span>
            {degree && <span className="text-[10px] font-mono mt-1 opacity-60 group-hover:opacity-100">{degree}</span>}
            <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-50 transition-opacity"><Music2 size={8} /></div>
        </div>
    );
};
const ChordPalette: React.FC<ChordPaletteProps> = ({ currentKey, currentScale, onChordClick, onKeyChange, onScaleChange, keys }) => {
  const categories = getAllChords(currentKey, currentScale);
  const [activeTab, setActiveTab] = useState(0);
  if (activeTab >= categories.length) setActiveTab(0);
  const activeCategory = categories[activeTab];
  const getDegreeLabel = (index: number) => {
      if (!activeCategory || !activeCategory.name.includes('ダイアトニック')) return undefined;
      const majorDegs = ["I","II","III","IV","V","VI","VII"];
      const minorDegs = ["i","ii","bIII","iv","v","bVI","bVII"];
      return currentScale === 'major' ? majorDegs[index] : minorDegs[index];
  };
  return (
    <div className="flex flex-col h-full bg-[var(--bg-panel)]">
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-color)]">
          <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-[var(--bg-body)] px-2 py-1 rounded border border-[var(--border-color)]"><span className="text-[10px] font-bold text-[var(--text-muted)]">KEY</span><select value={currentKey} onChange={(e) => onKeyChange(e.target.value)} className="bg-transparent text-xs font-bold outline-none cursor-pointer text-[var(--text-main)]">{keys.map(k => <option key={k} value={k}>{k}</option>)}</select></div>
              <div className="flex bg-[var(--bg-body)] p-0.5 rounded border border-[var(--border-color)]">
                  <button onClick={() => onScaleChange('major')} className={clsx("text-[10px] px-3 py-1 rounded font-bold transition-colors active:scale-95", currentScale === 'major' ? "bg-[var(--accent)] text-white shadow-sm" : "text-[var(--text-muted)] hover:text-[var(--text-main)]")}>Maj</button>
                  <button onClick={() => onScaleChange('minor')} className={clsx("text-[10px] px-3 py-1 rounded font-bold transition-colors active:scale-95", currentScale === 'minor' ? "bg-[var(--accent)] text-white shadow-sm" : "text-[var(--text-muted)] hover:text-[var(--text-main)]")}>Min</button>
              </div>
          </div>
          <div className="text-[10px] text-[var(--text-muted)]">Drag chords to score</div>
      </div>
      <div className="flex px-2 pt-2 gap-1 overflow-x-auto scrollbar-none border-b border-[var(--border-color)]">
         {categories.map((cat, idx) => (<button key={idx} onClick={() => setActiveTab(idx)} className={clsx("px-3 py-2 text-xs font-medium whitespace-nowrap rounded-t-md transition-colors border-t border-x border-transparent relative", activeTab === idx ? "bg-[var(--bg-body)] text-[var(--accent)] border-[var(--border-color)] border-b-[var(--bg-body)] -mb-[1px] z-10 font-bold" : "text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-hover)]")}>{cat.name}</button>))}
      </div>
      <div className="p-4 bg-[var(--bg-body)] flex-1 overflow-y-auto min-h-[100px]">
        <div className="flex flex-wrap gap-2">{activeCategory?.chords.map((chord, i) => (<ChordCard key={i} chord={chord} degree={getDegreeLabel(i)} onClick={() => onChordClick(chord)} />))}</div>
        <p className="mt-4 text-[10px] text-[var(--text-muted)] leading-relaxed border-l-2 border-[var(--accent)] pl-2">{activeCategory?.description}</p>
      </div>
    </div>
  );
};
export default ChordPalette;
