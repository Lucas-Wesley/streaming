export function validateEmail (email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function validatePassword (password: string) {
  if (password.length < 8) return false;
  if (!password.match(/[a-z]/)) return false;
  if (!password.match(/[A-Z]/)) return false;
  if (!password.match(/[0-9]/)) return false;
  return true;
}

export function validateName (name: string) {
  return /[a-zA-Z]+ [a-zA-Z]+/.test(name);
}