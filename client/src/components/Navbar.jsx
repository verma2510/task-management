import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, LayoutDashboard, Database } from 'lucide-react';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="glass-panel" style={{ margin: '1rem', padding: '1rem 2rem' }}>
            <div className="flex-between">
                <Link to="/" style={{ textDecoration: 'none', color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Database className="text-primary" />
                    <span style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>TaskMaster</span>
                </Link>

                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    {user ? (
                        <>
                            <span className="text-muted">Hello, {user.username} ({user.role})</span>
                            <button onClick={handleLogout} className="btn btn-danger" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}>
                                <LogOut size={16} style={{ marginRight: '0.5rem' }} />
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="btn btn-primary" style={{ textDecoration: 'none' }}>Login</Link>
                            <Link to="/register" className="btn" style={{ textDecoration: 'none', color: 'white' }}>Register</Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
