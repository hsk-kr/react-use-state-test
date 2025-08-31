import { useEffect } from 'react';
import { useStateTest } from './test/utils/state';

function Mod() {
  const [cnt, setCnt] = useStateTest(0, "cnt");
  const [mod, setMod] = useStateTest<Record<number, number>>({}, "mod");

  const increase = () => setCnt((prevCnt) => prevCnt + 1);

  useEffect(() => {
    const nums = [3, 5, 7];
    const newMod = nums.reduce((newMod, num) => {
      newMod[num] = cnt % num;
      return newMod;
    }, {} as Record<number, number>);

    setMod(newMod);
  }, [cnt]);

  return (
    <>
      <button onClick={increase}>increase</button>
      <span>{cnt}</span>
      {mod[3] && <span>{`cnt mod 3 = ${mod[3]}`}</span>}
      {mod[5] && <span>{`cnt mod 5 = ${mod[5]}`}</span>}
      {mod[7] && <span>{`cnt mod 7 = ${mod[7]}`}</span>}
    </>
  );
}

export default Mod
