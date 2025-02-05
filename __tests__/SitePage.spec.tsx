import React from 'react';

import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import SitePage from '../src/console/pages/SitePage';

const mockUseWatchedSkupperResource = vi.hoisted(() => vi.fn());

vi.mock('../src/console/hooks/useSkupperWatchResource', () => ({
  useWatchedSkupperResource: mockUseWatchedSkupperResource
}));

vi.mock('../src/console/pages/tabs/Connectors/Connectors', () => {
  const Connectors: React.FC = function () {
    return <div data-testid="connectors">Connectors</div>;
  };

  return { default: Connectors };
});

vi.mock('../src/console/pages/tabs/Listeners/Listeners', () => {
  const Listeners: React.FC = function () {
    return <div data-testid="listeners">Listeners</div>;
  };

  return { default: Listeners };
});

vi.mock('../src/console/pages/tabs/YAML', () => {
  const YAML: React.FC = function () {
    return <div data-testid="yaml">YAML</div>;
  };

  return { default: YAML };
});

vi.mock('../src/console/pages/components/AlertStatus', () => {
  const AlertStatus: React.FC = function () {
    return <div data-testid="alert-status">Alert Status</div>;
  };

  return { default: AlertStatus };
});

vi.mock('../src/console/pages/tabs/Details/Details', () => ({
  default: ({ onGoTo }: { onGoTo: (index: number) => void }) => (
    <div data-testid="details">
      <button data-testid="goto-button" onClick={() => onGoTo(2)}>
        Navigate
      </button>
    </div>
  )
}));

vi.mock('../src/console/pages/tabs/GetStarted', () => {
  const GetStarted: React.FC = function () {
    return <div data-testid="get-started">Get Started</div>;
  };

  return { default: GetStarted };
});

vi.mock('../src/console/pages/tabs/Links/Links', () => {
  const Links: React.FC = function () {
    return <div data-testid="links">Links</div>;
  };

  return { default: Links };
});

describe('SitePage', () => {
  const mockSiteId = 'test-site-123';

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseWatchedSkupperResource.mockReturnValue({
      data: []
    });
  });

  it('renders the component with initial tab', () => {
    render(<SitePage siteId={mockSiteId} />);
    expect(screen.getByTestId('alert-status')).toBeInTheDocument();
    expect(screen.getByTestId('get-started')).toBeInTheDocument();
  });

  it('switches tabs when clicked', () => {
    render(<SitePage siteId={mockSiteId} />);

    fireEvent.click(screen.getByText('DetailsTab'));
    expect(screen.getByTestId('details')).toBeInTheDocument();

    fireEvent.click(screen.getByText('YamlTab'));
    expect(screen.getByTestId('yaml')).toBeInTheDocument();
  });

  it('disables tabs when site is not configured', () => {
    mockUseWatchedSkupperResource.mockReturnValue({
      data: [
        {
          isConfigured: false
        }
      ]
    });

    render(<SitePage siteId={mockSiteId} />);

    const getStartedTab = screen.getByText('GetStartedTab').closest('button');
    const linksTab = screen.getByText('LinksTab').closest('button');
    const listenersTab = screen.getByText('ListenersTab').closest('button');
    const connectorsTab = screen.getByText('ConnectorsTab').closest('button');

    expect(getStartedTab).toHaveAttribute('aria-disabled', 'true');
    expect(linksTab).toHaveAttribute('aria-disabled', 'true');
    expect(listenersTab).toHaveAttribute('aria-disabled', 'true');
    expect(connectorsTab).toHaveAttribute('aria-disabled', 'true');
  });

  it('enables tabs when site is configured', () => {
    mockUseWatchedSkupperResource.mockReturnValue({
      data: [
        {
          isConfigured: true
        }
      ]
    });

    render(<SitePage siteId={mockSiteId} />);

    const getStartedTab = screen.getByText('GetStartedTab').closest('button');
    const linksTab = screen.getByText('LinksTab').closest('button');
    const listenersTab = screen.getByText('ListenersTab').closest('button');
    const connectorsTab = screen.getByText('ConnectorsTab').closest('button');

    expect(getStartedTab).not.toHaveAttribute('aria-disabled', 'true');
    expect(linksTab).not.toHaveAttribute('aria-disabled', 'true');
    expect(listenersTab).not.toHaveAttribute('aria-disabled', 'true');
    expect(connectorsTab).not.toHaveAttribute('aria-disabled', 'true');
  });

  it('handles error state correctly', () => {
    mockUseWatchedSkupperResource.mockReturnValue({
      data: [
        {
          hasError: true
        }
      ]
    });

    render(<SitePage siteId={mockSiteId} />);
    expect(screen.getByTestId('alert-status')).toBeInTheDocument();
  });

  it('calls handleTabClick function through Details onGoTo prop', () => {
    render(<SitePage siteId={mockSiteId} />);

    fireEvent.click(screen.getByText('DetailsTab'));
    fireEvent.click(screen.getByTestId('goto-button'));

    expect(screen.getByTestId('yaml')).toBeInTheDocument();
  });
});
