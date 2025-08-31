import React from "react";
import equal from "fast-deep-equal";
import { vi, } from "vitest";

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
