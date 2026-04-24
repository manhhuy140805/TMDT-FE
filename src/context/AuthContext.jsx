import { createContext, useMemo, useState } from 'react'

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)

  const login = (userPayload) => {
    setCurrentUser(userPayload)
  }

  const logout = () => {
    setCurrentUser(null)
  }

  const contextValue = useMemo(
    () => ({
      currentUser,
      isAuthenticated: Boolean(currentUser),
      login,
      logout,
    }),
    [currentUser],
  )

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
}
