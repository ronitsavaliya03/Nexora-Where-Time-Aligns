import React from 'react';
import '../Css/AboutPage.css'; // We'll create a separate CSS file

function AboutPage() {
    return (
        <div className="about-page">
            <div className="container">
                {/* Header Section */}
                <div className="about-header">
                    <h1 className="page-title">About Nexora</h1>
                    <p className="page-subtitle">
                        Revolutionizing academic scheduling through intelligent automation
                    </p>
                </div>

                {/* Mission Section */}
                <section className="mission-section">
                    <div className="mission-content">
                        <div className="mission-text">
                            <h2>Our Mission</h2>
                            <p>
                                Nexora was born from the need to simplify the complex process 
                                of academic scheduling. We believe that educational institutions 
                                should focus on teaching and learning, not on administrative overhead.
                            </p>
                            <p>
                                Our platform leverages advanced algorithms to automate timetable 
                                generation, reduce conflicts, and optimize resource allocation - 
                                saving valuable time and resources for educational institutions.
                            </p>
                        </div>
                        <div className="mission-visual">
                            <div className="visual-element">
                                <div className="floating-card card-1">
                                    <span>Efficiency</span>
                                </div>
                                <div className="floating-card card-2">
                                    <span>Accuracy</span>
                                </div>
                                <div className="floating-card card-3">
                                    <span>Innovation</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Team Section */}
                <section className="team-section">
                    <h2 className="section-title">How It Works</h2>
                    <div className="process-steps">
                        <div className="process-step">
                            <div className="step-number">1</div>
                            <h3>Upload Data</h3>
                            <p>Upload your roll call and elective choice files in CSV format</p>
                        </div>
                        <div className="process-step">
                            <div className="step-number">2</div>
                            <h3>Automatic Processing</h3>
                            <p>Our algorithms process the data and generate optimal schedules</p>
                        </div>
                        <div className="process-step">
                            <div className="step-number">3</div>
                            <h3>Review & Export</h3>
                            <p>Review the generated timetable and export as needed</p>
                        </div>
                    </div>
                </section>

                {/* Technology Section */}
                <section className="technology-section">
                    <h2 className="section-title">Technology Stack</h2>
                    <div className="tech-grid">
                        <div className="tech-item">
                            <div className="tech-icon">⚛️</div>
                            <h4>React Frontend</h4>
                            <p>Modern, responsive user interface built with React.js</p>
                        </div>
                        <div className="tech-item">
                            <div className="tech-icon">🔷</div>
                            <h4>.NET Backend</h4>
                            <p>Robust API built on .NET framework for reliable performance</p>
                        </div>
                        <div className="tech-item">
                            <div className="tech-icon">📊</div>
                            <h4>Smart Algorithms</h4>
                            <p>Advanced scheduling algorithms for optimal resource allocation</p>
                        </div>
                        <div className="tech-item">
                            <div className="tech-icon">☁️</div>
                            <h4>Cloud Ready</h4>
                            <p>Designed for scalability and cloud deployment</p>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}

export default AboutPage;