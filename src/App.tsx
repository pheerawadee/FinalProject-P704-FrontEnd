// App.tsx
import React from 'react';
import Heatmap from './table';

const App: React.FC = () => {
  return (
    <div className="container mx-auto">
      <h1 className="text-2xl font-bold text-center mt-4 mb-8">CMU Traffic</h1>
      <Heatmap />
    </div>
  );
};

export default App;
