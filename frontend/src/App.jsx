import { Routes, Route } from "react-router-dom";

function App() {
  return (
    <Routes>
      <Route path="/" element={<div className="p-10 text-cyan-500 text-2xl font-bold">User Side</div>} />
      <Route path="/analyst" element={<div className="p-10 text-cyan-500 text-2xl font-bold">Analyst Side</div>} />
    </Routes>
  );
}

export default App;