import { render, screen } from '@testing-library/react';
import { ContentCard } from '../content-card';
import '@testing-library/jest-dom';

describe('ContentCard', () => {
  const mockContent = {
    id: '1',
    title: 'Test Content',
    description: 'This is a test content',
    type: 'ARTICLE' as const,
    category: {
      name: 'Pregnancy',
      slug: 'pregnancy',
    },
    difficulty: 'BEGINNER' as const,
    duration: 5,
    viewCount: 0,
    averageRating: null,
    thumbnailUrl: '/test-thumbnail.jpg',
    author: {
      name: 'Test User',
      image: null,
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  it('renders content card with correct information', () => {
    render(<ContentCard content={mockContent} />);
    
    // Check if title is rendered
    expect(screen.getByText('Test Content')).toBeInTheDocument();
    
    // Check if description is rendered
    expect(screen.getByText('This is a test content')).toBeInTheDocument();
    
    // Check if category is rendered
    expect(screen.getByText('Pregnancy')).toBeInTheDocument();
    
    // Check if difficulty is rendered (case-insensitive, text is lowercase with CSS capitalization)
    expect(screen.getByText(/beginner/i)).toBeInTheDocument();
    
    // Check if duration is rendered
    expect(screen.getByText('5 min read')).toBeInTheDocument();
  });

  it('renders with default values when optional props are not provided', () => {
    const { container } = render(
      <ContentCard 
        content={{
          ...mockContent,
          description: null,
          duration: null,
        }} 
      />
    );
    
    // Check if default description is shown
    expect(container.querySelector('p.text-muted-foreground')).toHaveTextContent('No description available');
    
    // Check if duration is not shown when not provided
    expect(screen.queryByText('min read')).not.toBeInTheDocument();
  });
});
