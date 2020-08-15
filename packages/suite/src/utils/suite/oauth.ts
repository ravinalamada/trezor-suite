import { getPrefixedURL } from '@suite-utils/router';
import { METADATA } from '@suite-actions/constants';
import { Deferred, createDeferred } from '@suite-utils/deferred';
import { urlHashParams } from '@suite-utils/metadata';
/**
 * For desktop, always use oauth_receiver.html from trezor.io
 * For web, use oauth_receiver.html hosted on the same origin (localhost/sldev/trezor.io)
 */
export const getOauthReceiverUrl = () => {
    // @ts-ignore
    if (!window.ipcRenderer) {
        return `${window.location.origin}${getPrefixedURL('/static/oauth/oauth_receiver.html')}`;
    }

    // todo: upload oauth_receiver.html from suite to trezor.io (it contains code to handle ipcRenderer);
    // return 'https://beta-wallet.trezor.io/oauth_receiver.html';
    // todo: temporarily herokuapp is used.
    return 'https://track-suite.herokuapp.com/oauth/';
};

export const getMetadataOauthToken = (url: string) => {
    console.log('getMetadataOauthToken orig');
    const dfd: Deferred<string> = createDeferred();

    const props = METADATA.AUTH_WINDOW_PROPS;

    const onMessage = (e: MessageEvent) => {
        // filter non oauth messages
        if (
            ![
                'herokuapp.com', // todo: remove
                'wallet.trezor.io',
                'beta-wallet.trezor.io',
                window.location.origin,
            ].includes(e.origin)
        ) {
            return;
        }

        if (typeof e.data !== 'string') return;

        const params = urlHashParams(e.data);

        const token = params.access_token;
        const { state } = params;

        console.warn('TOKEN', token, state);

        if (token) {
            dfd.resolve(token);
        } else {
            dfd.reject(new Error('Cancelled'));
        }
    };

    // @ts-ignore
    const { ipcRenderer } = global;
    if (ipcRenderer) {
        const onIpcMessage = (_sender: any, message: any) => {
            onMessage({ ...message, origin: 'herokuapp.com' });
            ipcRenderer.off('oauth', onIpcMessage);
        };
        ipcRenderer.on('oauth', onIpcMessage);
    } else {
        window.addEventListener('message', onMessage);
    }

    window.open(url, METADATA.AUTH_WINDOW_TITLE, props);

    return dfd.promise;
};
