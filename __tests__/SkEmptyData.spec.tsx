import React from 'react';

import { SearchIcon } from '@patternfly/react-icons';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

import EmptyData from '../src/console/core/components/EmptyData';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (str: string) => str
  })
}));

describe('EmptyData', () => {
  it('renders with default message when no props provided', () => {
    render(<EmptyData />);

    expect(screen.getByTestId('sk-emptydata')).toBeInTheDocument();
    expect(screen.getByText('Data not found')).toBeInTheDocument();
  });

  it('renders with custom message', () => {
    const testMessage = 'Custom empty message';
    render(<EmptyData message={testMessage} />);

    expect(screen.getByTestId('sk-emptydata')).toBeInTheDocument();
    expect(screen.getByText(testMessage)).toBeInTheDocument();
  });

  it('renders with description when provided', () => {
    const testDescription = 'Test description';
    render(<EmptyData description={testDescription} />);

    expect(screen.getByTestId('sk-emptydata')).toBeInTheDocument();
    expect(screen.getByText(testDescription)).toBeInTheDocument();
  });

  it('renders with icon when provided', () => {
    render(<EmptyData icon={SearchIcon} />);

    expect(screen.getByTestId('sk-emptydata')).toBeInTheDocument();
    const icon = document.querySelector('.pf-v5-c-empty-state__icon');
    expect(icon).toBeInTheDocument();
  });

  it('renders with all props provided', () => {
    const testMessage = 'Custom message';
    const testDescription = 'Custom description';

    render(<EmptyData message={testMessage} description={testDescription} icon={SearchIcon} />);

    expect(screen.getByTestId('sk-emptydata')).toBeInTheDocument();
    expect(screen.getByText(testMessage)).toBeInTheDocument();
    expect(screen.getByText(testDescription)).toBeInTheDocument();
    const icon = document.querySelector('.pf-v5-c-empty-state__icon');
    expect(icon).toBeInTheDocument();
  });
});
