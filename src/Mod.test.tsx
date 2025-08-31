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
  expect(getStateValue('modThree')).toBe(0);
  expect(getStateValue('modFive')).toBe(0);
});

test('Mod changes depending on cnt', () => {
  const { getStateValue } = watchTestStates();
  const { getByText } = render(<Mod />)

  expect(getStateValue('cnt')).toBe(0);
  expect(getStateValue('modThree')).toBe(0);
  expect(getStateValue('modFive')).toBe(0);

  const increaseBtn = getByText(/increase/);

  act(() => {
    fireEvent.click(increaseBtn);
  });
  expect(getStateValue('cnt')).toBe(1);
  expect(getStateValue('modThree')).toBe(1);
  expect(getStateValue('modFive')).toBe(1);

  act(() => {
    fireEvent.click(increaseBtn);
  });
  expect(getStateValue('cnt')).toBe(2);
  expect(getStateValue('modThree')).toBe(2);
  expect(getStateValue('modFive')).toBe(2);

  act(() => {
    fireEvent.click(increaseBtn);
  });
  expect(getStateValue('cnt')).toBe(3);
  expect(getStateValue('modThree')).toBe(0);
  expect(getStateValue('modFive')).toBe(3);
});

afterEach(() => {
  cleanup();
});
