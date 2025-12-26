export function validateEmail(email) {
  if (!email || typeof email !== 'string') return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

export function validatePhoneNumber(phone) {
  if (!phone || typeof phone !== 'string') return false;
  const phoneRegex = /^[\d\s\-\+\(\)]{10,}$/;
  return phoneRegex.test(phone.trim());
}

export function validatePassword(password) {
  if (!password || typeof password !== 'string') return false;
  return password.length >= 8;
}

export function validateDate(date) {
  if (!date) return false;
  const parsedDate = new Date(date);
  return parsedDate instanceof Date && !isNaN(parsedDate);
}

export function validateDateNotFuture(date) {
  if (!validateDate(date)) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const checkDate = new Date(date);
  checkDate.setHours(0, 0, 0, 0);
  return checkDate <= today;
}

export function validateDateRange(startDate, endDate) {
  if (!validateDate(startDate) || !validateDate(endDate)) return false;
  return new Date(startDate) <= new Date(endDate);
}

export function validateCustomerStatus(status) {
  const validStatuses = ['Active', 'Inactive', 'Pending', 'Archived'];
  return validStatuses.includes(status);
}

export function validateCaseStatus(status) {
  const validStatuses = ['New', 'Open', 'In Progress', 'Pending', 'Closed', 'Dismissed'];
  return validStatuses.includes(status);
}

export function validateEngagementType(type) {
  const validTypes = ['Meeting', 'Call', 'Email', 'Video Conference', 'Document Review'];
  return validTypes.includes(type);
}

export function validateEngagementChannel(channel) {
  const validChannels = ['Phone', 'Email', 'In-Person', 'Video', 'Portal'];
  return validChannels.includes(channel);
}

export function validateRole(role) {
  const validRoles = ['Admin', 'Attorney', 'Paralegal', 'Client'];
  return validRoles.includes(role);
}

export function validateRequired(value) {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  return true;
}

export function validateCustomerData(data) {
  const errors = {};

  if (!validateRequired(data.customer_name)) {
    errors.customer_name = 'Customer name is required';
  }

  if (!validateRequired(data.contact_person)) {
    errors.contact_person = 'Contact person is required';
  }

  if (!validateEmail(data.email_address)) {
    errors.email_address = 'Valid email is required';
  }

  if (!validatePhoneNumber(data.contact_number)) {
    errors.contact_number = 'Valid phone number is required';
  }

  if (!validateCustomerStatus(data.customer_status)) {
    errors.customer_status = 'Valid customer status is required';
  }

  if (data.registration_date && !validateDateNotFuture(data.registration_date)) {
    errors.registration_date = 'Registration date cannot be in the future';
  }

  return { isValid: Object.keys(errors).length === 0, errors };
}

export function validateCaseData(data) {
  const errors = {};

  if (!validateRequired(data.case_title)) {
    errors.case_title = 'Case title is required';
  }

  if (!validateRequired(data.client_id)) {
    errors.client_id = 'Client is required';
  }

  if (!validateRequired(data.case_type)) {
    errors.case_type = 'Case type is required';
  }

  if (!validateCaseStatus(data.case_status)) {
    errors.case_status = 'Valid case status is required';
  }

  if (data.filing_date && data.hearing_date) {
    if (!validateDateRange(data.filing_date, data.hearing_date)) {
      errors.hearing_date = 'Hearing date must be after filing date';
    }
  }

  return { isValid: Object.keys(errors).length === 0, errors };
}

export function validateEngagementData(data) {
  const errors = {};

  if (!validateRequired(data.client_id)) {
    errors.client_id = 'Client is required';
  }

  if (!validateEngagementType(data.engagement_type)) {
    errors.engagement_type = 'Valid engagement type is required';
  }

  if (!validateEngagementChannel(data.engagement_channel)) {
    errors.engagement_channel = 'Valid engagement channel is required';
  }

  if (!validateDate(data.engagement_date)) {
    errors.engagement_date = 'Valid engagement date is required';
  }

  return { isValid: Object.keys(errors).length === 0, errors };
}