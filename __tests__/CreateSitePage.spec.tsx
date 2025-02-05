import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

import { AppApiContext } from '../src/console/context/AppApiContext';
import CreateSitePage from '../src/console/pages/CreateSitePage';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (str: string) => str
  })
}));

vi.mock('../src/console/pages/components/forms/SiteForm', () => ({
  default: ({ onCancel }: { onCancel: () => void }) => (
    <button data-testid="mock-cancel" onClick={onCancel}>
      Cancel
    </button>
  )
}));

describe('CreateSitePage', () => {
  it('toggles modal state when buttons are clicked', () => {
    render(
      <AppApiContext>
        <CreateSitePage />
      </AppApiContext>
    );

    const createButton = screen.getByText('Create site');
    fireEvent.click(createButton);

    expect(screen.getByRole('dialog')).toBeInTheDocument();

    const cancelButton = screen.getByTestId('mock-cancel');
    fireEvent.click(cancelButton);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
