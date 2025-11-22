/*
================================================================================
 SCRIPT TO SEED 'TimetableDB'
 This script populates all "rules" tables based on the provided PDF timetables
 for CSE-5A, CSE-5B, and CSE-5C.
================================================================================
*/

-- Make sure to use your database
USE TimetableDB;
GO

-- Disable foreign key checks to allow safe deletion
EXEC sp_MSforeachtable 'ALTER TABLE ? NOCHECK CONSTRAINT ALL'
GO

-- 1. DELETE OLD DATA
-- (We use DELETE instead of TRUNCATE due to potential foreign keys)
DELETE FROM Faculty_Subjects;
DELETE FROM Time_Slots;
DELETE FROM Rooms;
DELETE FROM Subjects;
DELETE FROM Faculty;
GO

-- Re-enable foreign key checks
EXEC sp_MSforeachtable 'ALTER TABLE ? WITH CHECK CHECK CONSTRAINT ALL'
GO

-- 2. RESET IDENTITY COUNTERS
-- (This makes sure your new IDs start back at 1)
DBCC CHECKIDENT ('Time_Slots', RESEED, 0);
DBCC CHECKIDENT ('Rooms', RESEED, 0);
DBCC CHECKIDENT ('Subjects', RESEED, 0);
DBCC CHECKIDENT ('Faculty', RESEED, 0);
GO


/*
================================================================================
 3. POPULATE 'Time_Slots' TABLE
 - Inserts 10 class slots for all 5 days (Monday-Friday)
 - Skips known break times
================================================================================
*/
PRINT 'Populating Time_Slots...';
DECLARE @Days TABLE (DayName NVARCHAR(10));
INSERT INTO @Days (DayName) VALUES ('Monday'), ('Tuesday'), ('Wednesday'), ('Thursday'), ('Friday');

INSERT INTO Time_Slots (day_of_week, start_time, end_time)
SELECT DayName, '07:45:00', '08:40:00' FROM @Days UNION ALL
SELECT DayName, '08:40:00', '09:35:00' FROM @Days UNION ALL
SELECT DayName, '09:50:00', '10:40:00' FROM @Days UNION ALL -- Skips 09:35-09:50 break
SELECT DayName, '10:40:00', '11:30:00' FROM @Days UNION ALL
SELECT DayName, '11:30:00', '12:20:00' FROM @Days UNION ALL
SELECT DayName, '01:00:00', '01:50:00' FROM @Days UNION ALL -- Skips 12:20-01:00 break
SELECT DayName, '01:50:00', '02:40:00' FROM @Days UNION ALL
SELECT DayName, '02:40:00', '03:30:00' FROM @Days UNION ALL
SELECT DayName, '03:45:00', '04:35:00' FROM @Days UNION ALL -- Skips 03:30-03:45 break
SELECT DayName, '04:35:00', '05:25:00' FROM @Days;
GO


/*
================================================================================
 4. POPULATE 'Rooms' TABLE
 - 'H-' prefix rooms are assumed to be 'Lab'
 - 'C-' prefix rooms are assumed to be 'Lecture Hall'
================================================================================
*/
PRINT 'Populating Rooms...';
INSERT INTO Rooms (room_number, room_type, capacity) VALUES
('H-405', 'Lab', 40), 
('H-203', 'Lab', 40),
('H-202', 'Lab', 40),
('H-302', 'Lab', 40),
('H-404', 'Lab', 40),
('H-401-2', 'Lab', 20),
('H-403', 'Lab', 40),
('H-205', 'Lab', 40),
('H-204', 'Lab', 40),
('C-301', 'Lab', 40),
('C-209', 'Lab', 40),
('C-306', 'Lab', 40),
('C-208', 'Lab', 40),
('C-312', 'Lab', 40),
('Audi-3','Lecture Hall', 200),
('Audi-4','Lecture Hall', 200),
('Audi-5','Lecture Hall', 200)
;
GO


/*
================================================================================
 5. POPULATE 'Subjects' TABLE
 - Populates all Core, Professional Elective (PE), and Open Elective (OE) subjects
 - Maps names from 'Elective Choice.csv' to subject codes from PDFs
 - 'requires_lab' is set to 1 (true) for all, as all subjects 
   in the PDFs have both (Lab) and (Lecture) components
================================================================================
*/
PRINT 'Populating Subjects...';
INSERT INTO Subjects (subject_code, subject_name, subject_type, requires_lab) VALUES
-- Core Subjects
('2301CS501', 'CN', 'Core', 1),
('2301CS402', 'DAA', 'Core', 1),
('2301CS503', 'DM', 'Core', 1),
('2301HS503', 'PC-II', 'Core', 1),

