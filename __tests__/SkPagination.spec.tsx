import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';

import SkPagination from '../src/console/core/components/SkTable/SkPagination';

describe('SkPagination', () => {
  const defaultProps = {
    totalRow: 100,
    paginationSize: 10,
    currentPageNumber: 1
  };

  it('renders with default props', () => {
    const { container } = render(<SkPagination {...defaultProps} />);

    // Find by class names
    const toggleText = container.querySelector('.pf-v5-c-menu-toggle__text');
    expect(toggleText).toBeInTheDocument();
    expect(toggleText?.textContent).toContain('1 - 10');
    expect(toggleText?.textContent).toContain('100');
  });

  it('renders in compact mode when isCompact is true', () => {
    const { container } = render(<SkPagination {...defaultProps} isCompact={true} />);

    expect(container.querySelector('.pf-m-compact')).toBeInTheDocument();
  });

  it('updates with new props', () => {
    const { container, rerender } = render(<SkPagination {...defaultProps} />);

    let toggleText = container.querySelector('.pf-v5-c-menu-toggle__text');
    expect(toggleText?.textContent).toContain('1 - 10');
    expect(toggleText?.textContent).toContain('100');

    rerender(<SkPagination {...defaultProps} totalRow={200} paginationSize={20} currentPageNumber={2} />);

    toggleText = container.querySelector('.pf-v5-c-menu-toggle__text');
    expect(toggleText?.textContent).toContain('21 - 40');
    expect(toggleText?.textContent).toContain('200');
  });

  it('renders within panel structure', () => {
    const { container } = render(<SkPagination {...defaultProps} />);

    expect(container.querySelector('.pf-v5-c-panel')).toBeInTheDocument();
    expect(container.querySelector('.pf-v5-c-panel__main')).toBeInTheDocument();
    expect(container.querySelector('.pf-v5-c-panel__main-body')).toBeInTheDocument();
  });

  it('handles undefined callback functions', async () => {
    const { container } = render(<SkPagination {...defaultProps} />);

    // Should not throw errors when callbacks are not provided
    const nextButton = container.querySelector('.pf-v5-c-pagination__nav button:last-child');
    if (nextButton) {
      await userEvent.click(nextButton);
    }

    const perPageToggle = container.querySelector('.pf-v5-c-menu-toggle__button');
    if (perPageToggle) {
      await userEvent.click(perPageToggle);
      const perPageOption = container.querySelector('.pf-v5-c-menu__list-item:nth-child(2) button');
      if (perPageOption) {
        await userEvent.click(perPageOption);
      }
    }
  });
});
