// src/components/Sidebar.js
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    FiHome,
    FiMessageSquare,
    FiUsers,
    FiArchive,
    FiCommand,
    FiList,
    FiPieChart,
    FiChevronDown,
    FiChevronRight
} from 'react-icons/fi';

const Sidebar = ({ isOpen, setIsOpen }) => {
    const location = useLocation();
    const { hasRole } = useAuth();

    // Define menu sections with expanded state
    const [expandedSections, setExpandedSections] = useState({
        dashboard: true,
        conversations: false,
        contacts: false,
        templates: false,
        campaigns: false,
        chatbot: false
    });

    const toggleSection = (section) => {
        setExpandedSections({
            ...expandedSections,
            [section]: !expandedSections[section]
        });
    };

    // Check if a menu item is active
    const isActive = (path) => {
        return location.pathname === path;
    };

    // Menu item component
    const MenuItem = ({ path, icon, label, hasAccess = true }) => {
        if (!hasAccess) return null;

        return (
            <Link
                to={path}
                className={`flex items-center px-4 py-2 text-sm font-medium rounded-md ${isActive(path)
                    ? 'bg-primary-700 text-white'
                    : 'text-gray-100 hover:bg-primary-600 hover:text-white'
                    }`}
            >
                {icon}
                <span className="ml-3">{label}</span>
            </Link>
        );
    };

    // Section title component
    const SectionTitle = ({ title, expanded, onToggle, icon }) => {
        return (
            <button
                className="flex items-center w-full px-4 py-3 text-sm font-medium text-gray-100 hover:bg-primary-600 hover:text-white"
                onClick={onToggle}
            >
                {icon}
                <span className="ml-3">{title}</span>
                <span className="ml-auto">
                    {expanded ? <FiChevronDown /> : <FiChevronRight />}
                </span>
            </button>
        );
    };

    return (
        <div className={`bg-primary-800 text-white h-full flex-shrink-0 ${isOpen ? 'w-64' : 'w-0'} md:w-64 transition-all duration-300 overflow-hidden`}>
            <div className="flex flex-col h-full">
                <div className="flex items-center justify-center h-16 border-b border-primary-700">
                    <h1 className="text-xl font-bold text-white">WhatsApp Dashboard</h1>
                </div>

                <div className="flex-1 overflow-y-auto py-4">
                    <nav className="space-y-1 px-2">
                        {/* Dashboard Section */}
                        <SectionTitle
                            title="Dashboard"
                            expanded={expandedSections.dashboard}
                            onToggle={() => toggleSection('dashboard')}
                            icon={<FiHome className="text-lg" />}
                        />
                        {expandedSections.dashboard && (
                            <div className="ml-4 mt-1 space-y-1">
                                <MenuItem path="/" icon={<FiPieChart className="text-lg" />} label="Overview" />
                            </div>
                        )}

                        {/* Conversations Section */}
                        <SectionTitle
                            title="Conversations"
                            expanded={expandedSections.conversations}
                            onToggle={() => toggleSection('conversations')}
                            icon={<FiMessageSquare className="text-lg" />}
                        />
                        {expandedSections.conversations && (
                            <div className="ml-4 mt-1 space-y-1">
                                <MenuItem path="/conversations" icon={<FiList className="text-lg" />} label="All Conversations" />
                                <MenuItem path="/conversations/assigned" icon={<FiList className="text-lg" />} label="My Assignments" />
                            </div>
                        )}

                        {/* Contacts Section */}
                        <SectionTitle
                            title="Contacts"
                            expanded={expandedSections.contacts}
                            onToggle={() => toggleSection('contacts')}
                            icon={<FiUsers className="text-lg" />}
                        />
                        {expandedSections.contacts && (
                            <div className="ml-4 mt-1 space-y-1">
                                <MenuItem path="/contacts" icon={<FiList className="text-lg" />} label="All Contacts" />
                                <MenuItem path="/contacts/import" icon={<FiArchive className="text-lg" />} label="Import Contacts" />
                            </div>
                        )}

                        {/* Templates Section */}
                        <SectionTitle
                            title="Templates"
                            expanded={expandedSections.templates}
                            onToggle={() => toggleSection('templates')}
                            icon={<FiCommand className="text-lg" />}
                        />
                        {expandedSections.templates && (
                            <div className="ml-4 mt-1 space-y-1">
                                <MenuItem path="/templates" icon={<FiList className="text-lg" />} label="All Templates" />
                                <MenuItem
                                    path="/templates/approval"
                                    icon={<FiList className="text-lg" />}
                                    label="Approvals"
                                    hasAccess={hasRole('SuperAdmin')}
                                />
                            </div>
                        )}

                        {/* Campaigns Section */}
                        <SectionTitle
                            title="Campaigns"
                            expanded={expandedSections.campaigns}
                            onToggle={() => toggleSection('campaigns')}
                            icon={<FiPieChart className="text-lg" />}
                        />
                        {expandedSections.campaigns && (
                            <div className="ml-4 mt-1 space-y-1">
                                <MenuItem path="/campaigns" icon={<FiList className="text-lg" />} label="All Campaigns" />
                                <MenuItem path="/campaigns/new" icon={<FiList className="text-lg" />} label="Create Campaign" />
                            </div>
                        )}

                        {/* Chatbot Section */}
                        <SectionTitle
                            title="Chatbot"
                            expanded={expandedSections.chatbot}
                            onToggle={() => toggleSection('chatbot')}
                            icon={<FiCommand className="text-lg" />}
                        />
                        {expandedSections.chatbot && (
                            <div className="ml-4 mt-1 space-y-1">
                                <MenuItem path="/chatbot" icon={<FiList className="text-lg" />} label="Rules" />
                                <MenuItem path="/chatbot/test" icon={<FiCommand className="text-lg" />} label="Test Chatbot" />
                            </div>
                        )}
                    </nav>
                </div>
            </div>
        </div>
    );
};



export default Sidebar;