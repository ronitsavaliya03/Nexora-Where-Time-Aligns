import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../Css/UploadPage.css';

const API_BASE_URL = 'http://localhost:5132';
const API_ENDPOINTS = {
    generate: `${API_BASE_URL}/api/generator/generate-full-timetable`,
};

function UploadPage({ setTimetableData }) { 
    const [rollCallFile, setRollCallFile] = useState(null);
    const [electiveFile, setElectiveFile] = useState(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState(null);
    const [hasSavedData, setHasSavedData] = useState(false);

    // Check if there's saved timetable data
    useEffect(() => {
        const savedData = localStorage.getItem('timetableData');
        setHasSavedData(!!savedData);
    }, []);

    const handleGenerate = async () => {
        if (!rollCallFile || !electiveFile) {
            setError('Please upload both files.');
            return;
        }

        setIsGenerating(true);
        setError(null);

        const formData = new FormData();
        formData.append('RollCallFile', rollCallFile);
        formData.append('ElectiveChoiceFile', electiveFile);

        try {
            const response = await axios.post(API_ENDPOINTS.generate, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                timeout: 120000 // 2 minutes timeout
            });
            
            setTimetableData(response.data);

        } catch (err) {
            let errorMsg = 'An unknown error occurred.';
            if (err.response && err.response.data && err.response.data.title) {
                errorMsg = err.response.data.title; 
            } else if (err.response && err.response.data && typeof err.response.data === 'string') {
                errorMsg = err.response.data;
            } else if (err.message) {
                errorMsg = err.message;
            }
            setError('Generation Failed: ' + errorMsg);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleClearSavedData = () => {
        localStorage.removeItem('timetableData');
        setHasSavedData(false);
        // This will trigger the parent component to re-render and show the upload page
        window.location.reload(); // Simple solution to refresh the state
    };

    return (
        <div className="upload-container"> 
            <div className="upload-header">
                <h1 className="upload-title">Timetable Generator</h1>
                <p className="upload-subtitle">Upload required files to generate your timetable</p>
                
                {/* Saved Data Notification */}
                {hasSavedData && (
                    <div className="saved-data-banner">
                        <div className="banner-content">
                            <span className="banner-icon">💾</span>
                            <div className="banner-text">
                                <strong>Saved timetable found!</strong>
                                <span>You have a previously generated timetable. The system will automatically load it when you navigate away from this page.</span>
                            </div>
                            <div className="banner-actions">
                                <button 
                                    onClick={handleClearSavedData}
                                    className="banner-btn secondary"
                                >
                                    Clear Saved Timetable
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="upload-cards">
                <div className="upload-card">
                    <div className="card-header">
                        <div className="step-indicator">1</div>
                        <h2>Roll Call File</h2>
                    </div>
                    <p className="card-description">Upload Roll Call.csv file</p>
                    <div className="file-input-wrapper">
                        <input 
                            type="file" 
                            accept=".csv"
                            onChange={(e) => setRollCallFile(e.target.files[0])} 
                            className="file-input"
                            id="rollCallFile"
                        />
                        <label htmlFor="rollCallFile" className="file-input-label">
                            {rollCallFile ? rollCallFile.name : 'Choose CSV File'}
                        </label>
                    </div>
                    {rollCallFile && (
                        <div className="file-success">
                            <span className="success-icon">✓</span>
                            File selected
                        </div>
                    )}
                </div>

                <div className="upload-card">
                    <div className="card-header">
                        <div className="step-indicator">2</div>
                        <h2>Elective Choice File</h2>
                    </div>
                    <p className="card-description">Upload Elective Choice.csv file</p>
                    <div className="file-input-wrapper">
                        <input 
                            type="file" 
                            accept=".csv"
                            onChange={(e) => setElectiveFile(e.target.files[0])} 
                            className="file-input"
                            id="electiveFile"
                        />
                        <label htmlFor="electiveFile" className="file-input-label">
                            {electiveFile ? electiveFile.name : 'Choose CSV File'}
                        </label>
                    </div>
                    {electiveFile && (
                        <div className="file-success">
                            <span className="success-icon">✓</span>
                            File selected
                        </div>
                    )}
                </div>
            </div>

            <div className="action-section">
                <button 
                    onClick={handleGenerate} 
                    disabled={isGenerating || !rollCallFile || !electiveFile} 
                    className={`generate-button ${isGenerating ? 'loading' : ''}`}
                >
                    {isGenerating ? (
                        <>
                            <div className="spinner"></div>
                            Generating Timetable...
                        </>
                    ) : (
                        'Generate Timetable'
                    )}
                </button>

                {error && (
                    <div className="error-message">
                        <span className="error-icon">⚠</span>
                        {error}
                    </div>
                )}
            </div>
        </div>
    );
}

export default UploadPage;