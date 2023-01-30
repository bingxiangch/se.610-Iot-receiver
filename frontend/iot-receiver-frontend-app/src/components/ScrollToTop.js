// Authors: Michel Leermakers
import { useLocation } from 'react-router-dom'
import { useEffect } from 'react'

export default function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    document.documentElement.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth'
    })
  }, [pathname])

  return null
}
