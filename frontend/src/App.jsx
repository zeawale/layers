import { Route, Routes } from 'react-router-dom'

import AppLayout from './components/AppLayout.jsx'
import AddItem from './pages/AddItem.jsx'
import EditItem from './pages/EditItem.jsx'
import ForgotPassword from './pages/ForgotPassword.jsx'
import History from './pages/History.jsx'
import ItemDetails from './pages/ItemDetails.jsx'
import Login from './pages/Login.jsx'
import Onboarding from './pages/Onboarding.jsx'
import Profile from './pages/Profile.jsx'
import CityEdit from './pages/profile/CityEdit.jsx'
import ColorsEdit from './pages/profile/ColorsEdit.jsx'
import EditLayout from './pages/profile/EditLayout.jsx'
import NameEdit from './pages/profile/NameEdit.jsx'
import PasswordChange from './pages/profile/PasswordChange.jsx'
import StyleEdit from './pages/profile/StyleEdit.jsx'
import Register from './pages/Register.jsx'
import ResetPassword from './pages/ResetPassword.jsx'
import Start from './pages/Start.jsx'
import Today from './pages/Today.jsx'
import Wardrobe from './pages/Wardrobe.jsx'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Start />} />

      {/* Экраны без нижней панели */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/onboarding" element={<Onboarding />} />
      <Route path="/wardrobe/new" element={<AddItem />} />
      <Route path="/wardrobe/:id" element={<ItemDetails />} />
      <Route path="/wardrobe/:id/edit" element={<EditItem />} />

      {/* Правка профиля (4.3–4.7): без нижней панели, со стрелкой «назад» */}
      <Route element={<EditLayout />}>
        <Route path="/profile/name" element={<NameEdit />} />
        <Route path="/profile/city" element={<CityEdit />} />
        <Route path="/profile/style" element={<StyleEdit />} />
        <Route path="/profile/colors" element={<ColorsEdit />} />
        <Route path="/profile/password" element={<PasswordChange />} />
      </Route>

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
