// Author: Oskari Niskanen

import React, { useContext, useState, createContext } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import axios from 'axios'
import jwt_decode from 'jwt-decode'

const AuthContext = createContext(null)
// Hook accesses the funuctions from this component.
// Offers login/logout related functionality and user setting.
export const AuthProvider = ({ children }) => {
  const navigate = useNavigate()
  const location = useLocation()

  const [err, setErr] = useState(null)
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState(() => {
    if (localStorage.getItem('tokens')) {
      let tokens = JSON.parse(localStorage.getItem('tokens'))
      return jwt_decode(tokens.accessToken)
    }
    return null
  })

  // Sends login request to server
  const handleLogin = async (payload) => {
    // Emptying any previous error code.
    setErr(null)
    // Calling login endpoint with provided payload (Credentials)
    await axios
      .post('http://localhost:4000/auth/login', payload)
      .then((resp) => {
        // Setting response to local storage via hook.
        localStorage.setItem(
          'tokens',
          // Stringifying json object that contains the tokens.
          JSON.stringify({
            accessToken: resp.data.accessToken,
            refreshToken: resp.data.refreshToken
          })
        )
        // Decoding access token and setting it as user to get access to username and role.
        setUser(jwt_decode(resp.data.accessToken))
        // Getting origin (in case the user was on a different page before login.)
        const origin = location.state?.from?.pathname || '/home'
        // Redirecting user.
        navigate(origin)
      })
      .catch((error) => {
        // If api returned error, we display it in the login form.
        if (error.response) {
          setErr(error.response.data)
        }
      })
      .finally(() => {
        setLoading(false)
      })
  }

  // Function to handle logging out.
  const handleLogout = () => {
    // Removing tokens from local storage.
    localStorage.removeItem('tokens')
    // Emptying user from state.
    setUser(null)
    // Navigating to login page.
    navigate('/login', { replace: true })
  }

  return (
    <AuthContext.Provider value={{ user, handleLogin, handleLogout, loading, err }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  return useContext(AuthContext)
}
