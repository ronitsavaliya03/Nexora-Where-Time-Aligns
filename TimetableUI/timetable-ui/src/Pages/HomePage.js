import React from 'react';
import '../Css/HomePage.css';

function HomePage({ onGetStarted , onViewDemo }) {
    return (
        <div className="homepage">
            {/* Hero Section */}
            <section className="hero-section">
                <div className="hero-content">
                    <div className="hero-text">
                        <h1 className="hero-title">
                            Intelligent <span className="gradient-text-contrast">Timetable Generation</span>
                        </h1>
                        <p className="hero-description">
                            Streamline your academic scheduling with our advanced timetable generator. 
                            Automatically create optimized schedules, manage student batches, and 
                            reduce administrative workload.
                        </p>
                        <div className="hero-actions">
                            <button onClick={onGetStarted} className="cta-button primary">
                                Get Started
                            </button>
                            <button onClick={onViewDemo} className="cta-button secondary">
                                Time Table
                            </button>
                        </div>
                    </div>
                    <div className="hero-visual">
                        <div className="timetable-cards-container">
                            <div className="visual-card card-1">
                                <div className="card-header">
                                    <span className="card-time">09:00 - 10:30</span>
                                    <span className="card-badge">CS101</span>
                                </div>
                                <div className="card-content">
                                    <h4>Data Structures</h4>
                                    <p>Prof. Smith · Room A-101</p>
                                    <span className="batch-tag">Batch A1</span>
                                </div>
                            </div>
                            <div className="visual-card card-2">
                                <div className="card-header">
                                    <span className="card-time">10:45 - 12:15</span>
                                    <span className="card-badge">MA202</span>
                                </div>
                                <div className="card-content">
                                    <h4>Calculus II</h4>
                                    <p>Dr. Johnson · Room B-205</p>
                                    <span className="batch-tag">Batch B2</span>
                                </div>
                            </div>
                            {/* <div className="visual-card card-3">
                                <div className="card-header">
                                    <span className="card-time">13:30 - 15:00</span>
                                    <span className="card-badge">PH101</span>
                                </div>
                                <div className="card-content">
                                    <h4>Physics Lab</h4>
                                    <p>Dr. Wilson · Lab Complex</p>
                                    <span className="batch-tag">Batch C1</span>
                                </div>
                            </div> */}
                            {/* <div className="visual-card card-4">
                                <div className="card-header">
                                    <span className="card-time">15:15 - 16:45</span>
                                    <span className="card-badge">CS202</span>
                                </div>
                                <div className="card-content">
                                    <h4>Algorithms</h4>
                                    <p>Prof. Brown · Room C-102</p>
                                    <span className="batch-tag">Batch A2</span>
                                </div>
                            </div> */}
                            <div className="visual-card card-5">
                                <div className="card-header">
                                    <span className="card-time">17:00 - 18:30</span>
                                    <span className="card-badge">EL101</span>
                                </div>
                                <div className="card-content">
                                    <h4>Electronics</h4>
                                    <p>Dr. Davis · Lab A</p>
                                    <span className="batch-tag">Batch D1</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="features-section">
                <div className="container">
                    <h2 className="section-title">Why Choose Nexora?</h2>
                    <div className="features-grid">
                        <div className="feature-card">
                            <div className="feature-icon">⚡</div>
                            <h3>Fast Generation</h3>
                            <p>Generate complete timetables in seconds with our optimized algorithms</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon">🎯</div>
                            <h3>Smart Allocation</h3>
                            <p>Intelligent room and faculty allocation based on availability and preferences</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon">👥</div>
                            <h3>Batch Management</h3>
                            <p>Easily manage student batches, divisions, and elective choices</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon">📊</div>
                            <h3>Conflict-Free</h3>
                            <p>Automatic conflict detection ensures no overlapping schedules</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon">🔄</div>
                            <h3>Easy Updates</h3>
                            <p>Quickly modify and regenerate timetables as requirements change</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon">📱</div>
                            <h3>Responsive Design</h3>
                            <p>Access and manage timetables from any device, anywhere</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <section className="process-section">
                <div className="container">
                    <h2 className="section-title">How It Works</h2>
                    <div className="process-steps">
                        <div className="process-step">
                            <div className="step-icon">📤</div>
                            <div className="step-number">1</div>
                            <h3>Upload Your Data</h3>
                            <p>Simply upload your roll call and elective choice files in CSV format</p>
                        </div>
                        <div className="process-step">
                            <div className="step-icon">⚙️</div>
                            <div className="step-number">2</div>
                            <h3>Automatic Processing</h3>
                            <p>Our intelligent algorithms process your data and generate optimal schedules</p>
                        </div>
                        <div className="process-step">
                            <div className="step-icon">✅</div>
                            <div className="step-number">3</div>
                            <h3>Review & Export</h3>
                            <p>Review the generated timetable, make adjustments if needed, and export</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="stats-section">
                <div className="container">
                    <div className="stats-grid">
                        <div className="stat-item">
                            <span className="stat-number">500+</span>
                            <span className="stat-label">Timetables Generated</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-number">95%</span>
                            <span className="stat-label">Time Saved</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-number">50+</span>
                            <span className="stat-label">Institutions</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-number">99.9%</span>
                            <span className="stat-label">Conflict-Free</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="cta-section">
                <div className="container">
                    <h2>Ready to Transform Your Scheduling?</h2>
                    <p>Join hundreds of institutions using Nexora to streamline their academic operations.</p>
                    <button onClick={onGetStarted} className="cta-button primary large">
                        Start Generating Now
                    </button>
                </div>
            </section>
        </div>
    );
}

export default HomePage;