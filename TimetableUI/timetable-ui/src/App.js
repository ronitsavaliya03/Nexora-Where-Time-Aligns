import React, { useState, useEffect } from 'react';
import './App.css';
import UploadPage from './Pages/UploadPage';
import ViewPage from './Pages/ViewPage';
import BatchViewPage from './Pages/BatchViewPage';
import HomePage from './Pages/HomePage';
import AboutPage from './Pages/AboutPage';
import DocumentationPage from './Pages/DocumentationPage';
import ContactPage from './Pages/ContactPage';
import AdminDashboard from './Pages/AdminPage';

function App() {
    const [timetableData, setTimetableData] = useState(null);
    const [currentPage, setCurrentPage] = useState('home');

    // Load timetable data from localStorage on component mount
    useEffect(() => {
        const savedTimetableData = localStorage.getItem('timetableData');
        if (savedTimetableData) {
            try {
                setTimetableData(JSON.parse(savedTimetableData));
            } catch (err) {
                console.error('Error parsing saved timetable data:', err);
                localStorage.removeItem('timetableData');
            }
        }
    }, []);

    // Save timetable data to localStorage whenever it changes
    useEffect(() => {
        if (timetableData) {
            localStorage.setItem('timetableData', JSON.stringify(timetableData));
        } else {
            localStorage.removeItem('timetableData');
        }
    }, [timetableData]);

    const renderPage = () => {
        switch (currentPage) {
            case 'home':
                return <HomePage onGetStarted={() => setCurrentPage('admin')} onViewDemo={() => setCurrentPage('generator')} />;
            
            case 'generator':
                if (!timetableData) {
                    return <UploadPage setTimetableData={setTimetableData} />;
                } else {
                    return <ViewPage 
                        data={timetableData} 
                        resetData={() => setTimetableData(null)} 
                    />;
                }
            
            case 'batchlist':
                return <BatchViewPage onBack={() => setCurrentPage('generator')} />;
            
            case 'about':
                return <AboutPage />;
            
            case 'documentation':
                return <DocumentationPage />;
            
            case 'contact':
                return <ContactPage />;

            case 'admin':
                return <AdminDashboard onBack={() => setCurrentPage('generator')} />;
            
            default:
                return <HomePage onGetStarted={() => setCurrentPage('generator')} />;
        }
    };

    const isGeneratorActive = currentPage === 'generator' || (timetableData && currentPage === 'generator');

    // Clear saved timetable data
    const handleClearTimetable = () => {
        setTimetableData(null);
        if (currentPage !== 'generator') {
            setCurrentPage('generator');
        }
    };

    return (
        <div className="App">
            {/* Professional Header */}
            <header className="app-header">
                <div className="header-container">
                    <div className="logo" onClick={() => setCurrentPage('home')}>
                        <div className="logo-icon">📅</div>
                        <div className="logo-text">
                            <span className="logo-title">Nexora</span>
                            <span className="logo-subtitle">Academic Scheduler</span>
                        </div>
                    </div>
                    
                    <nav className="main-nav">
                        <button 
                            onClick={() => setCurrentPage('home')}
                            className={currentPage === 'home' ? 'nav-btn active' : 'nav-btn'}
                        >
                            Home
                        </button>
                        <button 
                            onClick={() => setCurrentPage('generator')}
                            className={isGeneratorActive ? 'nav-btn active' : 'nav-btn'}
                        >
                            Generator
                        </button>
                        <button 
                            onClick={() => setCurrentPage('batchlist')}
                            className={currentPage === 'batchlist' ? 'nav-btn active' : 'nav-btn'}
                        >
                            Batch List
                        </button>
                        <button 
                            onClick={() => setCurrentPage('admin')}
                            className={currentPage === 'admin' ? 'nav-btn active' : 'nav-btn'}
                        >
                            Admin
                        </button>
                        <button 
                            onClick={() => setCurrentPage('documentation')}
                            className={currentPage === 'documentation' ? 'nav-btn active' : 'nav-btn'}
                        >
                            Docs
                        </button>
                        <button 
                            onClick={() => setCurrentPage('about')}
                            className={currentPage === 'about' ? 'nav-btn active' : 'nav-btn'}
                        >
                            About
                        </button>
                        <button 
                            onClick={() => setCurrentPage('contact')}
                            className={currentPage === 'contact' ? 'nav-btn active' : 'nav-btn'}
                        >
                            Contact
                        </button>
                    </nav>

                    <div className="header-actions">
                        {timetableData && (
                            <div className="timetable-status">
                                <span className="status-badge">Timetable Generated</span>
                                <button 
                                    onClick={() => handleClearTimetable()}
                                    className="clear-timetable-btn"
                                    title="Clear generated timetable"
                                >
                                    Clear
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="app-main">
                {/* Saved Data Notification - Only show when on generator page without timetable data */}
                {timetableData && currentPage === 'generator' && (
                    <div className="saved-data-notification">
                        <span className="notification-icon">💾</span>
                        <span>You have a previously generated timetable. </span>
                        <span>The timetable is automatically loaded and ready to view.</span>
                    </div>
                )}
                
                {renderPage()}
            </main>

            {/* Professional Footer */}
            <footer className="app-footer">
                <div className="footer-container">
                    <div className="footer-section">
                        <div className="footer-logo">
                            <span className="footer-logo-icon">📅</span>
                            <span className="footer-logo-text">Nexora</span>
                        </div>
                        <p className="footer-description">
                            Intelligent academic scheduling solution for educational institutions.
                        </p>
                    </div>
                    
                    <div className="footer-section">
                        <h4>Quick Links</h4>
                        <button onClick={() => setCurrentPage('generator')} className="footer-link">
                            Timetable Generator
                        </button>
                        <button onClick={() => setCurrentPage('batchlist')} className="footer-link">
                            Batch Management
                        </button>
                        <button onClick={() => setCurrentPage('documentation')} className="footer-link">
                            Documentation
                        </button>
                    </div>
                    
                    <div className="footer-section">
                        <h4>Support</h4>
                        <button onClick={() => setCurrentPage('contact')} className="footer-link">
                            Contact Us
                        </button>
                        <button onClick={() => setCurrentPage('about')} className="footer-link">
                            About
                        </button>
                        <div className="footer-link">
                            Help Center
                        </div>
                    </div>
                    
                    <div className="footer-section">
                        <h4>Connect</h4>
                        <div className="social-links">
                            <span className="social-link">GitHub</span>
                            <span className="social-link">LinkedIn</span>
                            <span className="social-link">Twitter</span>
                        </div>
                    </div>
                </div>
                
                <div className="footer-bottom">
                    <p>&copy; 2024 Nexora. All rights reserved.</p>
                    <div className="footer-bottom-links">
                        <span>Privacy Policy</span>
                        <span>Terms of Service</span>
                        <span>Cookie Policy</span>
                    </div>
                </div>
            </footer>
        </div>
    );
}

export default App;