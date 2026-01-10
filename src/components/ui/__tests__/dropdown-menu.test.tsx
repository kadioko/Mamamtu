import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '../dropdown-menu';

describe('DropdownMenu UI component', () => {
  it('toggles content visibility when trigger is clicked', () => {
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Open menu</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Item 1</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );

    // Closed by default
    expect(screen.queryByText('Item 1')).not.toBeInTheDocument();

    // Open on first click
    fireEvent.click(screen.getByRole('button', { name: /open menu/i }));
    expect(screen.getByText('Item 1')).toBeInTheDocument();

    // Close on second click
    fireEvent.click(screen.getByRole('button', { name: /open menu/i }));
    expect(screen.queryByText('Item 1')).not.toBeInTheDocument();
  });

  it('aligns content to end when align="end" is provided', () => {
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Open</DropdownMenuTrigger>
        <DropdownMenuContent align="end" data-testid="menu-content">
          <DropdownMenuItem>Item 1</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );

    fireEvent.click(screen.getByRole('button', { name: /open/i }));

    const content = screen.getByTestId('menu-content');
    expect(content).toHaveClass('right-0');
  });

  it('closes menu and calls handler when an item is clicked', () => {
    const onSelect = jest.fn();

    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Open</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={onSelect}>Selectable item</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );

    fireEvent.click(screen.getByRole('button', { name: /open/i }));
    const item = screen.getByRole('button', { name: /selectable item/i });

    fireEvent.click(item);

    expect(onSelect).toHaveBeenCalledTimes(1);
    // Menu content should be closed after selection
    expect(screen.queryByRole('button', { name: /selectable item/i })).not.toBeInTheDocument();
  });

  it('does not call handler or close when item is disabled', () => {
    const onSelect = jest.fn();

    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Open</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem disabled onClick={onSelect}>
            Disabled item
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );

    fireEvent.click(screen.getByRole('button', { name: /open/i }));
    const item = screen.getByRole('button', { name: /disabled item/i });

    fireEvent.click(item);

    expect(onSelect).not.toHaveBeenCalled();
    // Menu should remain open because the disabled item does not close it
    expect(screen.getByRole('button', { name: /disabled item/i })).toBeInTheDocument();
  });

  it('supports asChild trigger that still toggles the menu', () => {
    render(
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button type="button">Custom trigger</button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Content item</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );

    const trigger = screen.getByRole('button', { name: /custom trigger/i });
    fireEvent.click(trigger);

    expect(screen.getByText('Content item')).toBeInTheDocument();
  });
});
