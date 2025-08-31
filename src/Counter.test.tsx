import { watchStates } from './test/utils/state'; // it must be placed at the top of the file
import { afterEach, expect, test } from 'vitest'
import Counter from './Counter';
import { render, fireEvent, cleanup, act } from '@testing-library/react'

test('renders Counter', async () => {
  const { getByText } = render(<Counter />)

  expect(getByText('CNT IS A GOOD NUMBER')).toBeInTheDocument();
})

test('increase button increases cnt', () => {
  const { include } = watchStates();
  const { getByText } = render(<Counter />)

  const increaseBtn = getByText(/increase/);

  act(() => {
    fireEvent.click(increaseBtn);
  });

  expect(include(1)).toBe(true);
});


test('increase button decrease cnt', () => {
  const { include } = watchStates();
  const { getByText } = render(<Counter />)

  const decreaseBtn = getByText(/decrease/);

  act(() => {
    fireEvent.click(decreaseBtn);
  });

  expect(include(-1)).toBe(true);
});

test('when cnt is over 10, it should change the message', () => {
  const { include } = watchStates();
  const { getByText } = render(<Counter />)

  expect(include('Click button please!')).toBe(true);

  const increaseBtn = getByText(/increase/);

  act(() => {
    for (let i = 0; i < 11; i++) {
      fireEvent.click(increaseBtn);
    }
  });

  expect(include([11, "Cnt is high"])).toBe(true);
});


test('when cnt is less thna 0, it should change the message', () => {
  const { include } = watchStates();
  const { getByText } = render(<Counter />)

  expect(include('Click button please!')).toBe(true);

  const decreaseBtn = getByText(/decrease/);

  act(() => {
    fireEvent.click(decreaseBtn);
  });

  expect(include([-1, "Cnt is low"])).toBe(true);
});

afterEach(() => {
  cleanup();
});
