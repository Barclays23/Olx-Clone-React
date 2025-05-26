import React, { useContext, useState } from 'react';
import './Navbar.css';
import Search from '../../assets/Search';
import Arrow from '../../assets/Arrow';
import SellButton from '../../assets/SellButton';
import SellButtonPlus from '../../assets/SellButtonPlus';
import { AuthContext } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';
import { Link, useNavigate } from 'react-router-dom';
import LoadingSpinner1 from '../LoadingSpinner/LoadingSpinner1/LoadingSpinner1';

function Navbar() {
    const [loading, setLoading] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { logOut, currentUser, loading: authLoading } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = async () => {
        setLoading(true);
        try {
            await logOut();
            setLoading(false);
            toast.success("See you next time! Thank you.👋", { position: "top-center", theme: "dark", autoClose: 3000 });
            setTimeout(() => {
                navigate("/login");
            }, 1000);
        } catch (error) {
            const message = getErrorMessage(error.code);
            console.error("Logout error :", error.code);
            toast.error(message, { position: "top-center", theme: "dark", autoClose: 3000 });
        }
    };

    const handleSellButton = () => {
        if (!currentUser) {
            toast.warn('⚠️ You need to log in to start selling.', { position: 'top-center', autoClose: 3000, theme: 'dark' });
            return;
        } else {
            setLoading(true);
            setTimeout(() => {
                navigate('/create');
                setLoading(false);
            }, 500);
        }
    };

    const getErrorMessage = (errorCode) => {
        switch (errorCode) {
            case 'auth/network-request-failed':
                return 'Network error. Please check your connection.';
            case 'auth/internal-error':
                return 'Internal server error. Please try again later.';
            default:
                return 'An error occurred while logging out. Please try again.';
        }
    };

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    if (authLoading || loading) {
        return <LoadingSpinner1 />;
    }

    return (
        <div className="navbar">
            <div className="navbar-content">
                <Link to={'/'}>
                    <div className="brand-logo">
                        <img src="https://statics.olx.in/external/base/img/olxLogo/olx_logo_2025.svg" alt="olx-logo" />
                    </div>
                </Link>

                <button className="hamburger" onClick={toggleMenu}>
                    <span className="hamburger-line"></span>
                    <span className="hamburger-line"></span>
                    <span className="hamburger-line"></span>
                </button>

                <div className={`nav-items ${isMenuOpen ? 'open' : ''}`}>
                    <div className="location-search">
                        <Search />
                        <input type="text" placeholder="Search location..." />
                        <Arrow />
                    </div>
                    <div className="product-search">
                        <div className="input">
                            <input type="text" placeholder="Find cars, mobiles and more..." />
                        </div>
                        <div className="search-btn">
                            <Search color="#fff" />
                        </div>
                    </div>
                    <div className="login-link">
                        {currentUser ? (
                            <>
                                <span>{currentUser.displayName}</span>
                                <button onClick={handleLogout} className="logout-button">Logout</button>
                            </>
                        ) : (
                            <Link to={'/login'}>
                                <button className="login-button">Login</button>
                            </Link>
                        )}
                    </div>
                    <div onClick={handleSellButton} className="sell-button">
                        <SellButton />
                        <div className="sell-content">
                            <SellButtonPlus />
                            <span>SELL</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Navbar;