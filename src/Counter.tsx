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
