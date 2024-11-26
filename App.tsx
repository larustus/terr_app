// App.tsx

import React from 'react';
import HelloWorldScreen from './src/screens/HelloWorldScreen';
import NumberDisplayScreen from './src/screens/NumberDisplayScreen';
import TerrariumScreen from "./src/screens/TerrariumScreen";
import TerrariumListScreen from "./src/screens/TerrariumListScreen";
import TerrariumRealTimeScreen from "./src/screens/TerrariumRealTimeScreen";
import ReadingScreen from "./src/screens/ReadingScreen";
import ReadingUpdate from "./src/screens/ReadingUpdate";
import MultiTerrariumScreen from "./src/screens/MultiTerrariumScreen";

const App: React.FC = () => {
  return <MultiTerrariumScreen />;
};

export default App;
