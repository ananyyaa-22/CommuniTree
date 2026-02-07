import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders CommuniTree title', () => {
  render(<App />);
  const titleElement = screen.getByRole('heading', { level: 1, name: /CommuniTree/i });
  expect(titleElement).toBeInTheDocument();
});