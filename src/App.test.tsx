import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders CommuniTree title', () => {
  render(<App />);
  const titleElement = screen.getByText(/CommuniTree/i);
  expect(titleElement).toBeInTheDocument();
});

test('renders welcome message', () => {
  render(<App />);
  const welcomeElement = screen.getByText(/Welcome to CommuniTree/i);
  expect(welcomeElement).toBeInTheDocument();
});

test('renders track indicators', () => {
  render(<App />);
  const impactTrack = screen.getByText(/Impact Track - Community Service/i);
  const growTrack = screen.getByText(/Grow Track - Local Entertainment/i);
  expect(impactTrack).toBeInTheDocument();
  expect(growTrack).toBeInTheDocument();
});