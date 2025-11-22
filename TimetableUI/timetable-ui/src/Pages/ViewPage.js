import React, { useState, useMemo } from 'react';
import '../Css/ViewPage.css'; 

function ViewPage({ data, resetData }) {
    const [filterGroup, setFilterGroup] = useState('');

    // --- 1. Get all unique days, slots, and groups (using NEW flat model) ---
    const { days, timeSlots, groups } = useMemo(() => {
        const daySet = new Set();
        const slotSet = new Set();
        const groupSet = new Set();

        data.forEach(item => {
            daySet.add(item.dayOfWeek);
            slotSet.add(item.startTime);
            groupSet.add(item.groupName);
        });

        const sortedDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
        const sortedSlots = [...slotSet].sort((a, b) => a.localeCompare(b));
        const sortedGroups = [...groupSet].sort();

        // Set a default filter if one isn't set
        if (!filterGroup && sortedGroups.length > 0) {
            setFilterGroup(sortedGroups[0]);
        }

        return {
            days: sortedDays,
            timeSlots: sortedSlots,
            groups: sortedGroups
        };
    }, [data, filterGroup]);

    // --- 2. Filter the data based on the dropdown (using NEW flat model) ---
    const filteredData = data.filter(item => item.groupName && item.groupName.startsWith(filterGroup));

    // --- 3. Helper function to find a class for a cell (using NEW flat model) ---
    const getClassForCell = (day, time) => {
        return filteredData.find(item => 
            item.dayOfWeek === day && 
            item.startTime === time
        );
    };

    return (
        <div className="view-container">
            <div className="view-header">
                <div className="header-content">
                    <h1 className="page-title">Timetable View</h1>
                    <p className="page-subtitle">View and manage class schedules</p>
                </div>
            </div>

            <div className="controls-section">
                <div className="filter-controls">
                    <div className="filter-group">
                        <label className="filter-label">Show Timetable for:</label>
                        <select 
                            value={filterGroup} 
                            onChange={(e) => setFilterGroup(e.target.value)}
                            className="group-select"
                        >
                            {groups.map(group => (
                                <option key={group} value={group}>{group}</option>
                            ))}
                        </select>
                    </div>
                    <button onClick={resetData} className="reset-button">
                        <span className="reset-icon">↻</span>
                        Generate New Timetable
                    </button>
                </div>
            </div>

            <div className="timetable-wrapper">
                <table className="timetable-grid">
                    <thead>
                        <tr>
                            <th className="time-header">Time</th>
                            {days.map(day => (
                                <th key={day} className="day-header">
                                    <span className="day-text">{day}</span>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {timeSlots.map(time => (
                            <tr key={time} className="time-row">
                                <td className="time-cell">
                                    <span className="time-text">{time.substring(0, 5)}</span>
                                </td>
                                
                                {days.map(day => {
                                    const cellData = getClassForCell(day, time);
                                    return (
                                        <td key={day} className="schedule-cell">
                                            {/* --- 4. Render cell data (using NEW flat model) --- */}
                                            {cellData ? (
                                                <div className="class-card">
                                                    <div className="class-header">
                                                        <strong className="subject-name">{cellData.subjectName}</strong>
                                                    </div>
                                                    <div className="class-details">
                                                        <div className="detail-item">
                                                            <span className="detail-icon">👤</span>
                                                            <span className="detail-text">{cellData.facultyName}</span>
                                                        </div>
                                                        <div className="detail-item">
                                                            <span className="detail-icon">🏢</span>
                                                            <span className="detail-text">{cellData.roomNumber}</span>
                                                        </div>
                                                    </div>
                                                    <div className="class-group">
                                                        {cellData.groupName}
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="empty-cell">
                                                    <span className="empty-text">—</span>
                                                </div>
                                            )}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="timetable-footer">
                <div className="stats">
                    <span className="stat-item">
                        <strong>{timeSlots.length}</strong> time slots
                    </span>
                    <span className="stat-item">
                        <strong>{days.length}</strong> days
                    </span>
                    <span className="stat-item">
                        <strong>{groups.length}</strong> groups
                    </span>
                </div>
            </div>
        </div>
    );
}

export default ViewPage;