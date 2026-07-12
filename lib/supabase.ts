import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * Storage adapter that persists sessions based on the "remember me" choice.
 *
 * - Remember me ON  -> localStorage (survives browser restart).
 * - Remember me OFF -> sessionStorage (cleared when the tab/window closes).
 *
 * The active mode is toggled at runtime via `setRememberMe()` from the auth
 * context before `signInWithPassword` is called, so Supabase picks up the
 * correct storage for the resulting session.
 */
const REMEMBER_KEY = 'pace:rememberMe';

type SessionStorageLike = Pick<globalThis.Storage, 'getItem' | 'setItem' | 'removeItem'>;

function readRememberMe(): boolean {
  if (typeof window === 'undefined') return true;
  try {
    return window.localStorage.getItem(REMEMBER_KEY) !== 'false';
  } catch {
    return true;
  }
}

function activeStorage(): SessionStorageLike {
  if (typeof window === 'undefined') {
    const noop = () => null;
    return { getItem: noop, setItem: noop, removeItem: noop } as SessionStorageLike;
  }
  return readRememberMe() ? window.localStorage : window.sessionStorage;
}

export const rememberMeStorage = {
  getItem: (key: string) => activeStorage().getItem(key),
  setItem: (key: string, value: string) => activeStorage().setItem(key, value),
  removeItem: (key: string) => activeStorage().removeItem(key),
};

export function setRememberMe(enabled: boolean) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(REMEMBER_KEY, String(enabled));
  } catch {
    // ignore storage access errors (private mode, etc.)
  }
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    storage: rememberMeStorage,
    storageKey: 'pace-auth-session',
  },
});

export type UserRole =
  | 'super_admin'
  | 'admin'
  | 'principal'
  | 'teacher'
  | 'student'
  | 'parent'
  | 'accountant'
  | 'receptionist';

export interface Profile {
  id: string;
  role: UserRole;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  avatar_url?: string;
  date_of_birth?: string;
  gender?: string;
  is_active: boolean;
  must_change_password: boolean;
  created_at: string;
  updated_at: string;
  branch_id?: string;
  department?: string;
  last_login?: string;
}

