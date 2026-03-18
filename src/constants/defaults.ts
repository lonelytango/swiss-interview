export const DEFAULT_TSX =
`import { useState, useEffect } from "react";

const Counter = () => {
  const [count, setCount] = useState<number>(0);

  useEffect(() => {
    console.log(\`Count: \${count}\`);
  }, [count]);

  return <div>
    <div>{\`Counter: \${count}\`}</div>
    <button style={{
      border: "1px solid #000000",
      borderRadius: "8px",
      padding: "2px 8px",
    }} onClick={() => {setCount(count+1)}}>Add Count</button>
  </div>
}

export default function App() {
  return <div className="container">
    <div className="welcome">Welcome to Frontend Interview Sandbox</div>
    <div className="works">CSS class works</div>
    <div className="text-xl font-bold text-red-800">Tailwind works</div>
    <hr />
    <Counter />
  </div>
}
`;

export const DEFAULT_CSS =
`/* CSS Sandbox */

.container {
  display: flex;
  flex-direction: column;
  padding: 8px;
}

.welcome {
  font-weight: bold;
  font-size: 24px;
}

.works {
  font-weight: bold;
  font-size: 24px;
  color: red;
}
`;

export const DEFAULT_ALGO = `// Example: sum of array
// Function definition
function sum(arr: number[]): number {
  let total = 0;
  for (const n of arr) total += n;
  return total;
}

// Function execution
const result = sum([1, 2, 3, 4, 5]);
console.log('Sum is', result);
`;
