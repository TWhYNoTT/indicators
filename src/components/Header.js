// src/components/Header.js
import React from 'react';
import { useAuth } from '../context/AuthContext';
import { FiMenu, FiBell, FiUser, FiLogOut } from 'react-icons/fi';

const Header = ({ toggleSidebar }) => {
    const { currentUser, logout } = useAuth();

    return (
        <header className="bg-white shadow-sm h-16 flex items-center px-4 md:px-6">
            <button
                onClick={toggleSidebar}
                className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 md:hidden"
            >
                <FiMenu className="h-6 w-6" />
            </button>

            <div className="flex-1">
                <h1 className="text-xl font-semibold text-gray-800 md:ml-2">
                    WhatsApp Management
                </h1>
            </div>

            <div className="flex items-center space-x-4">
                {/* <button className="p-2 rounded-full text-gray-400 hover:text-gray-500 hover:bg-gray-100 relative">
                    <FiBell className="h-6 w-6" />
                    <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500"></span>
                </button> */}

                <div className="relative">
                    <div className="flex items-center space-x-2 cursor-pointer p-2 rounded-full hover:bg-gray-100">
                        <div className="bg-primary-600 text-white rounded-full h-8 w-8 flex items-center justify-center">
                            <FiUser className="h-4 w-4" />
                        </div>
                        <div className="hidden md:block">
                            <div className="text-sm font-medium text-gray-700">
                                {currentUser?.email || 'User'}
                            </div>
                            <div className="text-xs text-gray-500">
                                {currentUser?.role || 'Role'}
                            </div>
                        </div>
                    </div>

                    <div className="absolute right-0 mt-2 w-48 py-1 bg-white rounded-md shadow-lg z-10 hidden group-hover:block">
                        <button
                            onClick={logout}
                            className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                            <FiLogOut className="mr-2 h-4 w-4" />
                            Sign out
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
};


export default Header;