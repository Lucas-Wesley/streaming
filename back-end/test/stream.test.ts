import axios from "axios";

beforeAll(async () => {
  axios.defaults.baseURL = "http://localhost:4444";
  axios.defaults.headers.common["Content-Type"] = "application/json";
  axios.defaults.validateStatus = (status) => status >= 200 && status < 500;
});

test("Deve criar uma stream", async () => {
  const signupRes = await axios.post("/signup", {
    name: "Stream Test",
    email: "stream.test@example.com",
    password: "Abc12345",
  });
  const account = signupRes.data;
  expect(signupRes.status).toBe(201);

  const input = {
    account_id: account.account_id,
    title: "Teste de stream",
    stream_key: account.stream_key,
  };

  const response = await axios.post("/stream", input, {
    headers: { Authorization: `Bearer ${account.accessToken}` },
  });
  const output = response.data;

  console.log(output);

  expect(response.status).toBe(201);
  // expect(output.title).toBe(input.title);
});