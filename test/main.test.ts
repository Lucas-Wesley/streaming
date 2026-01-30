import axios from "axios";

test("Deve criar uma conta", async () => {
  const input = {
    name: "John Doe",
    email: "john.doe@example.com",
    document: "1234567890",
    password: "Abc12345", 
  };
  
  const responseSignup = await axios.post("http://localhost:3000/signup", input);
  const outputSignup = responseSignup.data;

  const responseGetAccount = await axios.get(`http://localhost:3000/accounts/${outputSignup.account_id}`);
  const outputGetAccount = responseGetAccount.data;

  expect(responseGetAccount.status).toBe(200);
  expect(outputGetAccount.account_id).toBe(outputSignup.account_id);
  expect(outputGetAccount.name).toBe(input.name);
  expect(outputGetAccount.email).toBe(input.email);
  expect(outputGetAccount.document).toBe(input.document);
});