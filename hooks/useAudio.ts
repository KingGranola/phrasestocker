
import React, { useEffect, useRef, useState } from 'react';
import * as Tone from 'tone';
import { Phrase, VoicingMode } from '../types';
import { DURATION_VALUES } from '../constants';
import { keyToMidi } from '../services/musicTheory';
import { getChordNotes } from '../services/chordLogic';

const PIANO_SAMPLES_URL = "https://tonejs.github.io/audio/salamander/";
const PIANO_SAMPLE_MAP = { 'A0': 'A0.mp3', 'C1': 'C1.mp3', 'D#1': 'Ds1.mp3', 'F#1': 'Fs1.mp3', 'A1': 'A1.mp3', 'C2': 'C2.mp3', 'D#2': 'Ds2.mp3', 'F#2': 'Fs2.mp3', 'A2': 'A2.mp3', 'C3': 'C3.mp3', 'D#3': 'Ds3.mp3', 'F#3': 'Fs3.mp3', 'A3': 'A3.mp3', 'C4': 'C4.mp3', 'D#4': 'Ds4.mp3', 'F#4': 'Fs4.mp3', 'A4': 'A4.mp3', 'C5': 'C5.mp3', 'D#5': 'Ds5.mp3', 'F#5': 'Fs5.mp3', 'A5': 'A5.mp3', 'C6': 'C6.mp3', 'D#6': 'Ds6.mp3', 'F#6': 'Fs6.mp3', 'A6': 'A6.mp3', 'C7': 'C7.mp3', 'D#7': 'Ds7.mp3', 'F#7': 'Fs7.mp3', 'A7': 'A7.mp3', 'C8': 'C8.mp3' };
export const INSTRUMENT_PRESETS = {
  melody: [
    { id: 'piano', name: 'Grand Piano (Real)', type: 'sampler', options: {} },
    { id: 'guitar_acoustic', name: 'Acoustic Guitar', type: 'synth', options: { oscillator: { type: 'triangle' }, envelope: { attack: 0.02, decay: 0.3, sustain: 0.1, release: 0.5 } } },
    { id: 'guitar_electric', name: 'Electric Guitar', type: 'fmsynth', options: { harmonicity: 3, modulationIndex: 10, oscillator: { type: "square" }, envelope: { attack: 0.01, decay: 0.2, sustain: 0.3, release: 0.1 } } },
    { id: 'bass', name: 'Bass', type: 'monosynth', options: { oscillator: { type: "square" }, envelope: { attack: 0.05, decay: 0.2, sustain: 0.4, release: 0.8 }, filterEnvelope: { attack: 0.01, decay: 0.1, sustain: 0, baseFrequency: 200, octaves: 2.6 } } },
    { id: 'synth_lead', name: 'Synth Lead', type: 'synth', options: { oscillator: { type: 'sawtooth' }, envelope: { attack: 0.05, decay: 0.1, sustain: 0.4, release: 1 } } },
  ],
  chords: [
    { id: 'piano', name: 'Grand Piano (Real)', type: 'sampler', options: {} },
    { id: 'epiano', name: 'E. Piano', type: 'fmsynth', options: { harmonicity: 8, modulationIndex: 2, oscillator: { type: "sine" }, envelope: { attack: 0.001, decay: 2, sustain: 0.1, release: 2 } } },
    { id: 'jazz_guitar', name: 'Jazz Guitar', type: 'synth', options: { oscillator: { type: 'sine' }, envelope: { attack: 0.04, decay: 0.2, sustain: 0.2, release: 0.8 } } },
    { id: 'pad', name: 'Synth Pad', type: 'synth', options: { oscillator: { type: 'triangle' }, envelope: { attack: 0.5, decay: 0.5, sustain: 0.8, release: 2 } } },
  ]
};
export interface PlaybackConfig { melodyVolume: number; chordVolume: number; melodyInstrument: string; chordInstrument: string; voicing: VoicingMode; isMetronomeOn: boolean; metronomeVolume: number; metronomePattern: 'all' | '2-4'; metronomeSound: 'click' | 'kick' | 'beep'; }

