-- ============================================================
--  College Class Management System — Database Initialization
-- ============================================================

CREATE DATABASE IF NOT EXISTS college_db;
USE college_db;

-- Students Table
CREATE TABLE IF NOT EXISTS students (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    phone VARCHAR(15),
    department VARCHAR(50) NOT NULL,
    year INT NOT NULL,
    enrolled_date DATE NOT NULL,
    INDEX idx_department (department),
    INDEX idx_year (year),
    INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Classes Table
CREATE TABLE IF NOT EXISTS classes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    class_name VARCHAR(100) NOT NULL,
    subject VARCHAR(100) NOT NULL,
    teacher VARCHAR(100) NOT NULL,
    room VARCHAR(50),
    schedule VARCHAR(100),
    max_capacity INT NOT NULL DEFAULT 60
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Enrollments Table
CREATE TABLE IF NOT EXISTS enrollments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    class_id INT NOT NULL,
    grade VARCHAR(5),
    enrollment_date DATE NOT NULL,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
    INDEX idx_student (student_id),
    INDEX idx_class (class_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- ============================================================
--  Seed Data: Students
-- ============================================================

INSERT INTO students (name, email, phone, department, year, enrolled_date) VALUES
('Rajveer Singh',     'rajveer@college.edu',     '9876543210', 'CSE', 2, '2024-08-01'),
('Ananya Sharma',     'ananya@college.edu',      '9876543211', 'CSE', 3, '2023-08-01'),
('Arjun Patel',       'arjun@college.edu',       '9876543212', 'ECE', 1, '2025-08-01'),
('Priya Gupta',       'priya@college.edu',       '9876543213', 'IT',  2, '2024-08-01'),
('Rohit Kumar',       'rohit@college.edu',       '9876543214', 'ME',  4, '2021-08-01'),
('Sneha Reddy',       'sneha@college.edu',       '9876543215', 'CSE', 1, '2025-08-01'),
('Vikram Joshi',      'vikram@college.edu',      '9876543216', 'EE',  3, '2023-08-01'),
('Neha Agarwal',      'neha@college.edu',        '9876543217', 'IT',  2, '2024-08-01'),
('Amit Verma',        'amit@college.edu',        '9876543218', 'ECE', 2, '2024-08-01'),
('Kavita Singh',      'kavita@college.edu',      '9876543219', 'MBA', 1, '2025-08-01'),
('Deepak Chauhan',    'deepak@college.edu',      '9876543220', 'CSE', 3, '2023-08-01'),
('Pooja Mishra',      'pooja@college.edu',       '9876543221', 'ME',  2, '2024-08-01'),
('Rahul Tiwari',      'rahul@college.edu',       '9876543222', 'BCA', 1, '2025-08-01'),
('Shruti Nair',       'shruti@college.edu',      '9876543223', 'CSE', 4, '2021-08-01'),
('Manish Yadav',      'manish@college.edu',      '9876543224', 'EE',  2, '2024-08-01');


-- ============================================================
--  Seed Data: Classes
-- ============================================================

INSERT INTO classes (class_name, subject, teacher, room, schedule, max_capacity) VALUES
('CS-101', 'Data Structures & Algorithms', 'Dr. R.K. Sharma',    'Room 201', 'Mon/Wed 10:00-11:30', 60),
('CS-201', 'Database Management Systems',  'Prof. S. Gupta',     'Room 202', 'Tue/Thu 09:00-10:30', 50),
('CS-301', 'Machine Learning',             'Dr. A. Kumar',       'Room 301', 'Mon/Wed 14:00-15:30', 40),
('EC-101', 'Digital Electronics',           'Prof. M. Reddy',     'Room 102', 'Tue/Thu 11:00-12:30', 55),
('IT-201', 'Web Development',              'Prof. N. Singh',     'Room 205', 'Wed/Fri 10:00-11:30', 45),
('ME-101', 'Engineering Mechanics',        'Dr. P. Joshi',       'Room 104', 'Mon/Wed 09:00-10:30', 50),
('MB-101', 'Business Management',          'Prof. K. Agarwal',   'Room 401', 'Tue/Thu 14:00-15:30', 60),
('EE-201', 'Power Systems',               'Dr. V. Chauhan',     'Room 103', 'Mon/Fri 11:00-12:30', 45);


-- ============================================================
--  Seed Data: Enrollments
-- ============================================================

INSERT INTO enrollments (student_id, class_id, grade, enrollment_date) VALUES
-- Rajveer (CSE, Year 2) → DSA, DBMS
(1, 1, 'A',    '2024-08-15'),
(1, 2, 'A+',   '2024-08-15'),

-- Ananya (CSE, Year 3) → ML, DBMS
(2, 3, 'A',    '2023-08-15'),
(2, 2, 'B+',   '2023-08-15'),

-- Arjun (ECE, Year 1) → Digital Electronics
(3, 4, NULL,   '2025-08-15'),

-- Priya (IT, Year 2) → Web Dev, DSA
(4, 5, 'A+',   '2024-08-15'),
(4, 1, 'B',    '2024-08-15'),

-- Rohit (ME, Year 4) → Engg Mechanics
(5, 6, 'B+',   '2021-08-15'),

-- Sneha (CSE, Year 1) → DSA
(6, 1, NULL,   '2025-08-15'),

-- Vikram (EE, Year 3) → Power Systems
(7, 8, 'A',    '2023-08-15'),

-- Neha (IT, Year 2) → Web Dev
(8, 5, 'A',    '2024-08-15'),

-- Amit (ECE, Year 2) → Digital Electronics
(9, 4, 'B+',   '2024-08-15'),

-- Kavita (MBA, Year 1) → Business Management
(10, 7, NULL,  '2025-08-15'),

-- Deepak (CSE, Year 3) → ML, DSA
(11, 3, 'B',   '2023-08-15'),
(11, 1, 'A',   '2023-08-15'),

-- Pooja (ME, Year 2) → Engg Mechanics
(12, 6, 'A',   '2024-08-15'),

-- Rahul (BCA, Year 1) → Web Dev
(13, 5, NULL,  '2025-08-15'),

-- Shruti (CSE, Year 4) → ML, DBMS
(14, 3, 'A+',  '2021-08-15'),
(14, 2, 'A',   '2021-08-15'),

-- Manish (EE, Year 2) → Power Systems, Digital Electronics
(15, 8, 'B',   '2024-08-15'),
(15, 4, 'A',   '2024-08-15');
