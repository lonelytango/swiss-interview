export const DEFAULT_TSX =
  `import { useState } from "react";

const Counter = () => {
  const [count, setCount] = useState<number>(0);
  return <div>
    <div>{\`Counter: \${count}\`}</div>
    <button style={{
      padding: "4px",
      border: "1px solid #000000" 
    }} onClick={() => {setCount(count+1)}}>Add Count</button>
  </div>
}

export default function App() {
  return <div className="container">
    <div className="welcome">Welcome to DevView</div>
    <div className="text-3xl font-bold">Tailwind Hello World</div>
    <hr />
    <Counter />
  </div>
}
`;

export const DEFAULT_CSS =
  `/* CSS Sandbox */

.welcome {
  font-weight: bold;
}

.container {
  display: flex;
  flex-direction: column;
  padding: 8px;
}
`;

export const DEFAULT_ALGO = `// Example: sum of array
function sum(arr: number[]): number {
  let total = 0;
  for (const n of arr) total += n;
  return total;
}

// Feel free to change this entrypoint.
function main() {
  const result = sum([1, 2, 3, 4, 5]);
  console.log('Sum is', result);
}

main();
`;

