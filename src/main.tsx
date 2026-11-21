import { createRoot } from 'react-dom/client';

const container = document.getElementById('root');

if (!container) {
  throw new Error('React root is missing from index.html');
}

createRoot(container).render(
  <main>
    <h1>Hackathon Starter</h1>
    <p>The starter is running.</p>
  </main>,
);
