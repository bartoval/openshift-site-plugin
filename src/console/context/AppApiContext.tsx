import { ReactElement, useState } from 'react';

import { QueryClient, QueryClientConfig, QueryClientProvider } from '@tanstack/react-query';

import { queryClientConfig } from '../config/reactQuery';

const QueryClientContext = function ({
  config = {},
  children
}: {
  config?: QueryClientConfig;
  children: ReactElement;
}) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        ...queryClientConfig,
        ...config
      })
  );

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
};

export const AppApiContext = function ({ children, config }: { config?: QueryClientConfig; children: ReactElement }) {
  return <QueryClientContext config={config}>{children}</QueryClientContext>;
};