export const useAudio = (phrase: Phrase, config: PlaybackConfig) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const melodySynthRef = useRef<Tone.Instrument<any> | null>(null);
  const chordSynthRef = useRef<Tone.Instrument<any> | null>(null);
  const metronomeSynthsRef = useRef<{ membrane: Tone.MembraneSynth | null; beep: Tone.Synth | null }>({ membrane: null, beep: null });
  const melodyGainRef = useRef<Tone.Gain | null>(null);
  const chordGainRef = useRef<Tone.Gain | null>(null);
  const metronomeGainRef = useRef<Tone.Gain | null>(null);

  useEffect(() => {
    const melodyGain = new Tone.Gain(0).toDestination(); const chordGain = new Tone.Gain(0).toDestination(); const metronomeGain = new Tone.Gain(0).toDestination();
    melodyGainRef.current = melodyGain; chordGainRef.current = chordGain; metronomeGainRef.current = metronomeGain;
    const membrane = new Tone.MembraneSynth({ pitchDecay: 0.008, octaves: 2, envelope: { attack: 0.001, decay: 0.2, sustain: 0 } }).connect(metronomeGain);
    const beep = new Tone.Synth({ oscillator: { type: 'sine' }, envelope: { attack: 0.001, decay: 0.1, sustain: 0 } }).connect(metronomeGain);
    metronomeSynthsRef.current = { membrane, beep };
    return () => { melodyGainRef.current?.dispose(); chordGainRef.current?.dispose(); metronomeGainRef.current?.dispose(); metronomeSynthsRef.current.membrane?.dispose(); metronomeSynthsRef.current.beep?.dispose(); };
  }, []);

  useEffect(() => {
    let active = true; let melodyLoaded = false; let chordsLoaded = false;
    const checkLoaded = () => { if (!active) return; if (melodyLoaded && chordsLoaded) { setIsLoaded(true); } };
    const createInstrument = (presetList: any[], id: string, gainNode: Tone.Gain, onLoad: () => void): Tone.Instrument<any> => {
      const preset = presetList.find(p => p.id === id) || presetList[0];
      let instrument: Tone.Instrument<any>;
      if (preset.type === 'sampler') { instrument = new Tone.Sampler({ urls: PIANO_SAMPLE_MAP, baseUrl: PIANO_SAMPLES_URL, onload: () => { onLoad(); } }); }
      else if (preset.type === 'fmsynth') { instrument = new Tone.PolySynth(Tone.FMSynth, preset.options); onLoad(); }
      else if (preset.type === 'monosynth') { instrument = new Tone.PolySynth(Tone.MonoSynth, preset.options); onLoad(); }
      else { instrument = new Tone.PolySynth(Tone.Synth, preset.options); onLoad(); }
      instrument.connect(gainNode); return instrument;
    };
    melodySynthRef.current?.dispose(); chordSynthRef.current?.dispose(); setIsLoaded(false);
    if (melodyGainRef.current && chordGainRef.current) {
      melodySynthRef.current = createInstrument(INSTRUMENT_PRESETS.melody, config.melodyInstrument, melodyGainRef.current, () => { melodyLoaded = true; checkLoaded(); });
      chordSynthRef.current = createInstrument(INSTRUMENT_PRESETS.chords, config.chordInstrument, chordGainRef.current, () => { chordsLoaded = true; checkLoaded(); });
    }
    return () => { active = false; };
  }, [config.melodyInstrument, config.chordInstrument]);

  useEffect(() => {
    if (melodyGainRef.current) melodyGainRef.current.gain.rampTo(Tone.dbToGain(config.melodyVolume), 0.1);
    if (chordGainRef.current) chordGainRef.current.gain.rampTo(Tone.dbToGain(config.chordVolume), 0.1);
    if (metronomeGainRef.current) { const gain = config.isMetronomeOn ? Tone.dbToGain(config.metronomeVolume) : 0; metronomeGainRef.current.gain.rampTo(gain, 0.1); }
    Tone.Transport.bpm.value = phrase.bpm;
  }, [config.melodyVolume, config.chordVolume, config.isMetronomeOn, config.metronomeVolume, phrase.bpm]);

  const stop = () => {
    Tone.Transport.stop(); Tone.Transport.cancel();
    if (melodySynthRef.current && !melodySynthRef.current.disposed) { try { if (melodySynthRef.current instanceof Tone.PolySynth || melodySynthRef.current instanceof Tone.Sampler) { melodySynthRef.current.releaseAll(); } } catch (e) { console.error(e); } }
    if (chordSynthRef.current && !chordSynthRef.current.disposed) { try { if (chordSynthRef.current instanceof Tone.PolySynth || chordSynthRef.current instanceof Tone.Sampler) { chordSynthRef.current.releaseAll(); } } catch (e) { console.error(e); } }
    setIsPlaying(false);
  };

  const play = async () => {
    if (!isLoaded) return;
    await Tone.start();
    if (isPlaying) { stop(); return; }
    Tone.Transport.stop(); Tone.Transport.cancel(); Tone.Transport.position = 0;
    let cumulativeBeats = 0;
    let lastChordMidi: number[] = [];
    phrase.measures.forEach(measure => {
      let noteCursor = cumulativeBeats;
      if (config.isMetronomeOn) {
        for (let i = 0; i < 4; i++) {
          const beatTime = cumulativeBeats + i;
          const shouldPlay = config.metronomePattern === 'all' ? true : (i === 1 || i === 3);
          if (shouldPlay) {
            Tone.Transport.schedule((time) => {
              const synths = metronomeSynthsRef.current; const sound = config.metronomeSound;
              if (sound === 'kick' && synths.membrane && !synths.membrane.disposed) { try { synths.membrane.triggerAttackRelease("C2", "32n", time); } catch (e) { } } else if (sound === 'click' && synths.membrane && !synths.membrane.disposed) { try { synths.membrane.triggerAttackRelease("G5", "32n", time); } catch (e) { } } else if (sound === 'beep' && synths.beep && !synths.beep.disposed) { try { synths.beep.triggerAttackRelease("C5", "32n", time); } catch (e) { } }
            }, `0:0:${beatTime * 4}`);
          }
        }
      }
      measure.notes.forEach(note => {
        const noteValue = DURATION_VALUES[note.duration];
        const durationBeats = note.dotted ? noteValue * 1.5 : noteValue;
        if (!note.isRest && melodySynthRef.current) {
          const midi = keyToMidi(note.keys[0]);
          const realMidi = phrase.instrument === 'guitar' ? midi - 12 : midi;
          const freq = Tone.Frequency(realMidi, "midi").toNote();
          Tone.Transport.schedule((time) => {
            const noteDur = Tone.Time("4n").toSeconds() * durationBeats;
            if (melodySynthRef.current && !melodySynthRef.current.disposed) { if (melodySynthRef.current instanceof Tone.Sampler && !melodySynthRef.current.loaded) return; try { melodySynthRef.current.triggerAttackRelease(freq, noteDur, time); } catch (e) { } }
          }, `0:0:${noteCursor * 4}`);
        }
        let actualDuration = durationBeats; if (note.tuplet) actualDuration = durationBeats * (2 / 3);
        noteCursor += actualDuration;
      });
      const sortedChords = [...measure.chords].sort((a, b) => a.position - b.position);
      sortedChords.forEach(chord => {
        const startBeat = cumulativeBeats + chord.position;
        let nextChordPos = 4; const nextChord = sortedChords.find(c => c.position > chord.position); if (nextChord) nextChordPos = nextChord.position;
        const chordDurationBeats = nextChordPos - chord.position;
        const noteNames = getChordNotes(chord.symbol, 3, config.voicing, lastChordMidi);
        const currentChordMidi = noteNames.map(n => keyToMidi(n.replace(/(\D)(\d)/, "$1/$2")));
        lastChordMidi = currentChordMidi;
        Tone.Transport.schedule((time) => {
          const chordDur = Tone.Time("4n").toSeconds() * chordDurationBeats;
          if (chordSynthRef.current && !chordSynthRef.current.disposed) { if (chordSynthRef.current instanceof Tone.Sampler && !chordSynthRef.current.loaded) return; try { chordSynthRef.current.triggerAttackRelease(noteNames, chordDur, time); } catch (e) { } }
        }, `0:0:${startBeat * 4}`);
      });
      cumulativeBeats += 4;
    });
    const totalDurationBeats = phrase.measures.length * 4;
    Tone.Transport.schedule(() => { setIsPlaying(false); Tone.Transport.stop(); }, `0:0:${totalDurationBeats * 4}`);
    Tone.Transport.start(); setIsPlaying(true);
  };
  const previewNote = (pitch: string, instrument: 'guitar' | 'bass') => {
    if (!melodySynthRef.current || !isLoaded || melodySynthRef.current.disposed) return;
    if (melodySynthRef.current instanceof Tone.Sampler && !melodySynthRef.current.loaded) return;
    if (Tone.context.state !== 'running') { Tone.start().catch(() => { }); }
    const midi = keyToMidi(pitch);
    const realMidi = instrument === 'guitar' ? midi - 12 : midi;
    const freq = Tone.Frequency(realMidi, "midi").toNote();
    try { melodySynthRef.current.triggerAttackRelease(freq, "8n"); } catch (e) { }
  };

  const previewChord = (symbol: string) => {
    if (!chordSynthRef.current || !isLoaded || chordSynthRef.current.disposed) return;
    if (chordSynthRef.current instanceof Tone.Sampler && !chordSynthRef.current.loaded) return;
    if (Tone.context.state !== 'running') { Tone.start().catch(() => { }); }

    const noteNames = getChordNotes(symbol, 3, config.voicing);
    try { chordSynthRef.current.triggerAttackRelease(noteNames, "2n"); } catch (e) { }
  };

  return { isPlaying, isLoaded, play, stop, previewNote, previewChord };
};
