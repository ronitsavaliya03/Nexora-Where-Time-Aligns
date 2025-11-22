import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../Css/AdminPage.css';

// API Configuration
const API_BASE_URL = 'http://localhost:5132';
const API_ENDPOINTS = {
    timeSlots: `${API_BASE_URL}/api/timeslots`,
    rooms: `${API_BASE_URL}/api/rooms`,
    subjects: `${API_BASE_URL}/api/subjects`,
    faculty: `${API_BASE_URL}/api/faculty`,
    linkFaculty: `${API_BASE_URL}/api/faculty/link-subject`
};

function AdminDashboard({ onBack }) {
    const [currentTab, setCurrentTab] = useState('rooms');

    return (
        <div className="admin-dashboard">
            <div className="admin-header">
                <div className="admin-title-section">
                    <h1 className="admin-title">Admin Dashboard</h1>
                    <p className="admin-subtitle">
                        Manage all university constraints and resources for timetable generation
                    </p>
                </div>
            </div>

            <div className="admin-content">
                <div className="admin-sidebar">
                    <nav className="admin-nav">
                        <button 
                            onClick={() => setCurrentTab('rooms')} 
                            className={`admin-nav-btn ${currentTab === 'rooms' ? 'active' : ''}`}
                        >
                            <span className="nav-icon">🏢</span>
                            Rooms Management
                        </button>
                        <button 
                            onClick={() => setCurrentTab('subjects')} 
                            className={`admin-nav-btn ${currentTab === 'subjects' ? 'active' : ''}`}
                        >
                            <span className="nav-icon">📚</span>
                            Subjects Management
                        </button>
                        <button 
                            onClick={() => setCurrentTab('faculty')} 
                            className={`admin-nav-btn ${currentTab === 'faculty' ? 'active' : ''}`}
                        >
                            <span className="nav-icon">👨‍🏫</span>
                            Faculty Management
                        </button>
                        <button 
                            onClick={() => setCurrentTab('timeslots')} 
                            className={`admin-nav-btn ${currentTab === 'timeslots' ? 'active' : ''}`}
                        >
                            <span className="nav-icon">⏰</span>
                            Time Slots
                        </button>
                    </nav>
                </div>

                <div className="admin-main">
                    {currentTab === 'rooms' && <ManageRooms />}
                    {currentTab === 'subjects' && <ManageSubjects />}
                    {currentTab === 'faculty' && <ManageFaculty />}
                    {currentTab === 'timeslots' && <ManageTimeSlots />}
                </div>
            </div>
        </div>
    );
}

