import { validateName, validateEmail, validatePassword } from "../src/validates/validateAccount";

test("Validar nome", () => {
  expect(validateName("John Doe")).toBe(true);
  expect(validateName("John")).toBe(false);
});

test("Validar email", () => {
  expect(validateEmail("john.doe@example.com")).toBe(true);
  expect(validateEmail("john.doe@example")).toBe(false);
});

test("Validar senha", () => {
  expect(validatePassword("Abc12345")).toBe(true);
  expect(validatePassword("Abc1234")).toBe(false);
});