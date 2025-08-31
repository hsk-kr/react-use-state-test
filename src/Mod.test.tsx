import { watchTestStates } from './test/utils/state';// it must be placed at the top of the file
import { afterEach, expect, test } from 'vitest'
import Mod from './Mod';
import { render, fireEvent, cleanup, act } from '@testing-library/react'

test('renders Mod', async () => {
  const { getByText } = render(<Mod />)

  expect(getByText('increase')).toBeInTheDocument();
});

test('Mod initial values', () => {
  const { getStateValue } = watchTestStates();

  expect(getStateValue('cnt')).toBe(0);
  expect(getStateValue('mod')).toEqual({ 3: 0, 5: 0, 7: 0 });
});

test('Mod changes depending on cnt', () => {
  const { getStateValue } = watchTestStates();
  const { getByText } = render(<Mod />)

  expect(getStateValue('cnt')).toBe(0);
  expect(getStateValue('mod')).toEqual({ 3: 0, 5: 0, 7: 0 });

  const increaseBtn = getByText(/increase/);

  act(() => {
    fireEvent.click(increaseBtn);
  });
  expect(getStateValue('cnt')).toBe(1);
  expect(getStateValue('mod')).toEqual({ 3: 1, 5: 1, 7: 1 });

  act(() => {
    fireEvent.click(increaseBtn);
  });
  expect(getStateValue('cnt')).toBe(2);
  expect(getStateValue('mod')).toEqual({ 3: 2, 5: 2, 7: 2 });

  act(() => {
    fireEvent.click(increaseBtn);
  });
  expect(getStateValue('cnt')).toBe(3);
  expect(getStateValue('mod')).toEqual({ 3: 0, 5: 3, 7: 3 });
});

afterEach(() => {
  cleanup();
});
