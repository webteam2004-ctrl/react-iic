import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import './Navbar.css';

function Navbar() {
    const [scrolled, setScrolled] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const location = useLocation();
    const currentPath = location.pathname;
    const isTeamsPage = currentPath === '/teams' || currentPath.startsWith('/teams/');

    useEffect(() => {
        const handleScroll = () => {
        setScrolled(window.scrollY > 20);
    };

        handleScroll();

        window.addEventListener('scroll', handleScroll, {
        passive: true,
    });

    return () => {
        window.removeEventListener('scroll', handleScroll);
        };
    }, []);


    return (
        <header
            className={[
                scrolled ? 'scrolled' : '',
                isTeamsPage ? 'teams-page-navbar' : '',
            ].filter(Boolean).join(' ')}
        >
            <div className="header-inner">
                <Link to="/" className="brand" aria-label="VVITU IIC Home">
                    <img src="/images/IIC.png" alt="IIC Logo" />
                    <img className="brand-vvitu-logo" src="/images/VVITULogo_Final.png" alt="VVITU" />
                </Link>

                <div className="nav-right">
                    <nav id="main-nav" className={menuOpen ? 'open' : ''}>
                        <Link to="/" className={currentPath === '/' ? 'active' : ''} onClick={() => setMenuOpen(false)}>Home</Link>
                        <Link to="/ideahub" className={currentPath === '/ideahub' || currentPath === '/ideabank' ? 'active' : ''} onClick={() => setMenuOpen(false)}>Idea Hub</Link>
                        <Link to="/events" className={currentPath === '/events' ? 'active' : ''} onClick={() => setMenuOpen(false)}>Events</Link>
                        <Link to="/gallery" className={currentPath === '/gallery' ? 'active' : ''} onClick={() => setMenuOpen(false)}>Gallery</Link>
                        <Link to="/calender" className={currentPath === '/calender' ? 'active' : ''} onClick={() => setMenuOpen(false)}>Calendar</Link>
                        <Link to="/teams" className={currentPath === '/teams' ? 'active' : ''} onClick={() => setMenuOpen(false)}>Teams</Link>
                        <Link to="/contact" className={currentPath === '/contact' ? 'active' : ''} onClick={() => setMenuOpen(false)}>Contact</Link>
                    </nav>


                    <button
                        className="nav-toggle"
                        aria-label="Open navigation"
                        aria-controls="main-nav"
                        aria-expanded={menuOpen}
                        onClick={() => setMenuOpen(!menuOpen)}
                    >
                        {menuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>
        </header>
    );
}

export default Navbar;
