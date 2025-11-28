import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Phrase } from '../types';
import { SAMPLE_PHRASES } from '../constants';
import {
    exportLibraryToFile,
    exportPhraseToFile,
    importLibraryFromFile,
    createBackup,
    setupAutoBackup,
    autoSavePhraseToDataFolder,
    requestDataFolderAccess,
    isFileSystemAccessSupported,
    getDataFolderName
} from '../utils/dataManager';

/**
 * ライブラリ管理のためのContext
 */
interface LibraryContextType {
    library: Phrase[];
    savePhrase: (phrase: Phrase) => Promise<void>;
    deletePhrase: (id: string) => void;
    loadPhrase: (id: string) => Phrase | undefined;
    searchLibrary: (query: string) => Phrase[];
    exportLibrary: () => void;
    exportPhrase: (phrase: Phrase) => void;
    importLibrary: () => Promise<number>;
    createManualBackup: () => void;
    setupDataFolder: () => Promise<boolean>;
    isAutoSaveSupported: boolean;
    dataFolderName: string | null;
}

const LibraryContext = createContext<LibraryContextType | undefined>(undefined);

const STORAGE_KEY = 'phraseStocker_library';

/**
 * LocalStorageからライブラリを読み込む
 */
const loadLibraryFromStorage = (): Phrase[] => {
    try {
        const savedLib = localStorage.getItem(STORAGE_KEY);
        if (savedLib) {
            const parsedLib = JSON.parse(savedLib);
            return parsedLib.length === 0 ? SAMPLE_PHRASES : parsedLib;
        }
    } catch (error) {
        console.error('Failed to load library from storage:', error);
    }
    return SAMPLE_PHRASES;
};

/**
 * LibraryProviderコンポーネント
 */
export const LibraryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [library, setLibrary] = useState<Phrase[]>(loadLibraryFromStorage());

    // ライブラリが変更されたらLocalStorageに保存
    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(library));
        } catch (error) {
            console.error('Failed to save library to storage:', error);
        }
    }, [library]);

    // 自動バックアップの設定
    useEffect(() => {
        setupAutoBackup(library);
    }, [library]);

    /**
     * フレーズを保存または更新
     */
    const savePhrase = async (phrase: Phrase) => {
        const updatedPhrase = {
            ...phrase,
            updatedAt: Date.now()
        };

        setLibrary(current => {
            const existingIndex = current.findIndex(p => p.id === updatedPhrase.id);
            if (existingIndex >= 0) {
                const newLibrary = [...current];
                newLibrary[existingIndex] = updatedPhrase;
                return newLibrary;
            } else {
                return [...current, updatedPhrase];
            }
        });

        // dataフォルダへの自動保存
        try {
            await autoSavePhraseToDataFolder(updatedPhrase);
        } catch (error) {
            console.error('Auto-save failed:', error);
        }
    };

    /**
     * フレーズを削除
     */
    const deletePhrase = (id: string) => {
        setLibrary(current => current.filter(p => p.id !== id));
    };

    /**
     * IDでフレーズを読み込む
     */
    const loadPhrase = (id: string): Phrase | undefined => {
        return library.find(p => p.id === id);
    };

    /**
     * ライブラリを検索
     */
    const searchLibrary = (query: string): Phrase[] => {
        if (!query.trim()) return library;

        const lowerQuery = query.toLowerCase();
        return library.filter(p =>
            p.name.toLowerCase().includes(lowerQuery) ||
            p.tags?.some(t => t.toLowerCase().includes(lowerQuery))
        );
    };

    /**
     * ライブラリ全体をエクスポート
     */
    const exportLibrary = () => {
        exportLibraryToFile(library);
    };

    /**
     * 個別フレーズをエクスポート
     */
    const exportPhrase = (phrase: Phrase) => {
        exportPhraseToFile(phrase);
    };

    /**
   * ライブラリをインポート
   */
    const importLibrary = async (): Promise<number> => {
        try {
            const importedPhrases = await importLibraryFromFile();

            let addedCount = 0;

            // 既存のライブラリとマージ（IDの重複を避ける）
            setLibrary(current => {
                const mergedLibrary = [...current];

                importedPhrases.forEach(imported => {
                    const existingIndex = mergedLibrary.findIndex(p => p.id === imported.id);
                    if (existingIndex >= 0) {
                        // IDが重複している場合、新しいIDで追加
                        mergedLibrary.push({
                            ...imported,
                            id: `${imported.id}-imported-${Date.now()}`,
                            updatedAt: Date.now()
                        });
                        addedCount++;
                    } else {
                        mergedLibrary.push(imported);
                        addedCount++;
                    }
                });

                return mergedLibrary;
            });

            console.log(`✅ Successfully imported ${addedCount} phrases`);
            return addedCount;
        } catch (error) {
            console.error('Failed to import library:', error);
            throw error;
        }
    };

    /**
     * 手動バックアップ作成
     */
    const createManualBackup = () => {
        createBackup(library);
    };

    /**
     * データフォルダのセットアップ
     */
    const setupDataFolder = async (): Promise<boolean> => {
        const handle = await requestDataFolderAccess();
        return handle !== null;
    };

    const value: LibraryContextType = {
        library,
        savePhrase,
        deletePhrase,
        loadPhrase,
        searchLibrary,
        exportLibrary,
        exportPhrase,
        importLibrary,
        createManualBackup,
        setupDataFolder,
        isAutoSaveSupported: isFileSystemAccessSupported(),
        dataFolderName: getDataFolderName()
    };

    return (
        <LibraryContext.Provider value={value}>
            {children}
        </LibraryContext.Provider>
    );
};

/**
 * LibraryContextを使用するカスタムフック
 */
export const useLibrary = (): LibraryContextType => {
    const context = useContext(LibraryContext);
    if (!context) {
        throw new Error('useLibrary must be used within LibraryProvider');
    }
    return context;
};
