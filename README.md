# React: How to Test useState (with Examples)

---

I recently had to update an SDK from my company. I made changes and wanted to write test code to make sure it works the way it's intended. Since there is no UI – because it's a context provider component, I needed to test the state changes. However, it doesn't seem that React Testing Library supports testing states directly. After some research, I found out I can test it by mocking the useState function.

In this post, I will show you how I tested it with some code.

---

1. Test State Changes

There are multiple states in the component I needed to test, but only one state has an object type of state so, it is enough to check if a change I expected happened or not. I didn't need to know which state made the change.

Let's see an example.

```typescript
import { useEffect, useState } from 'react';

function Counter() {
  const [cnt, setCnt] = useState(0);
  const [message, setMessage] = useState("Click button please!");

  const increase = () => setCnt((prevCnt) => prevCnt + 1);
  const decrease = () => setCnt((prevCnt) => prevCnt - 1);

  useEffect(() => {
    const isLow = cnt < 0;
    const isHigh = cnt > 10;

    if (isLow) setMessage('Cnt is low');
    else if (isHigh) setMessage('Cnt is high');
    else setMessage("Cnt is a good number");
  }, [cnt]);

  return (
    <>
      <button onClick={increase}>increase</button>
      <button onClick={decrease}>decrease</button>
      <span>{message.toUpperCase()}</span>
    </>
  )
}

export default Counter
```

In this component, when you click the increase or the decrease button, it changes the `cnt` state. Also, the message state changes depending on the `cnt`.

Let's test this compoennt, here is a util function I wrote:j

```typescript
import equal from "fast-deep-equal";
import { vi, } from "vitest";

export const watchStates = () => {
  vi.mock("react", async () => {
    (window as any)['stateChangeHistory'] = [];
    const origin = await vi.importActual<typeof import("react")>("react");

    const addStateChangeHistory = (value: any) => (window as any)['stateChangeHistory'].push(value);

    const useState = vi.fn().mockImplementation(<T extends any>(initialValue: T) => {
      const [value, setter] = origin.useState(initialValue);

      addStateChangeHistory(value);

      return [value, setter];
    })

    return {
      ...origin,
      useState,
    };
  });

  /**
   * Returns true if all the changes are included and the length is the same as state changes
   * */
  const exact = (...args: any) => {
    const stateChangeHistoryCopy = [...(window as any)['stateChangeHistory']];
    clear();

    for (const arg of args.flat()) {
      const index = stateChangeHistoryCopy.findIndex((v: any) => equal(arg, v));
      if (index === -1) return false;
      stateChangeHistoryCopy.splice(index, 1);
    }

    return stateChangeHistoryCopy.length === 0;
  };

  /**
   * Returns true if all the values are included in the state changes
   * */
  const include = (...args: any) => {
    const stateChangeHistoryCopy = [...(window as any)['stateChangeHistory']];
    clear();

    for (const arg of args.flat()) {
      const index = stateChangeHistoryCopy.findIndex((v: any) => equal(arg, v));
      if (index === -1) return false;

      stateChangeHistoryCopy.splice(index, 1);
    }

    return true;
  };

  /**
   * Clear state changes
   * */
  const clear = () => {
    (window as any)['stateChangeHistory'] = [];
  };

  return { clear, exact, include };
};
```

It returns three functions:

- `exact`: : It returns true if all the changes it gets from the parameters are made. If there are more changes apart from the parameters, it will return false.

- `include`: It returns true if all the changes it gets from the parameters are made. It doesn't matter if there are more changes or not.

- `clear`: Clear the history of state changes.

`clear` is called after either `exact` or `include` called – The function names may not be intuitive.

Let's see how to use them. 

When the `Counter` component renders, there are two stage changes.

- `cnt`: 0
- `message`: Clicking button please!

In the state history, there will be [0, 'Click button please!'].

If you use the `exact` function, you should use it like this:

```typescript
exact([0, 'Clicking button please!']); // or it could be ['Clicking button please!', 0];
```

If you use the `include` function, the following lines will be true:

```typescript
include(0);
include('Clicking button please!');
include(['Clicking button please!', 0]);
```

But remember, the `clear` function is called afterwards – or you could simply delete the line not to call the `clear` function.

---

Here's the full test code example for the `Counter` component.

```typescript
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
```

Here is one point. 

```typescript
import { watchStates } from './test/utils/state';
```

This line should be called at the top of the file to mock the `useState` function before the component uses.

---

# 2. Test Stage Changes With Name

The previous example is enough to use for the task I had to deal with. Because the change is unique and there are no other states with the same value.

However, in the real world, states can have the same value. We may want to know the exact state.

Let's see another example.

```typescript
import { useEffect } from 'react';
import { useStateTest } from './test/utils/state';

function Mod() {
  const [cnt, setCnt] = useStateTest(0, "cnt");
  const [modThree, setModThree] = useStateTest(0, "modThree");
  const [modFive, setModFive] = useStateTest(0, "modFive");

  const increase = () => setCnt((prevCnt) => prevCnt + 1);

  useEffect(() => {
    setModThree(cnt % 3);
    setModFive(cnt % 5);
  }, [cnt]);

  return (
    <>
      <button onClick={increase}>increase</button>
      <span>{cnt}</span>
      {<span>{`cnt mod 3 = ${modThree}`}</span>}
      {<span>{`cnt mod 5 = ${modFive}`}</span>}
    </>
  );
}

export default Mod
```

There are three states.

`cnt` is a number.
`modThree` is a number, the same as `cnt % 3`, 
`modFive` is a number, the same as `cnt % 5`.

If we want to know the change of `modThree`, in the previous example, we cannot guarantee it.

To track state changes with a name, I wrote this code at the top of the utility file:

```typescript
export const useStateTest = <T>(initialValue: T, stateName: string) => {
  (window as any)["testStateChangeHistory"] ??= new Map();

  const [value, setter] = React.useState(initialValue);

  (window as any)["testStateChangeHistory"].set(stateName, value);

  return [value, setter] as const;
};

export const watchTestStates = () => {
  const getStateValue = (name: string) => {
    return (window as any)["testStateChangeHistory"].get(name);
  }

  return { getStateValue };
};
```

However, you should use the `useStateTest` function instead of the normal `useState` function.  
Think of it like adding a `data-test-X` attribute to a tag — in that sense, it feels like a reasonable extra step.  

With this utility function, you can test the `Mod` component like this:

```typescript
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
```

---

## Why `window` is used to store the history

When you mock a function, the context is different, which means you can’t access variables from a parent component. 

To make it work, I used the `window` object, which has a global context. 

This way, both `watchStates` and the mock functions can access the same variable.

---

This is it.

https://github.com/hsk-kr/react-use-state-test

You can find the full code from this repository.

I hope you found it helpful.

Happy Coding!
