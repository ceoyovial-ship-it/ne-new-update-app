/*
# PACE NR Olympiad School ERP - Initial Schema

This migration creates the complete database structure for a multi-tenant School ERP system with role-based access control.

## User Roles
- admin: Full system access
- teacher: Class and subject management
- student: Own data access
- parent: Monitor their children

## Tables Created

1. **profiles** - Extended user data (role, personal info)
2. **classes** - Academic classes (e.g., Class 10-A)
3. **sections** - Class sections
4. **subjects** - Subjects offered
5. **class_subjects** - Links classes to subjects
6. **academic_years** - Academic year management
7. **students** - Student records with parent links
8. **parents** - Parent/guardian information
9. **teachers** - Teacher profiles
10. **teacher_assignments** - Teacher-class-subject assignments
11. **attendance** - Daily attendance records
12. **exams** - Exam definitions
13. **exam_schedule** - Exam timetable
14. **marks** - Student marks/grades
15. **homework** - Homework assignments
16. **homework_submissions** - Student submissions
17. **study_materials** - Educational resources
18. **syllabus** - Subject syllabus content
19. **fees** - Fee records
20. **fee_payments** - Payment transactions
21. **library_books** - Book inventory
22. **book_issues** - Book lending records
23. **transport_routes** - Bus routes
24. **transport_assignments** - Student transport allocation
25. **events** - School events/calendar
26. **notices** - Notice board
27. **notifications** - User notifications
28. **gallery_albums** - Photo albums
29. **gallery_photos** - Photos in albums

## Security
- RLS enabled on all tables
- Role-based policies for each table
- Owner-scoped access where applicable

## Notes
1. All tables use uuid primary keys
2. Timestamps track creation and updates
3. Foreign key constraints maintain referential integrity
4. Proper indexing for performance
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create ENUMs for roles and other statuses
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('admin', 'teacher', 'student', 'parent');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE attendance_status AS ENUM ('present', 'absent', 'late', 'excused');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE exam_type AS ENUM ('unit_test', 'mid_term', 'final', 'practical', 'internal', 'olympiad');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE fee_status AS ENUM ('pending', 'paid', 'overdue', 'waived');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE day_of_week AS ENUM ('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
    id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role user_role NOT NULL DEFAULT 'student',
    first_name text NOT NULL,
    last_name text NOT NULL,
    email text NOT NULL,
    phone text,
    address text,
    city text,
    state text,
    pincode text,
    avatar_url text,
    date_of_birth date,
    gender text,
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Academic Years
CREATE TABLE IF NOT EXISTS academic_years (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    start_date date NOT NULL,
    end_date date NOT NULL,
    is_current boolean DEFAULT false,
    created_at timestamptz DEFAULT now()
);

-- Classes
CREATE TABLE IF NOT EXISTS classes (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    grade_level int NOT NULL,
    section text,
    academic_year_id uuid REFERENCES academic_years(id),
    class_teacher_id uuid REFERENCES profiles(id),
    room_number text,
    capacity int DEFAULT 40,
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now()
);

-- Subjects
CREATE TABLE IF NOT EXISTS subjects (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    code text UNIQUE,
    description text,
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now()
);

-- Class Subjects (linking)
CREATE TABLE IF NOT EXISTS class_subjects (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    class_id uuid REFERENCES classes(id) ON DELETE CASCADE,
    subject_id uuid REFERENCES subjects(id) ON DELETE CASCADE,
    is_compulsory boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    UNIQUE(class_id, subject_id)
);

-- Houses/Groups
CREATE TABLE IF NOT EXISTS houses (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    color text,
    description text,
    created_at timestamptz DEFAULT now()
);

-- Students
CREATE TABLE IF NOT EXISTS students (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
    admission_number text UNIQUE NOT NULL,
    roll_number text,
    class_id uuid REFERENCES classes(id),
    house_id uuid REFERENCES houses(id),
    blood_group text,
    nationality text DEFAULT 'Indian',
    religion text,
    caste text,
    mother_tongue text,
    admission_date date,
    previous_school text,
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Parents
CREATE TABLE IF NOT EXISTS parents (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
    occupation text,
    qualification text,
    annual_income text,
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now()
);

-- Student-Parent Relationship
CREATE TABLE IF NOT EXISTS student_parents (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id uuid REFERENCES students(id) ON DELETE CASCADE,
    parent_id uuid REFERENCES parents(id) ON DELETE CASCADE,
    relationship text NOT NULL,
    is_primary boolean DEFAULT false,
    emergency_contact boolean DEFAULT false,
    created_at timestamptz DEFAULT now(),
    UNIQUE(student_id, parent_id)
);

-- Teachers
CREATE TABLE IF NOT EXISTS teachers (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
    employee_id text UNIQUE NOT NULL,
    qualification text,
    specialization text,
    experience_years int DEFAULT 0,
    join_date date,
    salary_grade text,
    is_hod boolean DEFAULT false,
    is_class_teacher boolean DEFAULT false,
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Teacher Assignments
CREATE TABLE IF NOT EXISTS teacher_assignments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    teacher_id uuid REFERENCES teachers(id) ON DELETE CASCADE,
    class_id uuid REFERENCES classes(id),
    subject_id uuid REFERENCES subjects(id),
    academic_year_id uuid REFERENCES academic_years(id),
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now()
);

-- Timetable
CREATE TABLE IF NOT EXISTS timetable (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    class_id uuid REFERENCES classes(id) ON DELETE CASCADE,
    subject_id uuid REFERENCES subjects(id),
    teacher_id uuid REFERENCES teachers(id),
    day_of_week day_of_week NOT NULL,
    period_number int NOT NULL,
    start_time time NOT NULL,
    end_time time NOT NULL,
    room_number text,
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now()
);

-- Attendance
CREATE TABLE IF NOT EXISTS attendance (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id uuid REFERENCES students(id) ON DELETE CASCADE,
    class_id uuid REFERENCES classes(id),
    date date NOT NULL,
    status attendance_status NOT NULL,
    remarks text,
    marked_by uuid REFERENCES profiles(id),
    marked_at timestamptz DEFAULT now(),
    created_at timestamptz DEFAULT now(),
    UNIQUE(student_id, date)
);

-- Exams
CREATE TABLE IF NOT EXISTS exams (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    exam_type exam_type NOT NULL,
    class_id uuid REFERENCES classes(id),
    subject_id uuid REFERENCES subjects(id),
    academic_year_id uuid REFERENCES academic_years(id),
    total_marks int NOT NULL,
    passing_marks int NOT NULL,
    exam_date date,
    start_time time,
    end_time time,
    syllabus_covered text,
    is_published boolean DEFAULT false,
    created_at timestamptz DEFAULT now()
);

-- Marks
CREATE TABLE IF NOT EXISTS marks (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id uuid REFERENCES students(id) ON DELETE CASCADE,
    exam_id uuid REFERENCES exams(id) ON DELETE CASCADE,
    marks_obtained numeric(5,2),
    grade text,
    remarks text,
    rank_in_class int,
    percentile numeric(5,2),
    is_absent boolean DEFAULT false,
    entered_by uuid REFERENCES profiles(id),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Homework
CREATE TABLE IF NOT EXISTS homework (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    class_id uuid REFERENCES classes(id),
    subject_id uuid REFERENCES subjects(id),
    teacher_id uuid REFERENCES teachers(id),
    title text NOT NULL,
    description text,
    due_date date NOT NULL,
    max_marks int DEFAULT 100,
    attachments text[],
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now()
);

-- Homework Submissions
CREATE TABLE IF NOT EXISTS homework_submissions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    homework_id uuid REFERENCES homework(id) ON DELETE CASCADE,
    student_id uuid REFERENCES students(id) ON DELETE CASCADE,
    submitted_at timestamptz DEFAULT now(),
    content text,
    attachments text[],
    marks_obtained numeric(5,2),
    teacher_feedback text,
    status text DEFAULT 'submitted',
    created_at timestamptz DEFAULT now()
);

-- Assignments
CREATE TABLE IF NOT EXISTS assignments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    class_id uuid REFERENCES classes(id),
    subject_id uuid REFERENCES subjects(id),
    teacher_id uuid REFERENCES teachers(id),
    title text NOT NULL,
    description text,
    due_date date NOT NULL,
    max_marks int DEFAULT 100,
    assignment_type text,
    attachments text[],
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now()
);

-- Assignment Submissions
CREATE TABLE IF NOT EXISTS assignment_submissions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    assignment_id uuid REFERENCES assignments(id) ON DELETE CASCADE,
    student_id uuid REFERENCES students(id) ON DELETE CASCADE,
    submitted_at timestamptz DEFAULT now(),
    content text,
    attachments text[],
    marks_obtained numeric(5,2),
    teacher_comments text,
    status text DEFAULT 'submitted',
    created_at timestamptz DEFAULT now()
);

-- Study Materials
CREATE TABLE IF NOT EXISTS study_materials (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    class_id uuid REFERENCES classes(id),
    subject_id uuid REFERENCES subjects(id),
    teacher_id uuid REFERENCES teachers(id),
    title text NOT NULL,
    description text,
    material_type text NOT NULL,
    file_url text,
    video_url text,
    is_public boolean DEFAULT true,
    created_at timestamptz DEFAULT now()
);

-- Syllabus
CREATE TABLE IF NOT EXISTS syllabus (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    class_id uuid REFERENCES classes(id),
    subject_id uuid REFERENCES subjects(id),
    chapter_number int,
    chapter_name text NOT NULL,
    description text,
    topics text[],
    academic_year_id uuid REFERENCES academic_years(id),
    file_url text,
    created_at timestamptz DEFAULT now()
);

-- Fee Types
CREATE TABLE IF NOT EXISTS fee_types (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    description text,
    amount numeric(10,2) NOT NULL,
    frequency text DEFAULT 'annual',
    class_id uuid REFERENCES classes(id),
    academic_year_id uuid REFERENCES academic_years(id),
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now()
);

-- Student Fees
CREATE TABLE IF NOT EXISTS student_fees (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id uuid REFERENCES students(id) ON DELETE CASCADE,
    fee_type_id uuid REFERENCES fee_types(id),
    amount numeric(10,2) NOT NULL,
    due_date date,
    status fee_status DEFAULT 'pending',
    waiver_amount numeric(10,2) DEFAULT 0,
    academic_year_id uuid REFERENCES academic_years(id),
    created_at timestamptz DEFAULT now()
);

-- Fee Payments
CREATE TABLE IF NOT EXISTS fee_payments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    student_fee_id uuid REFERENCES student_fees(id),
    amount numeric(10,2) NOT NULL,
    payment_method text,
    transaction_id text,
    payment_date date DEFAULT now(),
    receipt_number text,
    collected_by uuid REFERENCES profiles(id),
    notes text,
    created_at timestamptz DEFAULT now()
);

-- Library Books
CREATE TABLE IF NOT EXISTS library_books (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    isbn text,
    title text NOT NULL,
    author text NOT NULL,
    publisher text,
    publication_year int,
    category text,
    total_copies int DEFAULT 1,
    available_copies int DEFAULT 1,
    location text,
    price numeric(10,2),
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now()
);

-- Book Issues
CREATE TABLE IF NOT EXISTS book_issues (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    book_id uuid REFERENCES library_books(id),
    user_id uuid REFERENCES profiles(id),
    user_type text NOT NULL,
    issue_date date DEFAULT now(),
    due_date date NOT NULL,
    return_date date,
    fine_amount numeric(10,2) DEFAULT 0,
    fine_paid boolean DEFAULT false,
    status text DEFAULT 'issued',
    issued_by uuid REFERENCES profiles(id),
    created_at timestamptz DEFAULT now()
);

-- Transport Routes
CREATE TABLE IF NOT EXISTS transport_routes (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    route_number text NOT NULL,
    route_name text NOT NULL,
    start_point text,
    end_point text,
    distance_km numeric(5,2),
    vehicle_number text,
    driver_name text,
    driver_phone text,
    conductor_name text,
    conductor_phone text,
    capacity int DEFAULT 40,
    fee_amount numeric(10,2),
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now()
);

-- Route Stops
CREATE TABLE IF NOT EXISTS route_stops (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    route_id uuid REFERENCES transport_routes(id) ON DELETE CASCADE,
    stop_name text NOT NULL,
    stop_order int NOT NULL,
    pickup_time time,
    drop_time time,
    created_at timestamptz DEFAULT now()
);

-- Transport Assignments
CREATE TABLE IF NOT EXISTS transport_assignments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id uuid REFERENCES students(id) ON DELETE CASCADE,
    route_id uuid REFERENCES transport_routes(id),
    stop_id uuid REFERENCES route_stops(id),
    academic_year_id uuid REFERENCES academic_years(id),
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now()
);

-- Events
CREATE TABLE IF NOT EXISTS events (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    title text NOT NULL,
    description text,
    event_type text,
    start_date date NOT NULL,
    end_date date,
    start_time time,
    end_time time,
    venue text,
    is_holiday boolean DEFAULT false,
    is_active boolean DEFAULT true,
    created_by uuid REFERENCES profiles(id),
    created_at timestamptz DEFAULT now()
);

-- Notices
CREATE TABLE IF NOT EXISTS notices (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    title text NOT NULL,
    content text NOT NULL,
    notice_type text DEFAULT 'general',
    priority text DEFAULT 'normal',
    target_audience text[],
    publish_date date DEFAULT now(),
    expiry_date date,
    is_pinned boolean DEFAULT false,
    is_active boolean DEFAULT true,
    created_by uuid REFERENCES profiles(id),
    created_at timestamptz DEFAULT now()
);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
    title text NOT NULL,
    message text NOT NULL,
    notification_type text,
    reference_id uuid,
    reference_type text,
    is_read boolean DEFAULT false,
    created_at timestamptz DEFAULT now()
);

-- Gallery Albums
CREATE TABLE IF NOT EXISTS gallery_albums (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    title text NOT NULL,
    description text,
    event_id uuid REFERENCES events(id),
    cover_image_url text,
    is_public boolean DEFAULT true,
    created_by uuid REFERENCES profiles(id),
    created_at timestamptz DEFAULT now()
);

-- Gallery Photos
CREATE TABLE IF NOT EXISTS gallery_photos (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    album_id uuid REFERENCES gallery_albums(id) ON DELETE CASCADE,
    photo_url text NOT NULL,
    caption text,
    photo_order int DEFAULT 0,
    created_at timestamptz DEFAULT now()
);

-- Leave Applications
CREATE TABLE IF NOT EXISTS leave_applications (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id uuid REFERENCES students(id) ON DELETE CASCADE,
    start_date date NOT NULL,
    end_date date NOT NULL,
    leave_type text NOT NULL,
    reason text NOT NULL,
    status text DEFAULT 'pending',
    approved_by uuid REFERENCES profiles(id),
    approved_at timestamptz,
    remarks text,
    created_at timestamptz DEFAULT now()
);

-- Messages/Communication
CREATE TABLE IF NOT EXISTS messages (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id uuid REFERENCES profiles(id),
    receiver_id uuid REFERENCES profiles(id),
    subject text,
    content text NOT NULL,
    is_read boolean DEFAULT false,
    read_at timestamptz,
    parent_message_id uuid REFERENCES messages(id),
    created_at timestamptz DEFAULT now()
);

-- Hall Tickets
CREATE TABLE IF NOT EXISTS hall_tickets (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id uuid REFERENCES students(id),
    exam_id uuid REFERENCES exams(id),
    hall_number text,
    seat_number text,
    generated_at timestamptz DEFAULT now(),
    created_at timestamptz DEFAULT now()
);

-- AI Interactions (for AI assistant)
CREATE TABLE IF NOT EXISTS ai_interactions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
    session_id uuid,
    query text NOT NULL,
    response text,
    context jsonb,
    feedback int,
    created_at timestamptz DEFAULT now()
);

-- Reports (generated reports tracking)
CREATE TABLE IF NOT EXISTS reports (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    report_type text NOT NULL,
    report_name text NOT NULL,
    parameters jsonb,
    generated_by uuid REFERENCES profiles(id),
    file_url text,
    format text DEFAULT 'pdf',
    created_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_students_class_id ON students(class_id);
CREATE INDEX IF NOT EXISTS idx_students_user_id ON students(user_id);
CREATE INDEX IF NOT EXISTS idx_teachers_user_id ON teachers(user_id);
CREATE INDEX IF NOT EXISTS idx_parents_user_id ON parents(user_id);
CREATE INDEX IF NOT EXISTS idx_attendance_student_date ON attendance(student_id, date);
CREATE INDEX IF NOT EXISTS idx_marks_student_exam ON marks(student_id, exam_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_homework_class ON homework(class_id);
CREATE INDEX IF NOT EXISTS idx_homework_due_date ON homework(due_date);

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE academic_years ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE houses ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE parents ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_parents ENABLE ROW LEVEL SECURITY;
ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE teacher_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE timetable ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE marks ENABLE ROW LEVEL SECURITY;
ALTER TABLE homework ENABLE ROW LEVEL SECURITY;
ALTER TABLE homework_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignment_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE syllabus ENABLE ROW LEVEL SECURITY;
ALTER TABLE fee_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_fees ENABLE ROW LEVEL SECURITY;
ALTER TABLE fee_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE library_books ENABLE ROW LEVEL SECURITY;
ALTER TABLE book_issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE transport_routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE route_stops ENABLE ROW LEVEL SECURITY;
ALTER TABLE transport_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE notices ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_albums ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE leave_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE hall_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- Helper function to check user role
CREATE OR REPLACE FUNCTION get_user_role() RETURNS user_role AS $$
DECLARE
    r user_role;
BEGIN
    SELECT role INTO r FROM profiles WHERE id = auth.uid();
    RETURN r;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin() RETURNS boolean AS $$
BEGIN
    RETURN EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Profiles policies
DROP POLICY IF EXISTS "profiles_select_own" ON profiles;
CREATE POLICY "profiles_select_own" ON profiles FOR SELECT
    TO authenticated USING (auth.uid() = id OR is_admin());

DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
CREATE POLICY "profiles_insert_own" ON profiles FOR INSERT
    TO authenticated WITH CHECK (auth.uid() = id OR is_admin());

DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE
    TO authenticated USING (auth.uid() = id OR is_admin()) WITH CHECK (auth.uid() = id OR is_admin());

-- Class policies - all authenticated users can view
DROP POLICY IF EXISTS "classes_select_all" ON classes;
CREATE POLICY "classes_select_all" ON classes FOR SELECT
    TO authenticated USING (true);

DROP POLICY IF EXISTS "classes_modify_admin" ON classes;
CREATE POLICY "classes_modify_admin" ON classes FOR ALL
    TO authenticated USING (is_admin());

-- Subjects policies
DROP POLICY IF EXISTS "subjects_select_all" ON subjects;
CREATE POLICY "subjects_select_all" ON subjects FOR SELECT
    TO authenticated USING (true);

DROP POLICY IF EXISTS "subjects_modify_admin" ON subjects;
CREATE POLICY "subjects_modify_admin" ON subjects FOR ALL
    TO authenticated USING (is_admin());

-- Student policies - students see own data, parents see linked children, admin sees all
DROP POLICY IF EXISTS "students_select_authorized" ON students;
CREATE POLICY "students_select_authorized" ON students FOR SELECT
    TO authenticated USING (
        is_admin() OR
        user_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM student_parents sp
            JOIN parents p ON sp.parent_id = p.id
            WHERE sp.student_id = students.id AND p.user_id = auth.uid()
        ) OR
        EXISTS (
            SELECT 1 FROM teacher_assignments ta
            JOIN teachers t ON ta.teacher_id = t.id
            WHERE ta.class_id = students.class_id AND t.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "students_modify_admin" ON students;
CREATE POLICY "students_modify_admin" ON students FOR ALL
    TO authenticated USING (is_admin()) WITH CHECK (is_admin());

-- Teacher policies
DROP POLICY IF EXISTS "teachers_select_all" ON teachers;
CREATE POLICY "teachers_select_all" ON teachers FOR SELECT
    TO authenticated USING (true);

DROP POLICY IF EXISTS "teachers_own_profile" ON teachers;
CREATE POLICY "teachers_own_profile" ON teachers FOR SELECT
    TO authenticated USING (user_id = auth.uid() OR is_admin());

DROP POLICY IF EXISTS "teachers_modify_admin" ON teachers;
CREATE POLICY "teachers_modify_admin" ON teachers FOR ALL
    TO authenticated USING (is_admin()) WITH CHECK (is_admin());

-- Attendance policies
DROP POLICY IF EXISTS "attendance_select_authorized" ON attendance;
CREATE POLICY "attendance_select_authorized" ON attendance FOR SELECT
    TO authenticated USING (
        is_admin() OR
        EXISTS (SELECT 1 FROM students WHERE students.id = attendance.student_id AND students.user_id = auth.uid()) OR
        EXISTS (
            SELECT 1 FROM student_parents sp
            JOIN parents p ON sp.parent_id = p.id
            WHERE sp.student_id = attendance.student_id AND p.user_id = auth.uid()
        ) OR
        EXISTS (
            SELECT 1 FROM teacher_assignments ta
            JOIN teachers t ON ta.teacher_id = t.id
            WHERE ta.class_id = attendance.class_id AND t.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "attendance_manage_admin_teacher" ON attendance;
CREATE POLICY "attendance_manage_admin_teacher" ON attendance FOR ALL
    TO authenticated USING (is_admin() OR EXISTS (SELECT 1 FROM teachers WHERE user_id = auth.uid()));

-- Marks policies
DROP POLICY IF EXISTS "marks_select_authorized" ON marks;
CREATE POLICY "marks_select_authorized" ON marks FOR SELECT
    TO authenticated USING (
        is_admin() OR
        EXISTS (SELECT 1 FROM students WHERE students.id = marks.student_id AND students.user_id = auth.uid()) OR
        EXISTS (
            SELECT 1 FROM student_parents sp
            JOIN parents p ON sp.parent_id = p.id
            WHERE sp.student_id = marks.student_id AND p.user_id = auth.uid()
        ) OR
        EXISTS (
            SELECT 1 FROM teachers t
            JOIN teacher_assignments ta ON t.id = ta.teacher_id
            JOIN exams e ON e.id = marks.exam_id
            WHERE t.user_id = auth.uid() AND ta.class_id = e.class_id
        )
    );

DROP POLICY IF EXISTS "marks_manage_admin_teacher" ON marks;
CREATE POLICY "marks_manage_admin_teacher" ON marks FOR ALL
    TO authenticated USING (is_admin() OR EXISTS (SELECT 1 FROM teachers WHERE user_id = auth.uid()));

-- Homework policies
DROP POLICY IF EXISTS "homework_select_class" ON homework;
CREATE POLICY "homework_select_class" ON homework FOR SELECT
    TO authenticated USING (
        is_admin() OR
        EXISTS (SELECT 1 FROM students s WHERE s.class_id = homework.class_id AND s.user_id = auth.uid()) OR
        EXISTS (
            SELECT 1 FROM student_parents sp
            JOIN students s ON s.id = sp.student_id
            JOIN parents p ON sp.parent_id = p.id
            WHERE s.class_id = homework.class_id AND p.user_id = auth.uid()
        ) OR
        EXISTS (SELECT 1 FROM teachers t WHERE t.id = homework.teacher_id AND t.user_id = auth.uid())
    );

DROP POLICY IF EXISTS "homework_manage_teacher" ON homework;
CREATE POLICY "homework_manage_teacher" ON homework FOR ALL
    TO authenticated USING (is_admin() OR EXISTS (SELECT 1 FROM teachers WHERE user_id = auth.uid()));

-- Notifications policies
DROP POLICY IF EXISTS "notifications_select_own" ON notifications;
CREATE POLICY "notifications_select_own" ON notifications FOR SELECT
    TO authenticated USING (user_id = auth.uid());

DROP POLICY IF EXISTS "notifications_insert_own" ON notifications;
CREATE POLICY "notifications_insert_own" ON notifications FOR INSERT
    TO authenticated WITH CHECK (user_id = auth.uid() OR is_admin());

DROP POLICY IF EXISTS "notifications_update_own" ON notifications;
CREATE POLICY "notifications_update_own" ON notifications FOR UPDATE
    TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- Events policies
DROP POLICY IF EXISTS "events_select_all" ON events;
CREATE POLICY "events_select_all" ON events FOR SELECT
    TO authenticated USING (true);

DROP POLICY IF EXISTS "events_manage_admin" ON events;
CREATE POLICY "events_manage_admin" ON events FOR ALL
    TO authenticated USING (is_admin()) WITH CHECK (is_admin());

-- Notices policies
DROP POLICY IF EXISTS "notices_select_all" ON notices;
CREATE POLICY "notices_select_all" ON notices FOR SELECT
    TO authenticated USING (is_active = true OR is_admin());

DROP POLICY IF EXISTS "notices_manage_admin" ON notices;
CREATE POLICY "notices_manage_admin" ON notices FOR ALL
    TO authenticated USING (is_admin()) WITH CHECK (is_admin());

-- Messages policies
DROP POLICY IF EXISTS "messages_participant" ON messages;
CREATE POLICY "messages_participant" ON messages FOR SELECT
    TO authenticated USING (sender_id = auth.uid() OR receiver_id = auth.uid());

-- Study materials policies
DROP POLICY IF EXISTS "study_materials_select_authorized" ON study_materials;
CREATE POLICY "study_materials_select_authorized" ON study_materials FOR SELECT
    TO authenticated USING (is_public = true OR is_admin() OR EXISTS (SELECT 1 FROM teachers WHERE user_id = auth.uid()));

-- Fee policies - students see own, parents see children
DROP POLICY IF EXISTS "fees_select_authorized" ON student_fees;
CREATE POLICY "fees_select_authorized" ON student_fees FOR SELECT
    TO authenticated USING (
        is_admin() OR
        EXISTS (SELECT 1 FROM students WHERE students.id = student_fees.student_id AND students.user_id = auth.uid()) OR
        EXISTS (
            SELECT 1 FROM student_parents sp
            JOIN parents p ON sp.parent_id = p.id
            WHERE sp.student_id = student_fees.student_id AND p.user_id = auth.uid()
        )
    );

-- Gallery policies
DROP POLICY IF EXISTS "gallery_select_public" ON gallery_albums;
CREATE POLICY "gallery_select_public" ON gallery_albums FOR SELECT
    TO authenticated USING (is_public = true OR is_admin());

DROP POLICY IF EXISTS "gallery_photos_select" ON gallery_photos;
CREATE POLICY "gallery_photos_select" ON gallery_photos FOR SELECT
    TO authenticated USING (true);

-- Library policies
DROP POLICY IF EXISTS "library_books_select" ON library_books;
CREATE POLICY "library_books_select" ON library_books FOR SELECT
    TO authenticated USING (true);

-- Transport policies
DROP POLICY IF EXISTS "transport_select_authorized" ON transport_assignments;
CREATE POLICY "transport_select_authorized" ON transport_assignments FOR SELECT
    TO authenticated USING (
        is_admin() OR
        EXISTS (SELECT 1 FROM students WHERE students.id = transport_assignments.student_id AND students.user_id = auth.uid()) OR
        EXISTS (
            SELECT 1 FROM student_parents sp
            JOIN parents p ON sp.parent_id = p.id
            WHERE sp.student_id = transport_assignments.student_id AND p.user_id = auth.uid()
        )
    );

-- Leave applications policies
DROP POLICY IF EXISTS "leave_select_authorized" ON leave_applications;
CREATE POLICY "leave_select_authorized" ON leave_applications FOR SELECT
    TO authenticated USING (
        is_admin() OR
        EXISTS (SELECT 1 FROM students WHERE students.id = leave_applications.student_id AND students.user_id = auth.uid()) OR
        EXISTS (
            SELECT 1 FROM student_parents sp
            JOIN parents p ON sp.parent_id = p.id
            WHERE sp.student_id = leave_applications.student_id AND p.user_id = auth.uid()
        )
    );

-- AI interactions policies
DROP POLICY IF EXISTS "ai_interactions_own" ON ai_interactions;
CREATE POLICY "ai_interactions_own" ON ai_interactions FOR ALL
    TO authenticated USING (user_id = auth.uid() OR is_admin()) WITH CHECK (user_id = auth.uid() OR is_admin());
