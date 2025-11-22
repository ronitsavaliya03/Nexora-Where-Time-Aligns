import React, { useState } from 'react';
import '../Css/DocumentationPage.css';

function DocumentationPage() {
    const [activeSection, setActiveSection] = useState('getting-started');

    const sections = {
        'getting-started': 'Getting Started',
        'file-format': 'File Format Guide',
        'generation': 'Timetable Generation',
        'batch-management': 'Batch Management',
        'troubleshooting': 'Troubleshooting'
    };

    return (
        <div className="documentation-page">
            <div className="doc-container">
                {/* Sidebar */}
                <aside className="doc-sidebar">
                    <h3>Documentation</h3>
                    <nav className="doc-nav">
                        {Object.entries(sections).map(([key, title]) => (
                            <button
                                key={key}
                                className={`doc-nav-item ${activeSection === key ? 'active' : ''}`}
                                onClick={() => setActiveSection(key)}
                            >
                                {title}
                            </button>
                        ))}
                    </nav>
                </aside>

                {/* Main Content */}
                <main className="doc-content">
                    {activeSection === 'getting-started' && (
                        <div className="doc-section">
                            <h1>Getting Started with Nexora</h1>
                            <p>Welcome to Nexora! This guide will help you set up and start generating timetables quickly.</p>
                            
                            <div className="step-card">
                                <h3>Step 1: Prepare Your Files</h3>
                                <p>Ensure you have two CSV files ready:</p>
                                <ul>
                                    <li><strong>Roll Call File:</strong> Contains student enrollment numbers and batch information</li>
                                    <li><strong>Elective Choice File:</strong> Contains student elective preferences</li>
                                </ul>
                            </div>

                            <div className="step-card">
                                <h3>Step 2: Upload Files</h3>
                                <p>Navigate to the Generator page and upload both CSV files using the file upload interface.</p>
                            </div>

                            <div className="step-card">
                                <h3>Step 3: Generate Timetable</h3>
                                <p>Click the "Generate Timetable" button and wait for the processing to complete.</p>
                            </div>

                            <div className="step-card">
                                <h3>Step 4: Review & Export</h3>
                                <p>Review the generated timetable and use the batch list feature to view detailed student information.</p>
                            </div>
                        </div>
                    )}

                    {activeSection === 'file-format' && (
                        <div className="doc-section">
                            <h1>File Format Guide</h1>
                            <p>Proper file formatting is crucial for successful timetable generation.</p>
                            
                            <h3>Roll Call File Format</h3>
                            <div className="code-example">
                                <pre>{`EnrollmentNo,Name,Division,Batch
2023001,John Doe,A,B1
2023002,Jane Smith,A,B1
2023003,Bob Johnson,B,B2`}</pre>
                            </div>

                            <h3>Elective Choice File Format</h3>
                            <div className="code-example">
                                <pre>{`EnrollmentNo,ProfessionalElective,OpenElective
2023001,Machine Learning,Digital Marketing
2023002,Data Science,Entrepreneurship
2023003,Cyber Security,Public Speaking`}</pre>
                            </div>
                        </div>
                    )}

                    {activeSection === 'generation' && (
                        <div className="doc-section">
                            <h1>Timetable Generation</h1>
                            <p>Learn how our timetable generation process works and best practices.</p>
                            
                            <h3>Generation Process</h3>
                            <ul>
                                <li><strong>Data Validation:</strong> System checks file formats and data integrity</li>
                                <li><strong>Batch Creation:</strong> Students are grouped into lab batches</li>
                                <li><strong>Resource Allocation:</strong> Rooms and faculty are assigned optimally</li>
                                <li><strong>Conflict Resolution:</strong> System ensures no scheduling conflicts</li>
                                <li><strong>Timetable Generation:</strong> Final timetable is created and displayed</li>
                            </ul>

                            <h3>Best Practices</h3>
                            <div className="tip-card">
                                <h4>💡 Pro Tip</h4>
                                <p>Ensure your input files are complete and correctly formatted to avoid generation errors.</p>
                            </div>
                        </div>
                    )}

                    {activeSection === 'batch-management' && (
                        <div className="doc-section">
                            <h1>Batch Management</h1>
                            <p>Learn how to view and manage student batches in the system.</p>
                            
                            <h3>Viewing Batch Information</h3>
                            <p>Navigate to the "Batch List" page to view:</p>
                            <ul>
                                <li>Batch numbers and student counts</li>
                                <li>Division information</li>
                                <li>Elective choices for each batch</li>
                                <li>Complete student lists</li>
                            </ul>

                            <h3>Batch Organization</h3>
                            <p>Batches are automatically organized based on:</p>
                            <ul>
                                <li>Student division</li>
                                <li>Elective preferences</li>
                                <li>Lab capacity constraints</li>
                                <li>Faculty availability</li>
                            </ul>
                        </div>
                    )}

                    {activeSection === 'troubleshooting' && (
                        <div className="doc-section">
                            <h1>Troubleshooting Guide</h1>
                            <p>Common issues and their solutions.</p>
                            
                            <div className="issue-card">
                                <h4>❌ File Upload Errors</h4>
                                <p><strong>Solution:</strong> Ensure files are in CSV format and follow the required structure.</p>
                            </div>

                            <div className="issue-card">
                                <h4>❌ Generation Failures</h4>
                                <p><strong>Solution:</strong> Check that all required columns are present in your input files.</p>
                            </div>

                            <div className="issue-card">
                                <h4>❌ Timetable Conflicts</h4>
                                <p><strong>Solution:</strong> Review room and faculty availability in your input data.</p>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}

export default DocumentationPage;