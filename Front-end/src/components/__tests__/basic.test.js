import { render, screen } from '@testing-library/react';

test('basic test setup works', () => {
  render(<div>Test Content</div>);
  expect(screen.getByText('Test Content')).toBeInTheDocument();
});