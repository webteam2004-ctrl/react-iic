import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

function Layout({ children }) {
    const { pathname } = useLocation();

    useEffect(() => {
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }, [pathname]);

    // Do not render public website Navbar/Footer on admin dashboard routes
    const isAdminDashboard = pathname.startsWith('/admin') && pathname !== '/admin-portal-login';

    if (isAdminDashboard) {
        return <>{children}</>;
    }

    return (
        <>
            <Navbar />
            <main>
                {children}
            </main>
            <Footer />
        </>
    );
}

export default Layout;
