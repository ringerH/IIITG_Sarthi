import { render, screen } from '@testing-library/react';

// Test if components can be imported at all
describe('Component Imports', () => {
  test('Can import Home component', () => {
    const Home = require('../Home').default;
    expect(Home).toBeDefined();
    expect(typeof Home).toBe('function');
  });

  test('Can import RideList component', () => {
    const RideList = require('../RideList').default;
    expect(RideList).toBeDefined();
    expect(typeof RideList).toBe('function');
  });

  test('Can import CreatePost component', () => {
    const CreatePost = require('../CreatePost').default;
    expect(CreatePost).toBeDefined();
    expect(typeof CreatePost).toBe('function');
  });
});