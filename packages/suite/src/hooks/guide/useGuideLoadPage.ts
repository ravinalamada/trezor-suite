import { useState, useEffect } from 'react';
import type { Node } from '@suite-types/guide';
import type { Locale } from '@suite-config/languages';

export const loadPageMarkdownFile = async (id: string, language = 'en'): Promise<string> => {
    try {
        const file = await import(`@trezor/suite-data/files/guide/${language}${id}`);
        const md = await file.default;
        return md;
    } catch (e) {
        console.error(`Loading of ${id} page in ${language} language failed: ${e}`);
        throw e;
    }
};

export const useGuideLoadPage = (currentNode: Node | null, language: Locale = 'en') => {
    const [markdown, setMarkdown] = useState<string>();
    const [hasError, setHasError] = useState<boolean>(false);

    useEffect(() => {
        if (!currentNode) return;
        loadPageMarkdownFile(currentNode.id, language)
            .catch(() => loadPageMarkdownFile(currentNode.id))
            .then(res => setMarkdown(res))
            .catch(() => setHasError(true));
    }, [currentNode, language]);

    return {
        markdown,
        hasError,
    };
};
