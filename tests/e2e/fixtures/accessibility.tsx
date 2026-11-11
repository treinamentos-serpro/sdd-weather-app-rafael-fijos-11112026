import { createRoot } from 'react-dom/client';
import App from '../../../src/App';
import '../../../src/styles.css';

const statuses = ['idle', 'loading', 'success', 'empty', 'error'] as const;
const requestedStatus = new URLSearchParams(window.location.search).get('status');
const initialStatus = statuses.find((status) => status === requestedStatus) ?? 'idle';
const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Elemento raiz da aplicação não encontrado.');
}

createRoot(rootElement).render(<App initialStatus={initialStatus} />);
