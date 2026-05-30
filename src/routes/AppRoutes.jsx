import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { ProtectedRoute } from '../components/ProtectedRoute'
import { AppLayout } from '../components/layout/AppLayout'
import { ROLES } from '../utils/constants'
import { Login } from '../pages/Login'
import { Register } from '../pages/Register'
import { VerifyAccount } from '../pages/VerifyAccount'
import { ForgotPasswordRequest } from '../pages/ForgotPasswordRequest'
import { ForgotPasswordVerify } from '../pages/ForgotPasswordVerify'
import { ResetPassword } from '../pages/ResetPassword'
import { Dashboard } from '../pages/Dashboard'
import { Employees } from '../pages/Employees'
import { EmployeeDetails } from '../pages/EmployeeDetails'
import { AIChat } from '../pages/AIChat'
import { ChatHistory } from '../pages/ChatHistory'
import { Settings } from '../pages/Settings'
import { Profile } from '../pages/Profile'
import { Notifications } from '../pages/Notifications'
import { Clients } from '../pages/Clients'
import { Messages } from '../pages/Messages'

export function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-account" element={<VerifyAccount />} />
        <Route path="/forgot-password" element={<ForgotPasswordRequest />} />
        <Route path="/forgot-password/verify" element={<ForgotPasswordVerify />} />
        <Route path="/forgot-password/reset" element={<ResetPassword />} />
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
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/profile" element={<Profile />} />
          <Route
            path="/clients"
            element={
              <ProtectedRoute roles={[ROLES.ADMIN, ROLES.EMPLOYEE]}>
                <Clients />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute roles={[ROLES.ADMIN, ROLES.EMPLOYEE, ROLES.CLIENT]}>
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
