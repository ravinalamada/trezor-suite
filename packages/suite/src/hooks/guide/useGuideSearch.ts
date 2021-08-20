import { useState, useEffect, useMemo } from 'react';
import { Category, Page } from '@suite-types/guide';
import { loadPageMarkdownFile } from '@guide-hooks/useGuideLoadPage';

const SEARCH_DELAY = 300;
const MIN_QUERY_LENGTH = 3;
const MAX_RESULTS = 5;

type PageMap = {
    [url: string]: Page;
};

export type SearchResult = {
    page: Page;
    score: number;
    preview?: {
        content: string;
        from: number;
        length: number;
    };
};

const clampMin = (value: number, min: number) => (value < min ? min : value);

const getPreview = (markdown: string, query: string, index: number) => {
    const previewStart = markdown.substr(0, clampMin(index - 10, 0)).lastIndexOf(' ') + 1; // TODO what if no match
    const previewEnd = markdown.indexOf(' ', index + query.length + 20); // TODO what if no match
    return {
        content: markdown.slice(previewStart, previewEnd),
        from: index - previewStart,
        length: query.length,
    };
};

const searchInFile = (url: string, query: string, markdown: string) => {
    const sanitized = markdown.replace(/\\/g, '').trim();
    const regex = new RegExp(query, 'ig');
    const count = sanitized.match(regex)?.length || 0;
    return {
        url,
        score: count,
        preview: count ? getPreview(sanitized, query, sanitized.search(regex)) : undefined,
    };
};

const search = async (query: string, pageMap: PageMap): Promise<SearchResult[]> => {
    const querySanitized = query.replace(/[^a-zA-Z0-9_-]+/g, ' ').trim();
    const results =
        querySanitized.length < MIN_QUERY_LENGTH
            ? []
            : await Promise.all(
                  Object.keys(pageMap).map(url =>
                      loadPageMarkdownFile(url)
                          .catch(() => '')
                          .then(md => searchInFile(url, querySanitized, md)),
                  ),
              );
    return results
        .filter(res => res.score)
        .sort((a, b) => b.score - a.score)
        .slice(0, MAX_RESULTS)
        .map(({ preview, score, url }) => ({ page: pageMap[url], score, preview }));
};

export const useGuideSearch = (query: string, pageRoot: Category | null) => {
    const pageMap = useMemo(() => {
        const reduceNode = (node: Category | Page): PageMap =>
            node.type === 'page'
                ? { [node.id]: node }
                : node.children.reduce(
                      (map, child) => ({
                          ...map,
                          ...reduceNode(child),
                      }),
                      {},
                  );
        return pageRoot ? reduceNode(pageRoot) : {};
    }, [pageRoot]);

    const [searchResult, setSearchResult] = useState<SearchResult[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        let active = true;
        const timeout = setTimeout(() => {
            setLoading(true);
            search(query, pageMap)
                .then(res => {
                    if (!active) return;
                    setSearchResult(res);
                })
                .finally(() => setLoading(false));
        }, SEARCH_DELAY);
        return () => {
            clearTimeout(timeout);
            active = false;
        };
    }, [query, pageMap]);

    return {
        searchResult,
        loading,
    };
};
