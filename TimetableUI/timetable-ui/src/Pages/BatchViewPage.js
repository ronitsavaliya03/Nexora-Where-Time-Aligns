import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../Css/BatchViewPage.css';

const API_URL = 'http://localhost:5132/api/data/batch-list';
const STUDENT_SEARCH_URL = 'http://localhost:5132/api/data/student-batch';

function BatchViewPage({ onBack }) {
    const [batchData, setBatchData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expandedBatch, setExpandedBatch] = useState(null);
    const [groupedByDivision, setGroupedByDivision] = useState({});
    
    // Search states
    const [searchTerm, setSearchTerm] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [searchResult, setSearchResult] = useState(null);
    const [searchError, setSearchError] = useState('');

    useEffect(() => {
        const fetchBatchData = async () => {
            try {
                setIsLoading(true);
                const response = await axios.get(API_URL);
                setBatchData(response.data);
                
                // Group batches by division
                const grouped = response.data.reduce((acc, batch) => {
                    const divName = batch.divisionName;
                    if (!acc[divName]) {
                        acc[divName] = [];
                    }
                    acc[divName].push(batch);
                    return acc;
                }, {});
                
                setGroupedByDivision(grouped);
                setError(null);
            } catch (err) {
                setError('Failed to load batch data.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchBatchData();
    }, []);

    const toggleBatchExpansion = (batchName) => {
        setExpandedBatch(expandedBatch === batchName ? null : batchName);
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        
        if (!searchTerm.trim()) {
            setSearchError('Please enter an enrollment number');
            return;
        }

        try {
            setIsSearching(true);
            setSearchError('');
            setSearchResult(null);
            
            const response = await axios.get(`${STUDENT_SEARCH_URL}/${searchTerm.trim()}`);
            setSearchResult(response.data);
        } catch (err) {
            if (err.response?.status === 404) {
                setSearchError('Student not found or has incomplete elective choices');
            } else {
                setSearchError('Failed to search student. Please try again.');
            }
            setSearchResult(null);
        } finally {
            setIsSearching(false);
        }
    };

    const clearSearch = () => {
        setSearchTerm('');
        setSearchResult(null);
        setSearchError('');
    };

    if (isLoading) {
        return (
            <div className="batch-loading-container">
                <div className="loading-spinner"></div>
                <p>Loading student data...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="batch-error-container">
                <div className="error-icon">⚠️</div>
                <h2>Unable to Load Data</h2>
                <p className="error-message">{error}</p>
                <button onClick={onBack} className="back-button primary">
                    Return to Generator
                </button>
            </div>
        );
    }

    const divisionNames = Object.keys(groupedByDivision).sort();

    return (
        <div className="batch-view-container">
            {/* Header Section */}
            <div className="batch-header">
    <div className="header-background">
        <div className="header-graphic">
            <div className="graphic-circle circle-1"></div>
            <div className="graphic-circle circle-2"></div>
            <div className="graphic-circle circle-3"></div>
        </div>
    </div>
    
    <div className="header-content">
        {/* Back Button - Top Left */}
        {/* <div className="header-top-bar">
            <button onClick={onBack} className="back-button-elegant">
                <span className="back-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M19 12H5M12 19l-7-7 7-7"/>
                    </svg>
                </span>
                Back to Generator
            </button>
        </div> */}

        {/* Main Header Content */}
        <div className="header-main">
            <div className="header-text-content">
                <div className="title-wrapper">
                    <h1 className="page-title-elegant">
                        Student Batch List
                        {/* <span className="title-underline"></span> */}
                    </h1>
                    <p className="page-subtitle-elegant">
                        Comprehensive overview of student batches organized across academic divisions
                    </p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="stats-container">
                <div className="stat-card-elegant">
                    <div className="stat-icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                            <circle cx="9" cy="7" r="4"></circle>
                            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                        </svg>
                    </div>
                    <div className="stat-content">
                        <span className="stat-number-elegant">{divisionNames.length}</span>
                        <span className="stat-label-elegant">Divisions</span>
                    </div>
                </div>

                <div className="stat-card-elegant">
                    <div className="stat-icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                            <circle cx="9" cy="7" r="4"></circle>
                            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                        </svg>
                    </div>
                    <div className="stat-content">
                        <span className="stat-number-elegant">{batchData.length}</span>
                        <span className="stat-label-elegant">Total Batches</span>
                    </div>
                </div>

                <div className="stat-card-elegant">
                    <div className="stat-icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                            <circle cx="8.5" cy="7" r="4"></circle>
                            <path d="M20 8v6M23 11h-6"></path>
                        </svg>
                    </div>
                    <div className="stat-content">
                        <span className="stat-number-elegant">
                            {batchData.reduce((sum, batch) => sum + batch.studentCount, 0)}
                        </span>
                        <span className="stat-label-elegant">Total Students</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

            {/* Search Section */}
            <div className="search-section">
                <div className="search-container">
                    <div className="search-header">
                        <h3 className="search-title">Find Student</h3>
                        <p className="search-subtitle">Search for a student by enrollment number</p>
                    </div>
                    
                    <form onSubmit={handleSearch} className="search-form">
                        <div className="search-input-group">
                            <div className="input-wrapper">
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Enter enrollment number (e.g., 2023001)"
                                    className="search-input"
                                    disabled={isSearching}
                                />
                                {searchTerm && (
                                    <button 
                                        type="button" 
                                        className="clear-search"
                                        onClick={clearSearch}
                                        disabled={isSearching}
                                    >
                                        ✕
                                    </button>
                                )}
                            </div>
                            <button 
                                type="submit" 
                                className="search-button"
                                disabled={isSearching || !searchTerm.trim()}
                            >
                                {isSearching ? (
                                    <>
                                        <div className="search-spinner"></div>
                                        Searching...
                                    </>
                                ) : (
                                    <>
                                        <span className="search-icon">🔍</span>
                                        Search
                                    </>
                                )}
                            </button>
                        </div>
                    </form>

                    {/* Search Results */}
                    {searchError && (
                        <div className="search-result error">
                            <div className="result-icon">⚠️</div>
                            <div className="result-content">
                                <p className="result-message">{searchError}</p>
                            </div>
                        </div>
                    )}

                    {searchResult && (
                        <div className="search-result success">
                            <div className="result-icon">✅</div>
                            <div className="result-content">
                                <div className="student-info-header">
                                    <h4 className="student-name">{searchResult.studentName}</h4>
                                    <span className="enrollment-badge">{searchResult.enrollmentNo}</span>
                                </div>
                                <div className="student-details">
                                    <div className="detail-item">
                                        <span className="detail-label">Division:</span>
                                        <span className="detail-value highlight">{searchResult.divisionName}</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-label">Batch:</span>
                                        <span className="detail-value highlight">{searchResult.batchName}</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-label">Professional Elective:</span>
                                        <span className="detail-value elective">{searchResult.professionalElective}</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-label">Open Elective:</span>
                                        <span className="detail-value elective">{searchResult.openElective}</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-label">Batch Size:</span>
                                        <span className="detail-value">{searchResult.batchSize} students</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Division-wise Batch Display */}
            <div className="divisions-container">
                {divisionNames.map(divisionName => (
                    <div key={divisionName} className="division-section">
                        <div className="division-header">
                            <h2 className="division-title">{divisionName}</h2>
                            <span className="division-info">
                                {groupedByDivision[divisionName].length} batches • {' '}
                                {groupedByDivision[divisionName].reduce((sum, b) => sum + b.studentCount, 0)} students
                            </span>
                        </div>

                        <div className="batch-grid">
                            {groupedByDivision[divisionName].map(batch => (
                                <div key={batch.batchName} className="batch-card">
                                    {/* Card Header */}
                                    <div className="card-header">
                                        <div className="batch-badge">Batch {batch.batchName}</div>
                                        <div className="student-count">
                                            <span className="count-icon">👥</span>
                                            {batch.studentCount} Students
                                        </div>
                                    </div>

                                    {/* Batch Info */}
                                    <div className="batch-info">
                                        <div className="info-item">
                                            <span className="info-label">Professional Elective:</span>
                                            <span className="info-value elective">{batch.professionalElective}</span>
                                        </div>
                                        <div className="info-item">
                                            <span className="info-label">Open Elective:</span>
                                            <span className="info-value elective">{batch.openElective}</span>
                                        </div>
                                    </div>

                                    {/* Students List */}
                                    <div className="students-section">
                                        <button 
                                            className={`expand-button ${expandedBatch === batch.batchName ? 'expanded' : ''}`}
                                            onClick={() => toggleBatchExpansion(batch.batchName)}
                                        >
                                            <span className="button-text">
                                                {expandedBatch === batch.batchName ? 'Hide' : 'View'} Student List
                                            </span>
                                            <span className="expand-icon">
                                                {expandedBatch === batch.batchName ? '▲' : '▼'}
                                            </span>
                                        </button>
                                        
                                        {expandedBatch === batch.batchName && (
                                            <div className="student-list-container">
                                                <div className="student-list-header">
                                                    <span>Enrollment Numbers</span>
                                                    <span className="student-count-badge">
                                                        {batch.students.length} students
                                                    </span>
                                                </div>
                                                <div className="student-list">
                                                    {batch.students.map((enrollmentNo, index) => (
                                                        <div key={enrollmentNo} className="student-item">
                                                            <span className="student-number">{index + 1}.</span>
                                                            <span className="enrollment-no">{enrollmentNo}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Footer */}
            <div className="batch-footer">
                <p>Displaying {batchData.length} batches across {divisionNames.length} divisions</p>
            </div>
        </div>
    );
}

export default BatchViewPage;