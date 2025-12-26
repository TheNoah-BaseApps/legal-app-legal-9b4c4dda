export function generateCustomerId() {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `CUST-${timestamp}-${random}`;
}

export function generateCaseId() {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `CASE-${timestamp}-${random}`;
}

export function generateEngagementId() {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `ENG-${timestamp}-${random}`;
}

export function generateDocumentId() {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `DOC-${timestamp}-${random}`;
}

export async function ensureUniqueId(generateFn, checkFn) {
  let attempts = 0;
  const maxAttempts = 10;
  
  while (attempts < maxAttempts) {
    const id = generateFn();
    const exists = await checkFn(id);
    
    if (!exists) {
      return id;
    }
    
    attempts++;
  }
  
  throw new Error('Failed to generate unique ID after maximum attempts');
}