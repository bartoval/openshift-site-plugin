import React from 'react';

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { RESTApi } from '../src/console/API/REST.api';
import SiteForm from '../src/console/pages/components/forms/SiteForm';

const mockCreateOrUpdateSite = vi.hoisted(() => vi.fn());

vi.mock('../src/console/API/REST.api', () => ({
  RESTApi: {
    createOrUpdateSite: mockCreateOrUpdateSite
  }
}));

vi.mock('@tanstack/react-query', () => ({
  useMutation: <TData, TError, TVariables>({
    mutationFn,
    onSuccess,
    onError
  }: {
    mutationFn: (data: TVariables) => Promise<TData>;
    onSuccess: () => void;
    onError: (error: TError) => void;
  }) => ({
    mutate: async (data: TVariables) => {
      try {
        await mutationFn(data);
        onSuccess();
      } catch (error) {
        onError(error as TError);
      }
    },
    isLoading: false
  })
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key
  })
}));

describe('SiteForm', () => {
  const defaultProps = {
    onCancel: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders form with default values', () => {
    render(<SiteForm {...defaultProps} />);

    expect(screen.getByLabelText('form name input')).toBeInTheDocument();
    expect(screen.getByText('Enable link access')).toBeInTheDocument();
    expect(screen.getByLabelText('form link access select')).toBeInTheDocument();
  });

  it('handles name input change', async () => {
    render(<SiteForm {...defaultProps} />);

    const nameInput = screen.getByLabelText('form name input');
    await userEvent.type(nameInput, 'test-site');

    expect(nameInput).toHaveValue('test-site');
  });

  it('submits form with correct data', async () => {
    mockCreateOrUpdateSite.mockResolvedValue({});

    render(<SiteForm {...defaultProps} />);

    // Fill form
    await userEvent.type(screen.getByLabelText('form name input'), 'test-site');
    await userEvent.click(screen.getByText('Submit'));

    expect(RESTApi.createOrUpdateSite).toHaveBeenCalled();
    const callArg = mockCreateOrUpdateSite.mock.calls[0][0];
    expect(callArg.metadata.name).toBe('test-site');
  });

  it('handles link access toggle', async () => {
    render(<SiteForm {...defaultProps} />);

    const checkbox = screen.getByText('Enable link access');
    const select = screen.getByLabelText('form link access select');

    expect(select).toBeEnabled();

    await userEvent.click(checkbox);
    expect(select).toBeDisabled();

    await userEvent.click(checkbox);
    expect(select).toBeEnabled();
  });

  it('disables submit button when name is empty', () => {
    render(<SiteForm {...defaultProps} />);

    const nameInput = screen.getByLabelText('form name input');
    const submitButton = screen.getByText('Submit');

    fireEvent.change(nameInput, { target: { value: '' } });
    expect(submitButton).toBeDisabled();

    fireEvent.change(nameInput, { target: { value: 'test' } });
    expect(submitButton).not.toBeDisabled();
  });

  it('shows error message when API call fails', async () => {
    const errorMessage = 'API Error';
    mockCreateOrUpdateSite.mockRejectedValue({
      descriptionMessage: errorMessage
    });

    render(<SiteForm {...defaultProps} />);

    await userEvent.type(screen.getByLabelText('form name input'), 'test-site');
    await userEvent.click(screen.getByText('Submit'));

    await waitFor(() => {
      expect(screen.getByText('An error occurred')).toBeInTheDocument();
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  it('calls onCancel when cancel button is clicked', async () => {
    render(<SiteForm {...defaultProps} />);

    await userEvent.click(screen.getByText('Cancel'));
    expect(defaultProps.onCancel).toHaveBeenCalled();
  });

  it('shows advanced options when expanded', async () => {
    render(
      <SiteForm
        {...defaultProps}
        show={{
          serviceAccount: true,
          ha: true,
          name: true
        }}
      />
    );

    await userEvent.click(screen.getByText('Show more'));

    expect(screen.getByLabelText('form service account input')).toBeInTheDocument();
    expect(screen.getByLabelText('form ha checkbox')).toBeInTheDocument();
  });

  it('updates form with initial values', () => {
    const initialProps = {
      ...defaultProps,
      siteName: 'initial-site',
      linkAccess: 'loadbalancer',
      serviceAccount: 'test-account',
      ha: true
    };

    render(<SiteForm {...initialProps} />);

    expect(screen.getByLabelText('form name input')).toHaveValue('initial-site');
    expect(screen.getByLabelText('form name input')).toBeDisabled();
    expect(screen.getByLabelText('form link access select')).toHaveValue('loadbalancer');
  });
});