-- Professional Electives (PE)
('2301CS621', 'Adv.NET', 'Professional Elective', 1), -- 'Adv.NET' from CSV
('2301CS412', '.NET', 'Professional Elective', 1), -- '.NET' from CSV (mapped to ASP.NET Core)
('2301CS512', 'Adv.Flutter', 'Professional Elective', 1), -- 'Adv.Flutter' from CSV (mapped to Advance Flutter)
('2301CS413', 'Flutter', 'Professional Elective', 1), -- 'Flutter' from CSV (mapped to Mobile App Dev...)
('2301CS511', 'Advanced ReactJS', 'Professional Elective', 1), -- 'Advanced ReactJS' from PDF
('2301CS_ANG', 'Angular', 'Professional Elective', 1), -- 'Angular' from CSV (no code provided)
('2301CS_AWT', 'Adv.Web Technology', 'Professional Elective', 1), -- 'Adv.Web Technology' from CSV (no code provided)
('2301CS719', 'Unity Game', 'Professional Elective', 1), -- 'Unity Game' from CSV (mapped to Unity & Game Dev)
('2301CS414', 'PHP', 'Professional Elective', 1), -- 'PHP' from PDF (mapped to Web Programming)

-- Open Electives (OE)
('2301CS593', 'IoT', 'Open Elective', 1), -- 'IoT' from CSV (mapped to Internet of Things)
('2301CS595', 'Graph Theory', 'Open Elective', 1), -- 'Graph Theory' from CSV (mapped to Graph Theroy)
('2301CS594', 'BFSI', 'Open Elective', 1), -- 'BFSI' from CSV (mapped to Banking, Financial...)
('2301CS729', 'OR', 'Open Elective', 1); -- 'OR' from CSV (mapped to Operation Research)
GO


/*
================================================================================
 6. POPULATE 'Faculty' TABLE
 - Inserts all unique faculty members from the PDF files
================================================================================
*/
PRINT 'Populating Faculty...';
INSERT INTO Faculty (name) VALUES
('AVB - Mr. Arjun V Bala'),
('DAB - Mr. Dhaval A Bheda'), -- Assumed name
('DLK - Mr. Dhaval L Koria'), -- Assumed name
('JNP - Mr. Jaydeep N Padhiyar'),
('MFS - Mr. Mubin F Seta'),
('SVM - Dr. Sharon V Mohtra'),
('MPD - Ms. Mehuli P Domadiya'),
('TDR - Ms. Twinkle D Raithatha'),
('SSG - Ms. Sejal S Gupta'),
('MRF - Mr. Madhuresh R Fichadiya'),
('RGP - Mr. Ravi G Popat'), -- Assumed name
('MDB - Mr. Mehul D Bhundiya'),
('NKC - Ms. Nidhi K. Chitroda'),
('RJB - Ms. Radhika J Bhateliya'),
('BDJ - Mr. Bhushan D Joshi'),
('KNP - Mr. Kunal N Pattani'), -- Assumed name
('HRC - Mr. Hemang R Chath'),
('JDV - Mr. Jayesh D Vagadiya'),
('MDT - Mr. Maulik D Trivedi'),
('NRV - Mr. Naimish R Vadodariya'),
('PBV - Mr. Punit B Vadher'),
('VJK - Mr. Vishal J Kansagara');
GO


/*
================================================================================
 7. POPULATE 'Faculty_Subjects' TABLE
 - Links Faculty IDs to Subject IDs using subqueries
 - This is the most critical "rules" table
================================================================================
*/
PRINT 'Populating Faculty_Subjects...';

-- Helper variables for IDs
DECLARE @fid INT, @sid INT;

-- AVB -> Advanced ReactJS
SELECT @fid = faculty_id FROM Faculty WHERE name LIKE 'AVB%';
SELECT @sid = subject_id FROM Subjects WHERE subject_code = '2301CS511';
INSERT INTO Faculty_Subjects (faculty_id, subject_id) VALUES (@fid, @sid);

