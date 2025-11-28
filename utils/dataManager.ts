import { Phrase } from '../types';

/**
 * File System Access API を使用したデータ管理
 * 保存時に自動的に data/ フォルダにファイルを作成
 */

// データフォルダのハンドルをキャッシュ
let dataFolderHandle: FileSystemDirectoryHandle | null = null;

/**
 * File System Access API がサポートされているかチェック
 */
export const isFileSystemAccessSupported = (): boolean => {
    return 'showDirectoryPicker' in window;
};

/**
 * データフォルダへのアクセス許可を要求
 */
export const requestDataFolderAccess = async (): Promise<FileSystemDirectoryHandle | null> => {
    if (!isFileSystemAccessSupported()) {
        console.warn('File System Access API is not supported');
        return null;
    }

    try {
        // ユーザーにフォルダを選択してもらう
        const handle = await (window as any).showDirectoryPicker({
            mode: 'readwrite',
            startIn: 'documents'
        });

        dataFolderHandle = handle;

        // ハンドルを LocalStorage に保存（権限は保持されない）
        try {
            localStorage.setItem('dataFolderName', handle.name);
        } catch (e) {
            console.warn('Failed to save folder name');
        }

        return handle;
    } catch (error) {
        if ((error as Error).name !== 'AbortError') {
            console.error('Failed to access data folder:', error);
        }
        return null;
    }
};

/**
 * フレーズを data フォルダに自動保存
 */
export const autoSavePhraseToDataFolder = async (phrase: Phrase): Promise<boolean> => {
    // File System Access API が使えない場合は自動ダウンロード
    if (!isFileSystemAccessSupported()) {
        autoDownloadPhrase(phrase);
        return true;
    }

    // フォルダハンドルがない場合は要求
    if (!dataFolderHandle) {
        const handle = await requestDataFolderAccess();
        if (!handle) {
            // ユーザーがキャンセルした場合は自動ダウンロードにフォールバック
            autoDownloadPhrase(phrase);
            return true;
        }
    }

    try {
        // ファイル名を生成
        const safeName = phrase.name.replace(/[^a-zA-Z0-9-_\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/g, '_');
        const filename = `${safeName}.json`;

        // ファイルを作成
        const fileHandle = await dataFolderHandle!.getFileHandle(filename, { create: true });
        const writable = await fileHandle.createWritable();

        // データを書き込み
        const data = JSON.stringify(phrase, null, 2);
        await writable.write(data);
        await writable.close();

        console.log(`✅ Auto-saved to: ${filename}`);
        return true;
    } catch (error) {
        console.error('Failed to auto-save:', error);

        // エラー時は自動ダウンロードにフォールバック
        autoDownloadPhrase(phrase);
        return false;
    }
};

/**
 * フォールバック: 自動ダウンロード
 */
const autoDownloadPhrase = (phrase: Phrase) => {
    const safeName = phrase.name.replace(/[^a-zA-Z0-9-_\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/g, '_');
    const filename = `${safeName}.json`;

    const dataStr = JSON.stringify(phrase, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    console.log(`📥 Downloaded: ${filename} (Move to data/ folder)`);
};

/**
 * データフォルダをリセット（再選択を促す）
 */
export const resetDataFolder = () => {
    dataFolderHandle = null;
    localStorage.removeItem('dataFolderName');
};

/**
 * 現在のデータフォルダ名を取得
 */
export const getDataFolderName = (): string | null => {
    return localStorage.getItem('dataFolderName');
};

/**
 * データフォルダが設定済みかチェック
 */
export const isDataFolderConfigured = (): boolean => {
    return dataFolderHandle !== null || getDataFolderName() !== null;
};

// 既存のエクスポート関数もそのまま保持
export const exportLibraryToFile = (library: Phrase[], filename?: string) => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const defaultFilename = `phrasestocker-library-${timestamp}.json`;
    const finalFilename = filename || defaultFilename;

    const dataStr = JSON.stringify(library, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = finalFilename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};

export const exportPhraseToFile = (phrase: Phrase) => {
    const safeName = phrase.name.replace(/[^a-zA-Z0-9-_\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/g, '_');
    const timestamp = new Date().toISOString().slice(0, 10);
    const filename = `${safeName}-${timestamp}.json`;

    const dataStr = JSON.stringify(phrase, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};

export const importLibraryFromFile = (): Promise<Phrase[]> => {
    return new Promise((resolve, reject) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.multiple = true; // 複数ファイル選択を有効化

        input.onchange = async (e) => {
            const files = (e.target as HTMLInputElement).files;
            if (!files || files.length === 0) {
                reject(new Error('No files selected'));
                return;
            }

            try {
                const allPhrases: Phrase[] = [];
                let successCount = 0;
                let errorCount = 0;

                // すべてのファイルを処理
                for (let i = 0; i < files.length; i++) {
                    const file = files[i];

                    try {
                        const text = await file.text();
                        const data = JSON.parse(text);

                        if (Array.isArray(data)) {
                            // ライブラリ全体（複数フレーズ）
                            allPhrases.push(...data);
                            successCount += data.length;
                        } else if (data.id && data.measures) {
                            // 単一フレーズ
                            allPhrases.push(data);
                            successCount++;
                        } else {
                            console.warn(`Invalid format in file: ${file.name}`);
                            errorCount++;
                        }
                    } catch (error) {
                        console.error(`Error reading file ${file.name}:`, error);
                        errorCount++;
                    }
                }

                if (allPhrases.length === 0) {
                    reject(new Error('No valid phrases found in selected files'));
                    return;
                }

                console.log(`✅ Imported ${successCount} phrases from ${files.length} files`);
                if (errorCount > 0) {
                    console.warn(`⚠️ ${errorCount} files had errors`);
                }

                resolve(allPhrases);
            } catch (error) {
                reject(error);
            }
        };

        input.click();
    });
};

export const createBackup = (library: Phrase[]) => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    exportLibraryToFile(library, `backup-${timestamp}.json`);
};

export const setupAutoBackup = (library: Phrase[]) => {
    const lastBackup = localStorage.getItem('lastBackupDate');
    const today = new Date().toISOString().slice(0, 10);

    if (lastBackup !== today && library.length > 0) {
        try {
            const backupData = {
                date: today,
                libraryCount: library.length,
                data: library
            };
            localStorage.setItem('phraseStocker_backup', JSON.stringify(backupData));
            localStorage.setItem('lastBackupDate', today);
            console.log('✅ Auto-backup created:', today);
        } catch (error) {
            console.error('❌ Auto-backup failed:', error);
        }
    }
};
