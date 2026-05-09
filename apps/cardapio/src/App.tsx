import "./App.css";
import { Button } from "@repo/ui";
import type { Teste } from '@repo/schemas/';

function App() {
  const nomes: Teste[] = [
    { name: 'denisson' },
    { name: 'pereira '}
  ]

  return (
    <div>
      <Button />
      {nomes.map((item) => (
        <p>{item.name}</p>
      ))}
    </div>
  );
}

export default App;