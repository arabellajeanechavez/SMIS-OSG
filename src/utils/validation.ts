// src/utils/validation.ts
// TODO: add new fields
export const validateAddScholarForm = (formData: any) => {
    const errors: Record<string, string> = {};

    if (!formData.name?.trim()) errors.name = 'name is required';
    if (!formData.gender?.trim()) errors.gender = 'Gender is required';
    if (!formData.college?.trim()) errors.college = 'College is required';
    if (!formData.email?.trim()) errors.email = 'Email is required';
    else if (formData.email && !/^\S+@\S+\.\S+$/.test(formData.email)) errors.email = 'Invalid email format';
    if (!formData.program?.trim()) errors.program = 'Program is required';
    if (!formData.year_level) errors.year_level = 'Year level is required';
    if (!formData.scholarship_type) errors.scholarship_type = 'Scholarship type is required';
    if (!formData.student_id?.trim()) errors.student_id = 'Student ID is required';
    if (!formData.benefactor?.trim()) errors.benefactor = 'Benefactor is required';
    if (formData.school === 'Other' && !formData.school?.trim()) errors.school = 'School name is required';
    if (!formData.contract_expiration) errors.contract_expiration = 'Contract expiration date is required';

    return errors;
};