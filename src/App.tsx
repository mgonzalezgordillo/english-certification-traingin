import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { MainLayout } from './layouts/MainLayout';
import { initializeDatabase } from './lib/db';
import Home from './pages/Home';
import Vocabulary from './pages/Vocabulary';
import Training from './pages/Training';
import Reading from './pages/Reading';
import Grammar from './pages/Grammar';
import GrammarPractice from './pages/GrammarPractice';
import LinguaskillHome from './pages/Linguaskill';
import ExamSession from './pages/Linguaskill/ExamSession';
import ExamResults from './pages/Linguaskill/ExamResults';
import Listening from './pages/Listening';
import Speaking from './pages/Speaking';
import Writing from './pages/Writing';
import Progress from './pages/Progress';

function App() {
  useEffect(() => {
    initializeDatabase().catch(console.error);
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="entrenar" element={<Training />} />
          <Route path="vocabulario" element={<Vocabulary />} />
          <Route path="gramatica" element={<Grammar />} />
          <Route path="gramatica/practica" element={<GrammarPractice />} />
          <Route path="reading" element={<Reading />} />
          <Route path="listening" element={<Listening />} />
          <Route path="speaking" element={<Speaking />} />
          <Route path="writing" element={<Writing />} />
          <Route path="linguaskill" element={<LinguaskillHome />} />
          <Route path="linguaskill/session/:stateId" element={<ExamSession />} />
          <Route path="linguaskill/results/:stateId" element={<ExamResults />} />
          <Route path="progreso" element={<Progress />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