export interface Branch {
  id: string;
  name: string;
  code?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  phone?: string;
  email?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Role {
  id: string;
  name: string;
  display_name: string;
  description?: string;
  is_system: boolean;
  created_at: string;
  updated_at: string;
}

export interface Permission {
  id: string;
  name: string;
  display_name: string;
  module: string;
  action: string;
  description?: string;
  created_at: string;
}

export interface RolePermission {
  id: string;
  role_id: string;
  permission_id: string;
  created_at: string;
}

export interface UserRoleMapping {
  id: string;
  user_id: string;
  role_id: string;
  created_at: string;
}

export interface Student {
  id: string;
  user_id: string;
  admission_number: string;
  roll_number?: string;
  class_id?: string;
  house_id?: string;
  blood_group?: string;
  nationality?: string;
  religion?: string;
  caste?: string;
  mother_tongue?: string;
  admission_date?: string;
  previous_school?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Teacher {
  id: string;
  user_id: string;
  employee_id: string;
  qualification?: string;
  specialization?: string;
  experience_years: number;
  join_date?: string;
  salary_grade?: string;
  is_hod: boolean;
  is_class_teacher: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Parent {
  id: string;
  user_id: string;
  occupation?: string;
  qualification?: string;
  annual_income?: string;
  is_active: boolean;
  created_at: string;
}

export interface Class {
  id: string;
  name: string;
  grade_level: number;
  section?: string;
  academic_year_id?: string;
  class_teacher_id?: string;
  room_number?: string;
  capacity: number;
  is_active: boolean;
  created_at: string;
}

export interface Subject {
  id: string;
  name: string;
  code?: string;
  description?: string;
  is_active: boolean;
  created_at: string;
}

export interface Exam {
  id: string;
  name: string;
  exam_type: string;
  class_id?: string;
  subject_id?: string;
  academic_year_id?: string;
  total_marks: number;
  passing_marks: number;
  exam_date?: string;
  start_time?: string;
  end_time?: string;
  syllabus_covered?: string;
  is_published: boolean;
  created_at: string;
}

export interface Mark {
  id: string;
  student_id: string;
  exam_id: string;
  marks_obtained?: number;
  grade?: string;
  remarks?: string;
  rank_in_class?: number;
  percentile?: number;
  is_absent: boolean;
  entered_by?: string;
  created_at: string;
  updated_at: string;
}

export interface Attendance {
  id: string;
  student_id: string;
  class_id?: string;
  date: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  remarks?: string;
  marked_by?: string;
  marked_at: string;
  created_at: string;
}

export interface Homework {
  id: string;
  class_id?: string;
  subject_id?: string;
  teacher_id?: string;
  title: string;
  description?: string;
  due_date: string;
  max_marks: number;
  attachments?: string[];
  is_active: boolean;
  created_at: string;
}

export interface HomeworkSubmission {
  id: string;
  homework_id: string;
  student_id: string;
  submitted_at: string;
  content?: string;
  attachments?: string[];
  marks_obtained?: number;
  teacher_feedback?: string;
  status: string;
  created_at: string;
}

export interface StudyMaterial {
  id: string;
  class_id?: string;
  subject_id?: string;
  teacher_id?: string;
  title: string;
  description?: string;
  material_type: string;
  file_url?: string;
  video_url?: string;
  is_public: boolean;
  created_at: string;
}

export interface StudentFee {
  id: string;
  student_id: string;
  fee_type_id?: string;
  amount: number;
  due_date?: string;
  status: 'pending' | 'paid' | 'overdue' | 'waived';
  waiver_amount: number;
  academic_year_id?: string;
  created_at: string;
}

export interface FeePayment {
  id: string;
  student_fee_id: string;
  amount: number;
  payment_method?: string;
  transaction_id?: string;
  payment_date: string;
  receipt_number?: string;
  collected_by?: string;
  notes?: string;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  notification_type?: string;
  reference_id?: string;
  reference_type?: string;
  is_read: boolean;
  created_at: string;
}

export interface Event {
  id: string;
  title: string;
  description?: string;
  event_type?: string;
  start_date: string;
  end_date?: string;
  start_time?: string;
  end_time?: string;
  venue?: string;
  is_holiday: boolean;
  is_active: boolean;
  created_by?: string;
  created_at: string;
}

export interface Notice {
  id: string;
  title: string;
  content: string;
  notice_type: string;
  priority: string;
  target_audience?: string[];
  publish_date: string;
  expiry_date?: string;
  is_pinned: boolean;
  is_active: boolean;
  created_by?: string;
  created_at: string;
}

export interface LeaveApplication {
  id: string;
  student_id: string;
  start_date: string;
  end_date: string;
  leave_type: string;
  reason: string;
  status: string;
  approved_by?: string;
  approved_at?: string;
  remarks?: string;
  created_at: string;
}

export interface TransportRoute {
  id: string;
  route_number: string;
  route_name: string;
  start_point?: string;
  end_point?: string;
  distance_km?: number;
  vehicle_number?: string;
  driver_name?: string;
  driver_phone?: string;
  conductor_name?: string;
  conductor_phone?: string;
  capacity: number;
  fee_amount?: number;
  is_active: boolean;
  created_at: string;
}

export interface LibraryBook {
  id: string;
  isbn?: string;
  title: string;
  author: string;
  publisher?: string;
  publication_year?: number;
  category?: string;
  total_copies: number;
  available_copies: number;
  location?: string;
  price?: number;
  is_active: boolean;
  created_at: string;
}

export interface BookIssue {
  id: string;
  book_id: string;
  user_id: string;
  user_type: string;
  issue_date: string;
  due_date: string;
  return_date?: string;
  fine_amount: number;
  fine_paid: boolean;
  status: string;
  issued_by?: string;
  created_at: string;
}

export interface TimetableEntry {
  id: string;
  class_id?: string;
  subject_id?: string;
  teacher_id?: string;
  day_of_week: string;
  period_number: number;
  start_time: string;
  end_time: string;
  room_number?: string;
  is_active: boolean;
  created_at: string;
}

export interface House {
  id: string;
  name: string;
  color?: string;
  description?: string;
  created_at: string;
}

export interface StudentParent {
  id: string;
  student_id: string;
  parent_id: string;
  relationship: string;
  is_primary: boolean;
  emergency_contact: boolean;
  created_at: string;
}

export interface TeacherAssignment {
  id: string;
  teacher_id: string;
  class_id?: string;
  subject_id?: string;
  academic_year_id?: string;
  is_active: boolean;
  created_at: string;
}

export interface Syllabus {
  id: string;
  class_id?: string;
  subject_id?: string;
  chapter_number?: number;
  chapter_name: string;
  description?: string;
  topics?: string[];
  academic_year_id?: string;
  file_url?: string;
  created_at: string;
}

export interface GalleryAlbum {
  id: string;
  title: string;
  description?: string;
  event_id?: string;
  cover_image_url?: string;
  is_public: boolean;
  created_by?: string;
  created_at: string;
}

export interface GalleryPhoto {
  id: string;
  album_id: string;
  photo_url: string;
  caption?: string;
  photo_order: number;
  created_at: string;
}

export interface AcademicYear {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  is_current: boolean;
  created_at: string;
}
