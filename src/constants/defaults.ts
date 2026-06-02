export const DEFAULT_TSX =
`import { useState } from "react";

export default function App() {
  const [isBlue, setIsBlue] = useState(false);

  return <div className="container">
    <div style={{ color: isBlue ? "blue" : "black" }}>
      Hello World
    </div>
    <button
      style={{
        border: "1px solid black",
        borderRadius: "4px",
        padding: "2px 4px",
      }}
      onClick={() => setIsBlue(!isBlue)}
    >
      Change Color
    </button>
  </div>
}
`;

export const DEFAULT_CSS =
`/* CSS Sandbox */

.container {
  display: flex;
  flex-direction: row;
  gap: 20px;
  justify-content: left;
  align-items: center;
  padding: 8px;
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

export const DEFAULT_PYTHON = `# Example: sum of a list
def sum_list(nums: list[int]) -> int:
    total = 0
    for n in nums:
        total += n
    return total

result = sum_list([1, 2, 3, 4, 5])
print("Sum is", result)
`;
