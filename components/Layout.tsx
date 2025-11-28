
import React, { useRef } from 'react';
import { Phrase } from '../types';
import { Music, Search, Plus, HelpCircle, Menu, Pencil, Grid, Eye, X, Trash2 } from 'lucide-react';
import clsx from 'clsx';
import Toolbar from './Toolbar';

interface SidebarProps {
    sidebarOpen: boolean;
    setSidebarOpen: (open: boolean) => void;
    searchQuery: string;
    setSearchQuery: (q: string) => void;
    handleNewPhrase: () => void;
    library: Phrase[];
    currentPhraseId: string;
    onSelectPhrase: (p: Phrase) => void;
    onDeletePhrase: (id: string) => void;
    onOpenHelp: () => void;
}

const SidebarItem: React.FC<{ phrase: Phrase; currentId: string; onDelete: (id: string) => void }> = ({ phrase, currentId, onDelete }) => {
    const isActive = phrase.id === currentId;
    return (
        <div className={clsx("group relative p-3 cursor-pointer text-sm rounded-md transition-all duration-200 border border-transparent hover:-translate-y-0.5", isActive ? "bg-[var(--accent)] text-[var(--accent-text)] shadow-md" : "text-[var(--text-main)] hover:bg-[var(--bg-sub)] hover:shadow-sm")}>
            <div className="flex justify-between items-center mb-1"><span className="truncate font-semibold tracking-tight">{phrase.name}</span><button onClick={(e) => { e.stopPropagation(); onDelete(phrase.id); }} className={clsx("p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity active:scale-95", isActive ? "hover:bg-white/20 text-white" : "hover:bg-[var(--danger)] hover:text-white text-[var(--text-muted)]")} title="Delete"><Trash2 size={12} /></button></div>
            <div className="flex justify-between items-end"><div className={clsx("flex gap-2 text-[10px] font-mono", isActive ? "text-white/80" : "text-[var(--text-muted)]")}><span>{phrase.keySignature} {phrase.scale === 'major' ? 'Maj' : 'Min'}</span><span>{phrase.bpm} BPM</span></div>{phrase.tags && phrase.tags.length > 0 && (<div className="flex gap-1">{phrase.tags.slice(0, 2).map(tag => (<span key={tag} className={clsx("text-[9px] px-1.5 py-0.5 rounded-full bg-black/10")}>{tag}</span>))}</div>)}</div>
        </div>
    );
};

export const Sidebar: React.FC<SidebarProps> = ({ sidebarOpen, setSidebarOpen, searchQuery, setSearchQuery, handleNewPhrase, library, currentPhraseId, onSelectPhrase, onDeletePhrase, onOpenHelp }) => (
    <>
    <aside className={clsx("fixed inset-y-0 left-0 w-72 flex flex-col shrink-0 border-r border-[var(--border-color)] bg-[var(--bg-panel)] z-40 transition-transform duration-300 lg:relative lg:translate-x-0", sidebarOpen ? "translate-x-0 shadow-2xl lg:shadow-none" : "-translate-x-full")}>
        <div className="h-14 shrink-0 flex items-center justify-between px-4 border-b border-[var(--border-color)] bg-[var(--bg-body)]">
            <div className="flex items-center gap-2 font-bold text-[var(--accent)] text-lg"><Music size={24} strokeWidth={2.5} /><span className="text-[var(--text-main)] tracking-tight">PhraseStocker</span></div>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-[var(--text-muted)] active:scale-95"><X size={20} /></button>
        </div>
        <div className="p-4 space-y-3 border-b border-[var(--border-color)] bg-[var(--bg-panel)]">
             <div className="relative group"><Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-[var(--accent)] transition-colors" /><input type="text" placeholder="Search phrases..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full pl-9 pr-3 py-2 text-sm app-input rounded-full bg-[var(--bg-body)]" /></div>
             <div className="flex gap-2"><button onClick={handleNewPhrase} className="app-btn bg-[var(--bg-body)] border border-[var(--border-color)] w-full py-2 text-xs font-bold gap-2 hover:border-[var(--text-main)] active:scale-95 transition-transform"><Plus size={14} /> New File</button></div>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-1 scrollbar-thin">
            <div className="text-[10px] font-bold text-[var(--text-muted)] uppercase px-2 mb-2 tracking-wider">Your Library</div>
            {library.length === 0 ? (<div className="text-center py-10 text-[var(--text-muted)] text-xs italic">No phrases found.</div>) : (library.map(p => (<div key={p.id} onClick={() => { onSelectPhrase(p); if(window.innerWidth < 1024) setSidebarOpen(false); }}><SidebarItem phrase={p} currentId={currentPhraseId} onDelete={onDeletePhrase} /></div>)))}
        </div>
        <div className="p-4 border-t border-[var(--border-color)] bg-[var(--bg-body)]"><button onClick={onOpenHelp} className="w-full app-btn py-3 text-sm flex items-center justify-center gap-2 text-[var(--text-main)] bg-[var(--bg-sub)] hover:bg-[var(--accent)] hover:text-white transition-colors font-semibold active:scale-95"><HelpCircle size={16} /> Help & Manual</button></div>
    </aside>
    {sidebarOpen && (<div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setSidebarOpen(false)}></div>)}
    </>
);

