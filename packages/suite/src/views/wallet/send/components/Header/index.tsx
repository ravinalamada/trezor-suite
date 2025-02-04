import React from 'react';
import styled from 'styled-components';
import { variables, Dropdown, H2 } from '@trezor/components';
import { Translation, AccountFormCloseButton } from '@suite-components';
import { useActions } from '@suite-hooks';
import { useSendFormContext } from '@wallet-hooks';
import * as sendFormActions from '@wallet-actions/sendFormActions';
import Clear from './components/Clear';

const Wrapper = styled.div`
    display: flex;
    margin-bottom: 30px;
`;

const HeaderLeft = styled.div`
    display: flex;
    flex: 1;
    align-items: center;
`;

const HeaderRight = styled.div`
    display: flex;
    align-items: center;
    justify-content: flex-end;
    flex: 1;
`;

const StyledTitle = styled(H2)`
    font-weight: ${variables.FONT_WEIGHT.DEMI_BOLD};
    text-transform: capitalize;
    color: ${props => props.theme.TYPE_DARK_GREY};
    padding-top: 10px;
`;

const Header = () => {
    const {
        outputs,
        account: { networkType },
        addOpReturn,
        loadTransaction,
    } = useSendFormContext();

    const { sendRaw } = useActions({
        sendRaw: sendFormActions.sendRaw,
    });

    const opreturnOutput = (outputs || []).find(o => o.type === 'opreturn');
    const options = [
        {
            key: 'opreturn',
            'data-test': '@send/header-dropdown/opreturn',
            callback: addOpReturn,
            label: <Translation id="OP_RETURN_ADD" />,
            isDisabled: !!opreturnOutput,
            isHidden: networkType !== 'bitcoin',
        },
        {
            key: 'import',
            callback: () => {
                loadTransaction();
                return true;
            },
            label: <Translation id="IMPORT_CSV" />,
            isHidden: networkType !== 'bitcoin',
        },
        {
            key: 'raw',
            callback: () => {
                sendRaw(true);
                return true;
            },
            label: <Translation id="SEND_RAW" />,
        },
    ];

    return (
        <Wrapper>
            <HeaderLeft>
                <StyledTitle>
                    <Translation id="TR_NAV_SEND" />
                </StyledTitle>
            </HeaderLeft>
            <HeaderRight>
                <Clear />
                <Dropdown
                    alignMenu="right"
                    data-test="@send/header-dropdown"
                    items={[
                        {
                            key: 'header',
                            options,
                        },
                    ]}
                />
                <AccountFormCloseButton />
            </HeaderRight>
        </Wrapper>
    );
};

export default Header;
