import React from 'react';

import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

import LoadingPage from '../src/console/core/components/Loading';

describe('LoadingPage', () => {
  it('renders loading page without message', () => {
    render(<LoadingPage />);

    expect(screen.getByTestId('sk-loading')).toBeInTheDocument();
  });

  it('renders loading page with message', () => {
    const testMessage = 'Loading test data...';
    render(<LoadingPage message={testMessage} />);

    expect(screen.getByTestId('sk-loading')).toBeInTheDocument();
    expect(screen.getByText(testMessage)).toBeInTheDocument();
  });

  it('applies floating styles when isFLoating is true', () => {
    render(<LoadingPage isFLoating={true} />);

    const loadingElement = screen.getByTestId('sk-loading');
    expect(loadingElement).toHaveStyle({
      position: 'absolute',
      top: '0',
      right: '0',
      width: '100%',
      height: '100%',
      zIndex: 100
    });
  });

  it('does not apply floating styles when isFLoating is false', () => {
    render(<LoadingPage isFLoating={false} />);

    const loadingElement = screen.getByTestId('sk-loading');
    expect(loadingElement).not.toHaveStyle({
      position: 'absolute'
    });
  });
});