export const Header: React.FC<{ sidebarOpen: boolean; setSidebarOpen: (v:boolean)=>void; phrase: Phrase; setPhrase: (p:Phrase)=>void; showDegrees: boolean; setShowDegrees: (v:boolean)=>void; updateMeasureCount: (c:number)=>void; }> = ({ sidebarOpen, setSidebarOpen, phrase, setPhrase, showDegrees, setShowDegrees, updateMeasureCount }) => (
    <div className="h-14 shrink-0 border-b border-[var(--border-color)] bg-[var(--bg-panel)] flex items-center justify-between px-4 lg:px-6 shadow-sm z-20">
        <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden text-[var(--text-muted)] active:scale-95"><Menu size={20} /></button>
            <div className="p-1.5 bg-[var(--accent)]/10 text-[var(--accent)] rounded-md hidden sm:block"><Pencil size={16} /></div>
            <input type="text" value={phrase.name} onChange={e => setPhrase({...phrase, name: e.target.value})} className="text-base lg:text-lg font-bold bg-transparent outline-none text-[var(--text-main)] placeholder-[var(--text-muted)] w-40 lg:w-64 focus:border-b border-[var(--accent)] truncate transition-all" placeholder="Untitled Phrase" />
        </div>
        <div className="flex items-center gap-2 lg:gap-4">
             <div className="flex items-center gap-2 px-2 lg:px-3 py-1.5 bg-[var(--bg-body)] rounded-md border border-[var(--border-color)] hidden sm:flex">
                <Grid size={14} className="text-[var(--text-muted)]" />
                <select value={phrase.measures.length} onChange={(e) => updateMeasureCount(parseInt(e.target.value))} className="bg-transparent text-xs font-bold outline-none cursor-pointer text-[var(--text-main)]">
                    {[1, 2].map(c => <option key={c} value={c}>{c} Bars</option>)}
                </select>
            </div>
            <div className="flex bg-[var(--bg-body)] p-1 rounded-md border border-[var(--border-color)]">
                <button onClick={() => setPhrase({...phrase, instrument: 'guitar'})} className={clsx("px-2 lg:px-3 py-1 text-xs font-bold rounded transition-colors active:scale-95", phrase.instrument === 'guitar' ? "bg-[var(--text-main)] text-[var(--bg-body)]" : "text-[var(--text-muted)] hover:text-[var(--text-main)]")}>GUITAR</button>
                <button onClick={() => setPhrase({...phrase, instrument: 'bass'})} className={clsx("px-2 lg:px-3 py-1 text-xs font-bold rounded transition-colors active:scale-95", phrase.instrument === 'bass' ? "bg-[var(--text-main)] text-[var(--bg-body)]" : "text-[var(--text-muted)] hover:text-[var(--text-main)]")}>BASS</button>
            </div>
            <button onClick={() => setShowDegrees(!showDegrees)} className={clsx("p-2 rounded-md transition-colors border hidden sm:block active:scale-95", showDegrees ? "bg-[var(--accent)]/10 text-[var(--accent)] border-[var(--accent)]/30" : "text-[var(--text-muted)] border-transparent hover:bg-[var(--bg-sub)]")} title="Toggle Degrees"><Eye size={16} /></button>
        </div>
    </div>
);