// Manage Rooms Component
function ManageRooms() {
    const [rooms, setRooms] = useState([]);
    const [roomNumber, setRoomNumber] = useState('');
    const [roomType, setRoomType] = useState('Lecture Hall');
    const [capacity, setCapacity] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchData = async () => {
        try {
            setIsLoading(true);
            const result = await axios.get(API_ENDPOINTS.rooms);
            setRooms(result.data);
            setError(null);
        } catch (err) {
            setError('Failed to load rooms data');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { 
        fetchData(); 
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setIsLoading(true);
            await axios.post(API_ENDPOINTS.rooms, { 
                roomNumber, 
                roomType, 
                capacity: parseInt(capacity) 
            });
            setRoomNumber(''); 
            setCapacity('');
            setError(null);
            fetchData();
        } catch (err) {
            setError('Failed to add room');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this room?')) {
            try {
                await axios.delete(`${API_ENDPOINTS.rooms}/${id}`);
                fetchData();
            } catch (err) {
                setError('Failed to delete room');
            }
        }
    };

    return (
        <div className="admin-section">
            <div className="section-header">
                <h2>Manage Rooms</h2>
                <p>Add and manage lecture halls and labs available for scheduling</p>
            </div>

            {error && <div className="error-message">{error}</div>}

            <form onSubmit={handleSubmit} className="admin-form">
                <div className="form-grid">
                    <div className="form-group">
                        <label>Room Number</label>
                        <input 
                            type="text" 
                            placeholder="e.g., C-301, LAB-A" 
                            value={roomNumber} 
                            onChange={e => setRoomNumber(e.target.value)} 
                            required 
                        />
                    </div>
                    <div className="form-group">
                        <label>Room Type</label>
                        <select value={roomType} onChange={e => setRoomType(e.target.value)}>
                            <option value="Lecture Hall">Lecture Hall</option>
                            <option value="Lab">Laboratory</option>
                            <option value="Seminar Room">Seminar Room</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Capacity</label>
                        <input 
                            type="number" 
                            placeholder="e.g., 60" 
                            value={capacity} 
                            onChange={e => setCapacity(e.target.value)} 
                            min="1"
                            required 
                        />
                    </div>
                </div>
                <button type="submit" className="submit-button" disabled={isLoading}>
                    {isLoading ? 'Adding...' : 'Add Room'}
                </button>
            </form>

            <div className="data-table-container">
                <h3>Available Rooms ({rooms.length})</h3>
                {isLoading ? (
                    <div className="loading">Loading rooms...</div>
                ) : (
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Room Number</th>
                                <th>Type</th>
                                <th>Capacity</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rooms.map(room => (
                                <tr key={room.roomId}>
                                    <td>
                                        <span className="room-number">{room.roomNumber}</span>
                                    </td>
                                    <td>
                                        <span className={`room-type ${room.roomType.toLowerCase().replace(' ', '-')}`}>
                                            {room.roomType}
                                        </span>
                                    </td>
                                    <td>
                                        <span className="capacity-badge">{room.capacity} students</span>
                                    </td>
                                    <td>
                                        <button 
                                            onClick={() => handleDelete(room.roomId)} 
                                            className="delete-button"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}

// Manage Subjects Component
function ManageSubjects() {
    const [subjects, setSubjects] = useState([]);
    const [subjectCode, setSubjectCode] = useState('');
    const [subjectName, setSubjectName] = useState('');
    const [subjectType, setSubjectType] = useState('Core');
    const [requiresLab, setRequiresLab] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchData = async () => {
        try {
            setIsLoading(true);
            const result = await axios.get(API_ENDPOINTS.subjects);
            setSubjects(result.data);
            setError(null);
        } catch (err) {
            setError('Failed to load subjects data');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { 
        fetchData(); 
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setIsLoading(true);
            await axios.post(API_ENDPOINTS.subjects, { 
                subjectCode, 
                subjectName, 
                subjectType, 
                requiresLab 
            });
            setSubjectCode(''); 
            setSubjectName('');
            setRequiresLab(false);
            setError(null);
            fetchData();
        } catch (err) {
            setError('Failed to add subject');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this subject?')) {
            try {
                await axios.delete(`${API_ENDPOINTS.subjects}/${id}`);
                fetchData();
            } catch (err) {
                setError('Failed to delete subject');
            }
        }
    };

    return (
        <div className="admin-section">
            <div className="section-header">
                <h2>Manage Subjects</h2>
                <p>Add and manage courses and subjects for the curriculum</p>
            </div>

            {error && <div className="error-message">{error}</div>}

            <form onSubmit={handleSubmit} className="admin-form">
                <div className="form-grid">
                    <div className="form-group">
                        <label>Subject Code</label>
                        <input 
                            type="text" 
                            placeholder="e.g., 2301CS501" 
                            value={subjectCode} 
                            onChange={e => setSubjectCode(e.target.value)} 
                            required 
                        />
                    </div>
                    <div className="form-group">
                        <label>Subject Name</label>
                        <input 
                            type="text" 
                            placeholder="e.g., Computer Networks" 
                            value={subjectName} 
                            onChange={e => setSubjectName(e.target.value)} 
                            required 
                        />
                    </div>
                    <div className="form-group">
                        <label>Subject Type</label>
                        <select value={subjectType} onChange={e => setSubjectType(e.target.value)}>
                            <option value="Core">Core</option>
                            <option value="Professional Elective">Professional Elective</option>
                            <option value="Open Elective">Open Elective</option>
                        </select>
                    </div>
                    <div className="form-group checkbox-group">
                        <label className="checkbox-label">
                            <input 
                                type="checkbox" 
                                checked={requiresLab} 
                                onChange={e => setRequiresLab(e.target.checked)} 
                            />
                            <span className="checkmark"></span>
                            Requires Laboratory
                        </label>
                    </div>
                </div>
                <button type="submit" className="submit-button" disabled={isLoading}>
                    {isLoading ? 'Adding...' : 'Add Subject'}
                </button>
            </form>

            <div className="data-table-container">
                <h3>Available Subjects ({subjects.length})</h3>
                {isLoading ? (
                    <div className="loading">Loading subjects...</div>
                ) : (
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Code</th>
                                <th>Name</th>
                                <th>Type</th>
                                <th>Lab Required</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {subjects.map(subject => (
                                <tr key={subject.subjectId}>
                                    <td>
                                        <span className="subject-code">{subject.subjectCode}</span>
                                    </td>
                                    <td>
                                        <span className="subject-name">{subject.subjectName}</span>
                                    </td>
                                    <td>
                                        <span className={`subject-type ${subject.subjectType.toLowerCase().replace(' ', '-')}`}>
                                            {subject.subjectType}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`lab-indicator ${subject.requiresLab ? 'lab-required' : 'no-lab'}`}>
                                            {subject.requiresLab ? 'Yes' : 'No'}
                                        </span>
                                    </td>
                                    <td>
                                        <button 
                                            onClick={() => handleDelete(subject.subjectId)} 
                                            className="delete-button"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}

// Manage Faculty Component
function ManageFaculty() {
    const [faculty, setFaculty] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [facultyName, setFacultyName] = useState('');
    const [selectedFaculty, setSelectedFaculty] = useState('');
    const [selectedSubject, setSelectedSubject] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchData = async () => {
        try {
            setIsLoading(true);
            const [facRes, subRes] = await Promise.all([
                axios.get(API_ENDPOINTS.faculty),
                axios.get(API_ENDPOINTS.subjects)
            ]);
            setFaculty(facRes.data);
            setSubjects(subRes.data);
            if (facRes.data.length > 0 && !selectedFaculty) {
                setSelectedFaculty(facRes.data[0].facultyId);
            }
            if (subRes.data.length > 0 && !selectedSubject) {
                setSelectedSubject(subRes.data[0].subjectId);
            }
            setError(null);
        } catch (err) {
            setError('Failed to load data');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { 
        fetchData(); 
    }, []);

    const handleAddFaculty = async (e) => {
        e.preventDefault();
        try {
            setIsLoading(true);
            await axios.post(API_ENDPOINTS.faculty, { name: facultyName });
            setFacultyName('');
            setError(null);
            fetchData();
        } catch (err) {
            setError('Failed to add faculty member');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteFaculty = async (id) => {
        if (window.confirm('Are you sure you want to delete this faculty member?')) {
            try {
                await axios.delete(`${API_ENDPOINTS.faculty}/${id}`);
                fetchData();
            } catch (err) {
                setError('Failed to delete faculty member');
            }
        }
    };

    const handleLinkSubject = async (e) => {
        e.preventDefault();
        if (!selectedFaculty || !selectedSubject) {
            setError("Please select both a faculty member and a subject.");
            return;
        }
        try {
            setIsLoading(true);
            await axios.post(API_ENDPOINTS.linkFaculty, { 
                facultyId: parseInt(selectedFaculty), 
                subjectId: parseInt(selectedSubject) 
            });
            setError(null);
            fetchData();
        } catch (err) {
            setError('Failed to link subject to faculty');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="admin-section">
            <div className="section-header">
                <h2>Manage Faculty</h2>
                <p>Add faculty members and assign subjects they can teach</p>
            </div>

            {error && <div className="error-message">{error}</div>}

            {/* Add Faculty Form */}
            <div className="form-section">
                <h3>Add New Faculty Member</h3>
                <form onSubmit={handleAddFaculty} className="admin-form">
                    <div className="form-group">
                        <label>Faculty Name</label>
                        <input 
                            type="text" 
                            placeholder="e.g., AVB - Mr. Arjun" 
                            value={facultyName} 
                            onChange={e => setFacultyName(e.target.value)} 
                            required 
                        />
                    </div>
                    <button type="submit" className="submit-button" disabled={isLoading}>
                        {isLoading ? 'Adding...' : 'Add Faculty'}
                    </button>
                </form>
            </div>

            {/* Link Faculty to Subject Form */}
            <div className="form-section">
                <h3>Assign Subject to Faculty</h3>
                <form onSubmit={handleLinkSubject} className="admin-form">
                    <div className="form-grid">
                        <div className="form-group">
                            <label>Select Faculty</label>
                            <select 
                                value={selectedFaculty} 
                                onChange={e => setSelectedFaculty(e.target.value)}
                                required
                            >
                                <option value="">-- Select Faculty --</option>
                                {faculty.map(f => (
                                    <option key={f.facultyId} value={f.facultyId}>
                                        {f.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Select Subject</label>
                            <select 
                                value={selectedSubject} 
                                onChange={e => setSelectedSubject(e.target.value)}
                                required
                            >
                                <option value="">-- Select Subject --</option>
                                {subjects.map(s => (
                                    <option key={s.subjectId} value={s.subjectId}>
                                        {s.subjectName} ({s.subjectCode})
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <button type="submit" className="submit-button" disabled={isLoading}>
                        {isLoading ? 'Linking...' : 'Link Subject'}
                    </button>
                </form>
            </div>

            {/* Faculty List */}
            <div className="data-table-container">
                <h3>Faculty Members ({faculty.length})</h3>
                {isLoading ? (
                    <div className="loading">Loading faculty data...</div>
                ) : (
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Faculty Name</th>
                                <th>Assigned Subjects</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {faculty.map(f => (
                                <tr key={f.facultyId}>
                                    <td>
                                        <span className="faculty-name">{f.name}</span>
                                    </td>
                                    <td>
                                        <div className="subjects-list">
                                            {f.subjects && f.subjects.length > 0 ? (
                                                f.subjects.map(subject => (
                                                    <span key={subject.subjectId} className="subject-tag">
                                                        {subject.subjectName}
                                                    </span>
                                                ))
                                            ) : (
                                                <span className="no-subjects">No subjects assigned</span>
                                            )}
                                        </div>
                                    </td>
                                    <td>
                                        <button 
                                            onClick={() => handleDeleteFaculty(f.facultyId)} 
                                            className="delete-button"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}

// Manage Time Slots Component
function ManageTimeSlots() {
    const [slots, setSlots] = useState([]);
    const [dayOfWeek, setDayOfWeek] = useState('Monday');
    const [startTime, setStartTime] = useState('07:45');
    const [endTime, setEndTime] = useState('08:40');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchData = async () => {
        try {
            setIsLoading(true);
            const result = await axios.get(API_ENDPOINTS.timeSlots);
            setSlots(result.data);
            setError(null);
        } catch (err) {
            setError('Failed to load time slots data');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { 
        fetchData(); 
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setIsLoading(true);
            await axios.post(API_ENDPOINTS.timeSlots, { 
                dayOfWeek, 
                startTime: `${startTime}:00`, 
                endTime: `${endTime}:00` 
            });
            setError(null);
            fetchData();
        } catch (err) {
            setError('Failed to add time slot');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this time slot?')) {
            try {
                await axios.delete(`${API_ENDPOINTS.timeSlots}/${id}`);
                fetchData();
            } catch (err) {
                setError('Failed to delete time slot');
            }
        }
    };

    // Group slots by day for better display
    const slotsByDay = slots.reduce((acc, slot) => {
        if (!acc[slot.dayOfWeek]) {
            acc[slot.dayOfWeek] = [];
        }
        acc[slot.dayOfWeek].push(slot);
        return acc;
    }, {});

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

    return (
        <div className="admin-section">
            <div className="section-header">
                <h2>Manage Time Slots</h2>
                <p>Define available time slots for scheduling classes throughout the week</p>
            </div>

            {error && <div className="error-message">{error}</div>}

            <form onSubmit={handleSubmit} className="admin-form">
                <div className="form-grid">
                    <div className="form-group">
                        <label>Day of Week</label>
                        <select value={dayOfWeek} onChange={e => setDayOfWeek(e.target.value)}>
                            {days.map(day => (
                                <option key={day} value={day}>{day}</option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Start Time</label>
                        <input 
                            type="time" 
                            value={startTime} 
                            onChange={e => setStartTime(e.target.value)} 
                            required 
                        />
                    </div>
                    <div className="form-group">
                        <label>End Time</label>
                        <input 
                            type="time" 
                            value={endTime} 
                            onChange={e => setEndTime(e.target.value)} 
                            required 
                        />
                    </div>
                </div>
                <button type="submit" className="submit-button" disabled={isLoading}>
                    {isLoading ? 'Adding...' : 'Add Time Slot'}
                </button>
            </form>

            <div className="data-table-container">
                <h3>Available Time Slots ({slots.length})</h3>
                {isLoading ? (
                    <div className="loading">Loading time slots...</div>
                ) : (
                    <div className="time-slots-grid">
                        {days.map(day => (
                            <div key={day} className="day-slot-group">
                                <h4 className="day-header">{day}</h4>
                                {slotsByDay[day] ? (
                                    <div className="slots-list">
                                        {slotsByDay[day]
                                            .sort((a, b) => a.startTime.localeCompare(b.startTime))
                                            .map(slot => (
                                                <div key={slot.slotId} className="time-slot-card">
                                                    <span className="slot-time">
                                                        {slot.startTime.substring(0, 5)} - {slot.endTime.substring(0, 5)}
                                                    </span>
                                                    <button 
                                                        onClick={() => handleDelete(slot.slotId)} 
                                                        className="delete-button small"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            ))
                                        }
                                    </div>
                                ) : (
                                    <p className="no-slots">No time slots defined</p>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default AdminDashboard;