-- DAB -> CN
SELECT @fid = faculty_id FROM Faculty WHERE name LIKE 'DAB%';
SELECT @sid = subject_id FROM Subjects WHERE subject_code = '2301CS501';
INSERT INTO Faculty_Subjects (faculty_id, subject_id) VALUES (@fid, @sid);

-- JNP -> PC-II, OR
SELECT @fid = faculty_id FROM Faculty WHERE name LIKE 'JNP%';
SELECT @sid = subject_id FROM Subjects WHERE subject_code = '2301HS503';
INSERT INTO Faculty_Subjects (faculty_id, subject_id) VALUES (@fid, @sid);
SELECT @sid = subject_id FROM Subjects WHERE subject_code = '2301CS729';
INSERT INTO Faculty_Subjects (faculty_id, subject_id) VALUES (@fid, @sid);

-- MFS -> Graph Theory, OR
SELECT @fid = faculty_id FROM Faculty WHERE name LIKE 'MFS%';
SELECT @sid = subject_id FROM Subjects WHERE subject_code = '2301CS595';
INSERT INTO Faculty_Subjects (faculty_id, subject_id) VALUES (@fid, @sid);
SELECT @sid = subject_id FROM Subjects WHERE subject_code = '2301CS729';
INSERT INTO Faculty_Subjects (faculty_id, subject_id) VALUES (@fid, @sid);

-- SVM -> IoT
SELECT @fid = faculty_id FROM Faculty WHERE name LIKE 'SVM%';
SELECT @sid = subject_id FROM Subjects WHERE subject_code = '2301CS593';
INSERT INTO Faculty_Subjects (faculty_id, subject_id) VALUES (@fid, @sid);

-- MPD -> DM, OR
SELECT @fid = faculty_id FROM Faculty WHERE name LIKE 'MPD%';
SELECT @sid = subject_id FROM Subjects WHERE subject_code = '2301CS503';
INSERT INTO Faculty_Subjects (faculty_id, subject_id) VALUES (@fid, @sid);
SELECT @sid = subject_id FROM Subjects WHERE subject_code = '2301CS729';
INSERT INTO Faculty_Subjects (faculty_id, subject_id) VALUES (@fid, @sid);

-- DLK -> CN
SELECT @fid = faculty_id FROM Faculty WHERE name LIKE 'DLK%';
SELECT @sid = subject_id FROM Subjects WHERE subject_code = '2301CS501';
INSERT INTO Faculty_Subjects (faculty_id, subject_id) VALUES (@fid, @sid);

-- TDR -> PC-II
SELECT @fid = faculty_id FROM Faculty WHERE name LIKE 'TDR%';
SELECT @sid = subject_id FROM Subjects WHERE subject_code = '2301HS503';
INSERT INTO Faculty_Subjects (faculty_id, subject_id) VALUES (@fid, @sid);

-- SSG -> Adv.NET
SELECT @fid = faculty_id FROM Faculty WHERE name LIKE 'SSG%';
SELECT @sid = subject_id FROM Subjects WHERE subject_code = '2301CS621';
INSERT INTO Faculty_Subjects (faculty_id, subject_id) VALUES (@fid, @sid);

-- MRF -> Adv.NET, IoT
SELECT @fid = faculty_id FROM Faculty WHERE name LIKE 'MRF%';
SELECT @sid = subject_id FROM Subjects WHERE subject_code = '2301CS621';
INSERT INTO Faculty_Subjects (faculty_id, subject_id) VALUES (@fid, @sid);
SELECT @sid = subject_id FROM Subjects WHERE subject_code = '2301CS593';
INSERT INTO Faculty_Subjects (faculty_id, subject_id) VALUES (@fid, @sid);

-- RGP -> DAA
SELECT @fid = faculty_id FROM Faculty WHERE name LIKE 'RGP%';
SELECT @sid = subject_id FROM Subjects WHERE subject_code = '2301CS402';
INSERT INTO Faculty_Subjects (faculty_id, subject_id) VALUES (@fid, @sid);

-- MDB -> Adv.Flutter
SELECT @fid = faculty_id FROM Faculty WHERE name LIKE 'MDB%';
SELECT @sid = subject_id FROM Subjects WHERE subject_code = '2301CS512';
INSERT INTO Faculty_Subjects (faculty_id, subject_id) VALUES (@fid, @sid);

