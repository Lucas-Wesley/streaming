import axios from "axios";

beforeAll(async () => {
  axios.defaults.baseURL = "http://localhost:3000";
  axios.defaults.headers.common["Content-Type"] = "application/json";
  axios.defaults.validateStatus = (status) => status >= 200 && status < 500;
});

test("Deve criar uma conta", async () => {
  const input = {
    name: "John Doe",
    email: "john.doe@example.com",
    password: "Abc12345", 
  };
  
  const responseSignup = await axios.post("/signup", input);
  const outputSignup = responseSignup.data;

  axios.defaults.headers.common["Authorization"] = `Bearer ${outputSignup.accessToken}`;
  const responseGetAccount = await axios.get(`/accounts/${outputSignup.account_id}`);
  const outputGetAccount = responseGetAccount.data;

  expect(responseGetAccount.status).toBe(200);
  expect(outputSignup.accessToken).toBeDefined();
  expect(outputGetAccount.account_id).toBe(outputSignup.account_id);
  expect(outputGetAccount.name).toBe(input.name);
  expect(outputGetAccount.email).toBe(input.email);
});

test("Deve logar na plataforma", async () => {

  const input = {
    email: "john.doe@example.com",
    password: "Abc12345",
  };

  const response = await axios.post("/signin", input);
  const output = response.data;

  expect(response.status).toBe(200);
  expect(output.accessToken).toBeDefined();
});

// AFTER ALL
afterAll(async () => {

  console.log("afterAll");
  const input = {
    email: "john.doe@example.com",
    password: "Abc12345",
  };

  const responseSignin = await axios.post("/signin", input);
  const outputSignin = responseSignin.data;

  axios.defaults.headers.common["Authorization"] = `Bearer ${outputSignin.accessToken}`;
  const responseDelete = await axios.delete(`/accounts/${outputSignin.account_id}`); // 
  expect(responseDelete.status).toBe(200);

  const responseGetAccount = await axios.get(`/accounts/${outputSignin.account_id}`);
  const outputGetAccount = responseGetAccount.data;

  expect(responseGetAccount.status).toBe(404);
  expect(outputGetAccount.error).toBe("Account not found");
});