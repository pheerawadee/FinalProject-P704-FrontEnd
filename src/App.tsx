// App.tsx
import React from 'react';
import Heatmap from './table';
import FirstSemester from './FirstSemester';

const App: React.FC = () => {
  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  };

  return (
    <div style={containerStyle}>
      <h1 className="text-2xl font-bold text-black text-center mt-4 mb-8">CMU Traffic</h1>

      {/* Commented out the toggle button */}
      {/* <button
        className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4`}
        onClick={handleToggleSemester}
      >
        {showSemesterView ? 'Hide Semester View' : 'Show Semester View'}
      </button> */}

      {/* Commented out the conditional rendering of components based on the state */}
      {/* {showSemesterView ? <FirstSemester /> : <Heatmap />} */}

      {/* Render Heatmap component by default */}
      <Heatmap />
    </div>
  );
};

export default App;