-- NKC -> DAA, Advanced ReactJS
SELECT @fid = faculty_id FROM Faculty WHERE name LIKE 'NKC%';
SELECT @sid = subject_id FROM Subjects WHERE subject_code = '2301CS402';
INSERT INTO Faculty_Subjects (faculty_id, subject_id) VALUES (@fid, @sid);
SELECT @sid = subject_id FROM Subjects WHERE subject_code = '2301CS511';
INSERT INTO Faculty_Subjects (faculty_id, subject_id) VALUES (@fid, @sid);

-- RJB -> PC-II
SELECT @fid = faculty_id FROM Faculty WHERE name LIKE 'RJB%';
SELECT @sid = subject_id FROM Subjects WHERE subject_code = '2301HS503';
INSERT INTO Faculty_Subjects (faculty_id, subject_id) VALUES (@fid, @sid);

-- BDJ -> IoT, BFSI
SELECT @fid = faculty_id FROM Faculty WHERE name LIKE 'BDJ%';
SELECT @sid = subject_id FROM Subjects WHERE subject_code = '2301CS593';
INSERT INTO Faculty_Subjects (faculty_id, subject_id) VALUES (@fid, @sid);
SELECT @sid = subject_id FROM Subjects WHERE subject_code = '2301CS594';
INSERT INTO Faculty_Subjects (faculty_id, subject_id) VALUES (@fid, @sid);

-- KNP -> DM
SELECT @fid = faculty_id FROM Faculty WHERE name LIKE 'KNP%';
SELECT @sid = subject_id FROM Subjects WHERE subject_code = '2301CS503';
INSERT INTO Faculty_Subjects (faculty_id, subject_id) VALUES (@fid, @sid);

-- HRC -> PHP, Graph Theory
SELECT @fid = faculty_id FROM Faculty WHERE name LIKE 'HRC%';
SELECT @sid = subject_id FROM Subjects WHERE subject_code = '2301CS414';
INSERT INTO Faculty_Subjects (faculty_id, subject_id) VALUES (@fid, @sid);
SELECT @sid = subject_id FROM Subjects WHERE subject_code = '2301CS595';
INSERT INTO Faculty_Subjects (faculty_id, subject_id) VALUES (@fid, @sid);

-- JDV -> Adv.NET, .NET, Flutter
SELECT @fid = faculty_id FROM Faculty WHERE name LIKE 'JDV%';
SELECT @sid = subject_id FROM Subjects WHERE subject_code = '2301CS621';
INSERT INTO Faculty_Subjects (faculty_id, subject_id) VALUES (@fid, @sid);
SELECT @sid = subject_id FROM Subjects WHERE subject_code = '2301CS412';
INSERT INTO Faculty_Subjects (faculty_id, subject_id) VALUES (@fid, @sid);
SELECT @sid = subject_id FROM Subjects WHERE subject_code = '2301CS413';
INSERT INTO Faculty_Subjects (faculty_id, subject_id) VALUES (@fid, @sid);

-- MDT -> Unity Game
SELECT @fid = faculty_id FROM Faculty WHERE name LIKE 'MDT%';
SELECT @sid = subject_id FROM Subjects WHERE subject_code = '2301CS719';
INSERT INTO Faculty_Subjects (faculty_id, subject_id) VALUES (@fid, @sid);

-- NRV -> Adv.Flutter
SELECT @fid = faculty_id FROM Faculty WHERE name LIKE 'NRV%';
SELECT @sid = subject_id FROM Subjects WHERE subject_code = '2301CS512';
INSERT INTO Faculty_Subjects (faculty_id, subject_id) VALUES (@fid, @sid);

-- PBV -> .NET
SELECT @fid = faculty_id FROM Faculty WHERE name LIKE 'PBV%';
SELECT @sid = subject_id FROM Subjects WHERE subject_code = '2L01CS412';
INSERT INTO Faculty_Subjects (faculty_id, subject_id) VALUES (@fid, @sid);

-- VJK -> BFSI
SELECT @fid = faculty_id FROM Faculty WHERE name LIKE 'VJK%';
SELECT @sid = subject_id FROM Subjects WHERE subject_code = '2301CS594';
INSERT INTO Faculty_Subjects (faculty_id, subject_id) VALUES (@fid, @sid);
GO

PRINT '================================================';
PRINT ' DATABASE SEEDING COMPLETE!';
PRINT '================================================';