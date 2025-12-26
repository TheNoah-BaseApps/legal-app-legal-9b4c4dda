export function hasRole(user, roles) {
  if (!user || !user.role) return false;
  if (typeof roles === 'string') return user.role === roles;
  return roles.includes(user.role);
}

export function isAdmin(user) {
  return hasRole(user, 'Admin');
}

export function isAttorney(user) {
  return hasRole(user, 'Attorney');
}

export function isParalegal(user) {
  return hasRole(user, 'Paralegal');
}

export function isClient(user) {
  return hasRole(user, 'Client');
}

export function canManageCases(user) {
  return hasRole(user, ['Admin', 'Attorney']);
}

export function canManageCustomers(user) {
  return hasRole(user, ['Admin', 'Attorney', 'Paralegal']);
}

export function canViewReports(user) {
  return hasRole(user, ['Admin', 'Attorney']);
}

export function canManageUsers(user) {
  return isAdmin(user);
}

export function canAccessCustomer(user, customerId) {
  if (isAdmin(user) || isAttorney(user) || isParalegal(user)) {
    return true;
  }
  
  if (isClient(user) && user.customerId === customerId) {
    return true;
  }
  
  return false;
}

export function canAccessCase(user, caseData) {
  if (isAdmin(user)) return true;
  
  if (isAttorney(user) && caseData.assigned_attorney === user.userId) {
    return true;
  }
  
  if (isClient(user) && caseData.client_id === user.customerId) {
    return true;
  }
  
  return false;
}

export function filterDataByRole(user, data, type) {
  if (isAdmin(user) || isAttorney(user) || isParalegal(user)) {
    return data;
  }
  
  if (isClient(user)) {
    if (type === 'customers') {
      return data.filter(item => item.id === user.customerId);
    }
    if (type === 'cases') {
      return data.filter(item => item.client_id === user.customerId);
    }
    if (type === 'engagements') {
      return data.filter(item => item.client_id === user.customerId);
    }
  }
  
  return [];
}