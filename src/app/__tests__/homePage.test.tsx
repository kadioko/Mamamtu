import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Home from '../page';

// Simple next/link mock to render as a standard anchor
jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ href, children, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

describe('Home page', () => {
  it('renders hero title and description', () => {
    render(<Home />);

    expect(screen.getByText(/welcome to/i)).toBeInTheDocument();
    expect(
      screen.getByText(/comprehensive healthcare management for mothers and newborns/i),
    ).toBeInTheDocument();
  });

  it('renders primary CTA buttons with correct links', () => {
    render(<Home />);

    const getStartedLink = screen.getByRole('link', { name: /get started/i });
    const signInLink = screen.getByRole('link', { name: /sign in/i });

    expect(getStartedLink).toHaveAttribute('href', '/auth/register');
    expect(signInLink).toHaveAttribute('href', '/auth/signin');
  });

  it('renders feature cards for appointments, records, and support', () => {
    render(<Home />);

    expect(screen.getByText(/easy appointments/i)).toBeInTheDocument();
    expect(
      screen.getByText(/access your health records and track your medical history in one place/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/24\/7 support/i)).toBeInTheDocument();
  });
});
