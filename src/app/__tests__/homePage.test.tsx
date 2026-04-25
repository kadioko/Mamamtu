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

    expect(screen.getByText(/your partner in/i)).toBeInTheDocument();
    expect(
      screen.getByText(/comprehensive healthcare management for mothers and newborns/i),
    ).toBeInTheDocument();
  });

  it('renders primary CTA buttons with correct links', () => {
    render(<Home />);

    const getStartedLink = screen.getByRole('link', { name: /get started free/i });
    const signInLink = screen.getByRole('link', { name: /sign in/i });

    expect(getStartedLink).toHaveAttribute('href', '/auth/register');
    expect(signInLink).toHaveAttribute('href', '/auth/signin');
  });

  it('renders feature cards for appointments, records, and support', () => {
    render(<Home />);

    expect(screen.getByText(/easy appointments/i)).toBeInTheDocument();
    expect(
      screen.getByText(/access complete medical history/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/smart notifications/i)).toBeInTheDocument();
  });
});
