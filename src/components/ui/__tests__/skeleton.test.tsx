import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Skeleton } from '../skeleton';

describe('Skeleton UI component', () => {
  it('renders with base skeleton classes', () => {
    render(<Skeleton data-testid="skeleton" />);

    const el = screen.getByTestId('skeleton');
    expect(el).toHaveClass('animate-pulse');
    expect(el).toHaveClass('rounded-md');
    expect(el).toHaveClass('bg-muted');
  });

  it('merges additional className values', () => {
    render(<Skeleton data-testid="skeleton" className="h-4 w-4" />);

    const el = screen.getByTestId('skeleton');
    expect(el).toHaveClass('h-4');
    expect(el).toHaveClass('w-4');
  });
});
