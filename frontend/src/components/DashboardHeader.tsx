'use client'

import { useState } from 'react'
import { BellIcon, UserCircleIcon, Cog6ToothIcon } from '@heroicons/react/24/outline'
import { Menu, Transition } from '@headlessui/react'
import { Fragment } from 'react'

export function DashboardHeader() {
  const [notifications] = useState([
    { id: 1, message: 'App "my-app" is now running', time: '2 minutes ago', unread: true },
    { id: 2, message: 'Resource usage is at 85%', time: '1 hour ago', unread: false },
    { id: 3, message: 'New template available: React + TypeScript', time: '3 hours ago', unread: false },
  ])

  const unreadCount = notifications.filter(n => n.unread).length

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <h1 className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                VibeCaaS
              </h1>
            </div>
            <div className="ml-4 text-sm text-gray-500 dark:text-gray-400">
              Container as a Service Platform
            </div>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex space-x-8">
            <a href="#" className="text-gray-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 px-3 py-2 text-sm font-medium">
              Dashboard
            </a>
            <a href="#" className="text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 px-3 py-2 text-sm font-medium">
              Templates
            </a>
            <a href="#" className="text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 px-3 py-2 text-sm font-medium">
              Documentation
            </a>
            <a href="#" className="text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 px-3 py-2 text-sm font-medium">
              Support
            </a>
          </nav>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <Menu as="div" className="relative">
              <Menu.Button className="relative p-2 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300">
                <BellIcon className="h-6 w-6" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </Menu.Button>
              <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <Menu.Items className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                  <div className="p-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                      Notifications
                    </h3>
                    <div className="space-y-2">
                      {notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={`p-3 rounded-lg ${
                            notification.unread
                              ? 'bg-primary-50 dark:bg-primary-900/20 border-l-4 border-primary-500'
                              : 'bg-gray-50 dark:bg-gray-700'
                          }`}
                        >
                          <p className="text-sm text-gray-900 dark:text-white">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {notification.time}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </Menu.Items>
              </Transition>
            </Menu>

            {/* User menu */}
            <Menu as="div" className="relative">
              <Menu.Button className="flex items-center space-x-2 p-2 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300">
                <UserCircleIcon className="h-8 w-8" />
                <span className="hidden md:block text-sm font-medium text-gray-700 dark:text-gray-300">
                  John Doe
                </span>
              </Menu.Button>
              <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <Menu.Items className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                  <div className="py-1">
                    <Menu.Item>
                      {({ active }) => (
                        <a
                          href="#"
                          className={`${
                            active ? 'bg-gray-100 dark:bg-gray-700' : ''
                          } flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300`}
                        >
                          <UserCircleIcon className="h-4 w-4 mr-3" />
                          Profile
                        </a>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
                        <a
                          href="#"
                          className={`${
                            active ? 'bg-gray-100 dark:bg-gray-700' : ''
                          } flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300`}
                        >
                          <Cog6ToothIcon className="h-4 w-4 mr-3" />
                          Settings
                        </a>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
                        <a
                          href="#"
                          className={`${
                            active ? 'bg-gray-100 dark:bg-gray-700' : ''
                          } flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300`}
                        >
                          Sign out
                        </a>
                      )}
                    </Menu.Item>
                  </div>
                </Menu.Items>
              </Transition>
            </Menu>
          </div>
        </div>
      </div>
    </header>
  )
}