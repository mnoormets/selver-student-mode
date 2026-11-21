import { createRoot } from 'react-dom/client';
import { StudentMode } from './features/student-mode/StudentMode';

const container = document.getElementById('root');

if (!container) {
  throw new Error('React root is missing from index.html');
}

createRoot(container).render(<StudentMode />);
