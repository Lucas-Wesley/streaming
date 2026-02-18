import axios from "axios";

beforeAll(async () => {
  axios.defaults.baseURL = "http://localhost:4444";
  axios.defaults.headers.common["Content-Type"] = "application/json";
  axios.defaults.validateStatus = (status) => status >= 200 && status < 500;
});

test("Deve listar os channels", async () => {
  const response = await axios.get("/api/channels/following");
  const output = response.data;

  expect(response.status).toBe(200);
  expect(output.channels).toBeDefined();
  expect(output.channels.length).toBe(0);
});

test("Deve listar os channels ao vivo", async () => {
  const response = await axios.get("/api/channels/live");
  const output = response.data;

  expect(response.status).toBe(200);
  expect(output.channels).toBeDefined();
  expect(output.channels.length).toBe(0);
});