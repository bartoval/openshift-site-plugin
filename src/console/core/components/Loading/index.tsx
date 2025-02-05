import { CSSProperties, FC } from 'react';

import {
  Spinner,
  EmptyState,
  EmptyStateBody,
  EmptyStateHeader,
  EmptyStateIcon,
  Card,
  Bullseye
} from '@patternfly/react-core';

const floatLoader: CSSProperties = {
  top: 0,
  position: 'absolute',
  right: 0,
  width: '100%',
  height: '100%',
  zIndex: 100
};

interface LoadingPageProps {
  message?: string;
  isFLoating?: boolean;
  color?: string;
}

const LoadingPage: FC<LoadingPageProps> = function ({ isFLoating = false, message = '' }) {
  return (
    <Card isPlain isFullHeight style={isFLoating ? floatLoader : undefined} data-testid="sk-loading">
      <Bullseye>
        <EmptyState>
          <EmptyStateHeader icon={<EmptyStateIcon icon={Spinner} />} />
          <EmptyStateBody>{message}</EmptyStateBody>
        </EmptyState>
      </Bullseye>
    </Card>
  );
};

export default LoadingPage;
