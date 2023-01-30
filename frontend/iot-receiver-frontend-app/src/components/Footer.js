// Author: Oskari Niskanen
import { Link } from 'react-router-dom'
import { useAuth } from '../common/AuthProvider'
const { HuldIcon } = require('./HuldIcon')

export const Footer = () => {
  const { user } = useAuth()
  const footerNavs = [
    {
      href: '/',
      name: 'Home',
      protected: false
    },
    {
      href: '/devices',
      name: 'Devices',
      protected: false
    },
    {
      href: '/map',
      name: 'Map',
      protected: false
    },
    {
      href: '/users',
      name: 'Users',
      protected: true
    }
  ]

  return (
    <footer className="w-full text-white bg-huld-light-blue px-4 py-5 mx-auto">
      <div className="max-w-lg sm:mx-auto sm:text-center content-center">
        <HuldIcon color={'#fff'} />
        {user && <p className="leading-relaxed mt-2 text-[15px]">Quick links</p>}
      </div>
      <ul className="items-center justify-center mt-8 space-y-5 sm:flex sm:space-x-4 sm:space-y-0">
        {user &&
          footerNavs.map(
            (item) =>
              (item.protected === false ||
                (item.protected === true && user.role === 'admin_user')) && (
                <li key={item.name} className="hover:text-white-800">
                  <Link to={item.href}>{item.name}</Link>
                </li>
              )
          )}
      </ul>
    </footer>
  )
}
