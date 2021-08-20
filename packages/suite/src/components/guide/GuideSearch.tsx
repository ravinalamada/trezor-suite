import React, { useState } from 'react';
import styled from 'styled-components';
import { Icon, Input, Loader, variables } from '@trezor/components';
import { GuideNode } from '@guide-components';
import { Category } from '@suite-types/guide';
import { useGuideSearch } from '@guide-hooks/useGuideSearch';

const PageFoundList = styled.div`
    margin-top: 8px;
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
`;

const PageFound = styled(GuideNode)`
    margin-bottom: 4px;
`;

const NoResults = styled.p`
    margin-top: 8px;
    font-size: ${variables.FONT_SIZE.SMALL};
    font-weight: ${variables.FONT_WEIGHT.REGULAR};
    color: ${props => props.theme.TYPE_LIGHT_GREY};
`;

const PreviewContent = styled.div`
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    font-weight: ${variables.FONT_WEIGHT.REGULAR};
    & > em {
        font-style: inherit;
        font-weight: ${variables.FONT_WEIGHT.DEMI_BOLD};
        color: ${props => props.theme.TYPE_GREEN};
    }
`;

const Preview = ({ content, from, length }: { content: string; from: number; length: number }) => (
    <PreviewContent>
        {content.substr(0, from)}
        <em>{content.substr(from, length)}</em>
        {content.substr(from + length)}
    </PreviewContent>
);

const GuideSearch = ({ pageRoot }: { pageRoot: Category | null }) => {
    const [query, setQuery] = useState('');

    const { searchResult, loading } = useGuideSearch(query, pageRoot);

    return (
        <>
            <Input
                noTopLabel
                placeholder="Search in Guide..."
                noError
                value={query}
                onChange={e => setQuery(e.currentTarget.value)}
                innerAddon={loading ? <Loader size={16} /> : <Icon icon="SEARCH" size={16} />}
            />
            {searchResult.length ? (
                <PageFoundList>
                    {searchResult.map(({ page, preview }) => (
                        <PageFound
                            key={page.id}
                            node={page}
                            description={preview && <Preview {...preview} />}
                        />
                    ))}
                </PageFoundList>
            ) : (
                query && <NoResults>No results found</NoResults>
            )}
        </>
    );
};

export default GuideSearch;
