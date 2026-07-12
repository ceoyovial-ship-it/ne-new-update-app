export interface StudentWithDetails {
  id: string;
  user_id: string | null;
  admission_number: string;
  roll_number: string | null;
  class_id: string | null;
  house_id: string | null;
  blood_group: string | null;
  nationality: string | null;
  religion: string | null;
  caste: string | null;
  mother_tongue: string | null;
  admission_date: string | null;
  previous_school: string | null;
  is_active: boolean | null;
  created_at: string;
  updated_at: string;
  aadhaar_number: string | null;
  gender: string | null;
  academic_year_id: string | null;
  section: string | null;
  archived: boolean | null;
  archived_at: string | null;
  archived_reason: string | null;
  communication_address: string | null;
  profile: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string | null;
    avatar_url: string | null;
    date_of_birth: string | null;
    gender: string | null;
    address: string | null;
    city: string | null;
    state: string | null;
    pincode: string | null;
  } | null;
  class: {
    id: string;
    name: string;
    section: string | null;
    grade_level: number;
  } | null;
  house: {
    id: string;
    name: string;
    color: string;
  } | null;
  academic_year: {
    id: string;
    name: string;
  } | null;
  parents: Array<{
    id: string;
    relationship: string;
    is_primary: boolean;
    parent: {
      id: string;
      user_id: string | null;
      occupation: string | null;
      profile: {
        id: string;
        first_name: string;
        last_name: string;
        email: string;
        phone: string | null;
      } | null;
    };
  }>;
  medical: {
    id: string;
    allergies: string | null;
    medical_conditions: string | null;
    medications: string | null;
    blood_group: string | null;
    emergency_contact_name: string | null;
    emergency_contact_phone: string | null;
    emergency_contact_relation: string | null;
    last_checkup: string | null;
    notes: string | null;
  } | null;
  documents: Array<{
    id: string;
    document_type: string;
    file_name: string | null;
    file_url: string | null;
    uploaded_at: string;
  }>;
}

export interface StudentFormData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  gender: string;
  date_of_birth: string;
  blood_group: string;
  aadhaar_number: string;
  avatar_url: string;
  admission_number: string;
  admission_date: string;
  academic_year_id: string;
  class_id: string;
  section: string;
  roll_number: string;
  house_id: string;
  father_name: string;
  mother_name: string;
  guardian_name: string;
  parent_phone: string;
  parent_email: string;
  parent_occupation: string;
  permanent_address: string;
  communication_address: string;
  allergies: string;
  medical_conditions: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  is_active: boolean;
}

export const emptyStudentForm: StudentFormData = {
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
  gender: '',
  date_of_birth: '',
  blood_group: '',
  aadhaar_number: '',
  avatar_url: '',
  admission_number: '',
  admission_date: new Date().toISOString().split('T')[0],
  academic_year_id: '',
  class_id: '',
  section: '',
  roll_number: '',
  house_id: '',
  father_name: '',
  mother_name: '',
  guardian_name: '',
  parent_phone: '',
  parent_email: '',
  parent_occupation: '',
  permanent_address: '',
  communication_address: '',
  allergies: '',
  medical_conditions: '',
  emergency_contact_name: '',
  emergency_contact_phone: '',
  is_active: true,
};

export const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
export const GENDERS = ['Male', 'Female', 'Other'];

export function generateAdmissionNumber(): string {
  const year = new Date().getFullYear();
  const random = Math.floor(1000 + Math.random() * 9000);
  return `ADM${year}${random}`;
}
