import ReactDOM from 'react-dom/client';

import { App } from '@/app/components/App';
import 'react-loading-skeleton/dist/skeleton.css';
import 'twenty-ui/style.css';
import 'twenty-ui/theme-light.css';
import 'twenty-ui/theme-dark.css';
import './index.css';

async function enableMocking() {
  if (import.meta.env.REACT_APP_ENABLE_MSW !== 'true') {
    return;
  }

  try {
    const { setupWorker } = await import('msw/browser');
    const { graphqlMocks } = await import('~/testing/graphqlMocks');
    const { mockedUserJWT } = await import('~/testing/mock-data/jwt');
    const { cookieStorage } = await import('~/utils/cookie-storage');

    // Set auth token cookie before app renders so auth guard doesn't redirect to login
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    cookieStorage.setItem(
      'tokenPair',
      JSON.stringify({
        accessOrWorkspaceAgnosticToken: {
          token: mockedUserJWT,
          expiresAt,
        },
        refreshToken: {
          token: mockedUserJWT,
          expiresAt,
        },
      }),
    );

    const worker = setupWorker(...graphqlMocks.handlers);

    await worker.start({
      onUnhandledRequest: 'bypass',
      serviceWorker: {
        url: '/mockServiceWorker.js',
      },
    });

    console.log('[MSW] Mock Service Worker started successfully');
  } catch (error) {
    console.error('[MSW] Failed to start Mock Service Worker:', error);
  }
}

enableMocking().then(() => {
  const root = ReactDOM.createRoot(
    document.getElementById('root') ?? document.body,
  );

  root.render(<App />);
});
