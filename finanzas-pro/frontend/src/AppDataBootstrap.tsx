import { AppDataProvider } from './state/AppDataContext';
import App from './App';

export default function AppDataBootstrap() {
  return <AppDataProvider><App /></AppDataProvider>;
}
