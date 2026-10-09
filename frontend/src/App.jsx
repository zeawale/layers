import { Route, Routes } from 'react-router-dom'

import AppLayout from './components/AppLayout.jsx'
import History from './pages/History.jsx'
import Home from './pages/Home.jsx'
import Login from './pages/Login.jsx'
import Onboarding from './pages/Onboarding.jsx'
import Profile from './pages/Profile.jsx'
import Register from './pages/Register.jsx'
import Today from './pages/Today.jsx'
import Wardrobe from './pages/Wardrobe.jsx'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />

      {/* Экраны без нижней панели */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/onboarding" element={<Onboarding />} />

      {/* Экраны внутри приложения: у всех общая обёртка с нижней панелью */}
      <Route element={<AppLayout />}>
        <Route path="/today" element={<Today />} />
        <Route path="/wardrobe" element={<Wardrobe />} />
        <Route path="/history" element={<History />} />
        <Route path="/profile" element={<Profile />} />
      </Route>
    </Routes>
  )
}
