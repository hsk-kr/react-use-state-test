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
