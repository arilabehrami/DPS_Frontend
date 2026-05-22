import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { ProtectedRoute } from '../components/ProtectedRoute'
import { AppLayout } from '../components/layout/AppLayout'
import { ROLES } from '../utils/constants'
import { Login } from '../pages/Login'
import { Register } from '../pages/Register'
import { Dashboard } from '../pages/Dashboard'
import { Employees } from '../pages/Employees'
import { EmployeeDetails } from '../pages/EmployeeDetails'
import { AIChat } from '../pages/AIChat'
import { ChatHistory } from '../pages/ChatHistory'
import { Search } from '../pages/Search'
import { Settings } from '../pages/Settings'
import { Profile } from '../pages/Profile'
import { Notifications } from '../pages/Notifications'

export function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<Navigate to="/login" replace />} />

        <Route
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/employees" element={<Employees />} />
          <Route path="/employees/:id" element={<EmployeeDetails />} />
          <Route path="/ai-chat" element={<AIChat />} />
          <Route path="/history" element={<ChatHistory />} />
          <Route path="/search" element={<Search />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/profile" element={<Profile />} />
          <Route
            path="/settings"
            element={
              <ProtectedRoute roles={[ROLES.ADMIN, ROLES.EMPLOYEE]}>
                <Settings />
              </ProtectedRoute>
            }
          />
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
