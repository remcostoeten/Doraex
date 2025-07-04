import React from 'react';
import HelpWidget from './components/HelpWidget';
import DocumentationWidget from './components/DocumentationWidget';

type TProps = {
  // Add props here when needed
}

function App(props: TProps) {
  return (
    <div>
      <DocumentationWidget />
      <HelpWidget />
    </div>
  );
}

export default App;
