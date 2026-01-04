import { TestProvider, useTest } from './context/TestContext';
import { ChatBot } from './components/ChatBot';
import { TestInterface } from './components/TestInterface';
import { Result } from './components/Result';
import { Loading } from './components/Loading';

function AppContent() {
  const { phase } = useTest();

  switch (phase) {
    case 'chat':
      return <ChatBot />;
    case 'loading':
      return <Loading />;
    case 'test':
      return <TestInterface />;
    case 'result':
      return <Result />;
    default:
      return <ChatBot />;
  }
}

function App() {
  return (
    <TestProvider>
      <AppContent />
    </TestProvider>
  );
}

export default App;
