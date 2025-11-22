CREATE Database TimetableDB

/* 1. Students Table: Stores data from 'Roll Call(Train).csv' */
CREATE TABLE Students (
    student_id INT IDENTITY(1,1) PRIMARY KEY,
    enrollment_no NVARCHAR(20) NOT NULL UNIQUE,
    /* 'name' is optional, but good to have */
    name NVARCHAR(100), 
    division_code NVARCHAR(10) NOT NULL,
    lab_batch INT NOT NULL
);

/* 2. Subjects Table: Stores all subjects, core and elective */
CREATE TABLE Subjects (
    subject_id INT IDENTITY(1,1) PRIMARY KEY,
    subject_code NVARCHAR(20) UNIQUE,
    subject_name NVARCHAR(100) NOT NULL,
    subject_type NVARCHAR(50) NOT NULL CHECK (subject_type IN ('Core', 'Professional Elective', 'Open Elective')),
    /* '1' for TRUE (is a lab), '0' for FALSE (is lecture) */
    requires_lab BIT NOT NULL DEFAULT 0 
);

/* 3. Faculty Table: Stores faculty information */
CREATE TABLE Faculty (
    faculty_id INT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(100) NOT NULL
);

/* 4. Rooms Table: Stores all available rooms and labs */
CREATE TABLE Rooms (
    room_id INT IDENTITY(1,1) PRIMARY KEY,
    room_number NVARCHAR(20) NOT NULL UNIQUE,
    room_type NVARCHAR(50) NOT NULL CHECK (room_type IN ('Lecture Hall', 'Lab')),
    capacity INT
);

/* 5. Time_Slots Table: Defines the weekly schedule grid */
CREATE TABLE Time_Slots (
    slot_id INT IDENTITY(1,1) PRIMARY KEY,
    day_of_week NVARCHAR(10) NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL
);

/* === Relationship Tables (Many-to-Many) === */

/* 6. Student_Elective_Choices: Links students to their chosen subjects from 'Elective Choice(Train).csv' */
CREATE TABLE Student_Elective_Choices (
    choice_id INT IDENTITY(1,1) PRIMARY KEY,
    student_id INT FOREIGN KEY REFERENCES Students(student_id),
    subject_id INT FOREIGN KEY REFERENCES Subjects(subject_id),
    UNIQUE(student_id, subject_id) /* A student can't choose the same subject twice */
);

/* 7. Faculty_Subjects: Links faculty to subjects they can teach */
CREATE TABLE Faculty_Subjects (
    faculty_id INT FOREIGN KEY REFERENCES Faculty(faculty_id),
    subject_id INT FOREIGN KEY REFERENCES Subjects(subject_id),
    PRIMARY KEY (faculty_id, subject_id) /* Composite primary key */
);

/* === The Main Output Table === */

/* 8. Timetable: This is where your generated schedule will be stored */
CREATE TABLE Timetable (
    class_id INT IDENTITY(1,1) PRIMARY KEY,
    subject_id INT FOREIGN KEY REFERENCES Subjects(subject_id),
    faculty_id INT FOREIGN KEY REFERENCES Faculty(faculty_id),
    room_id INT FOREIGN KEY REFERENCES Rooms(room_id),
    slot_id INT FOREIGN KEY REFERENCES Time_Slots(slot_id),
    
    /* This 'group_name' is key! 
       It will store 'CSE-5A', 'Batch-1', or 'PE_Internet_of_Things' */
    group_name NVARCHAR(50) NOT NULL 
);