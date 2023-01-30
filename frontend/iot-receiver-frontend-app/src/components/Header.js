// Author: Oskari Niskanen
import React, { useState } from 'react'
import { slide as Menu } from 'react-burger-menu'
import { Link } from 'react-router-dom'
import { Flex } from '@tremor/react'
import { useAuth } from '../common/AuthProvider'
const { HuldIcon } = require('./HuldIcon')

export const Header = () => {
  const [isOpen, setOpen] = useState(false)
  const { user, handleLogout } = useAuth()

  const handleIsOpen = () => {
    setOpen(!isOpen)
  }

  const closeSideBar = () => {
    setOpen(false)
  }

  const logOut = () => {
    closeSideBar()
    handleLogout()
  }

  return (
    <nav className="bg-huld-sky-blue w-full border-b md:border-0 md:static">
      {user && (
        <Menu
          isOpen={isOpen}
          customBurgerIcon={user ? undefined : false}
          onClose={closeSideBar}
          onOpen={handleIsOpen}
        >
          <div>
            <HuldIcon color={'#fff'} />
          </div>
          <Link className="menu-item" to={'/'} onClick={closeSideBar}>
            Home
          </Link>
          <Link className="menu-item" to={'/devices'} onClick={closeSideBar}>
            Devices
          </Link>
          <Link className="menu-item" to={'/map'} onClick={closeSideBar}>
            Map
          </Link>
          {user.role === 'admin_user' && (
            <Link className="menu-item" to={'/users'} onClick={closeSideBar}>
              Users
            </Link>
          )}
          <Flex justifyContent="justify-evenly">
            <button
              onClick={logOut}
              className="px-5 ml-4 mb-4 py-2.5 text-white bg-red-600 rounded-md duration-150 hover:bg-red-700 active:shadow-lg"
            >
              Log Out
            </button>
          </Flex>
        </Menu>
      )}
      <div className="items-center px-4 mx-auto  md:px-8">
        <div className="flex items-center py-3 md:py-5 ">
          <div className="ml-20">
            <HuldIcon color={'#fff'} />
          </div>
          <div className="flex-1 flex items-center justify-end space-x-2 sm:space-x-6">
            {user && (
              <p className="text-huld-dark-blue text-xl font-bold">{user.username}</p>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
