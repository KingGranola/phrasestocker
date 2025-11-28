import { Phrase } from '../types';

/**
 * 保存済みフレーズの追跡ユーティリティ
 */

const SAVED_PHRASES_KEY = 'phraseStocker_savedPhrases';

/**
 * 保存済みフレーズIDのセットを取得
 */
export const getSavedPhraseIds = (): Set<string> => {
    try {
        const saved = localStorage.getItem(SAVED_PHRASES_KEY);
        if (saved) {
            return new Set(JSON.parse(saved));
        }
    } catch (error) {
        console.error('Failed to load saved phrase IDs:', error);
    }
    return new Set();
};

/**
 * フレーズIDを保存済みとしてマーク
 */
export const markPhraseSaved = (id: string) => {
    const saved = getSavedPhraseIds();
    saved.add(id);
    try {
        localStorage.setItem(SAVED_PHRASES_KEY, JSON.stringify(Array.from(saved)));
    } catch (error) {
        console.error('Failed to mark phrase as saved:', error);
    }
};

/**
 * フレーズが保存済みかチェック
 */
export const isPhraseSaved = (id: string): boolean => {
    return getSavedPhraseIds().has(id);
};

/**
 * 新規ファイル名を生成（タイムスタンプ付き）
 */
export const generateNewFileName = (phrase: Phrase): string => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    return `${phrase.name}-${timestamp}`;
};
