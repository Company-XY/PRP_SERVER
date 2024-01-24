import supertest from "supertest";
import app from "../index.js";
import User from "../models/userModel.js";

const request = supertest(app);

describe("Health Check Endpoint", () => {
  it('should return a 200 status and "API Is Working Well!" message', async () => {
    const healthCheckResponse = await request.get("/api/v1");

    expect(healthCheckResponse.status).toBe(200);
    expect(healthCheckResponse.body).toBe("API Is Working Well!");
  });
});

describe("Authentication Tests", () => {
  // Clean up the database before each test
  beforeEach(async () => {
    jest.setTimeout(20000);
    await User.deleteMany({});
  });

  it("should signup a new non-admin user", async () => {
    const response = await request.post("/api/v1/auth/signup").send({
      username: "testuser",
      email: "test@example.com",
      password: "StrongPassword123!",
      role: "Newsroom",
    });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("username", "testuser");
    expect(response.body).toHaveProperty("email", "test@example.com");
  });

  it("should signup an admin user", async () => {
    const response = await request.post("/api/v1/auth/signup").send({
      username: "adminuser",
      email: "adminuser@example.com",
      password: "StrongPassword123!",
      role: "Newsroom",
    });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("username", "adminuser");
    expect(response.body).toHaveProperty("email", "adminuser@example.com");
  });

  it("should login an existing user", async () => {
    const signupResponse = await request.post("/api/v1/auth/signup").send({
      username: "testuser",
      email: "test@example.com",
      password: "StrongPassword123!",
      role: "Newsmaker",
    });

    expect(signupResponse.status).toBe(201);

    // Login the user
    const loginResponse = await request.post("/api/v1/auth/login").send({
      email: "test@example.com",
      password: "StrongPassword123!",
    });

    expect(loginResponse.status).toBe(200);
    expect(loginResponse.body).toHaveProperty("username", "testuser");
    expect(loginResponse.body).toHaveProperty("email", "test@example.com");
  });

  it("should handle incorrect login credentials", async () => {
    const response = await request.post("/api/v1/auth/login").send({
      email: "nonexistent@example.com",
      password: "InvalidPassword123!",
    });

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty("error", "No user with that email");
  });

  it("should handle duplicate email during signup", async () => {
    // Signup a user with a specific email
    const signupResponse1 = await request.post("/api/v1/auth/signup").send({
      username: "user1",
      email: "duplicate@example.com",
      password: "StrongPassword123!",
      role: "Newsmaker",
    });

    expect(signupResponse1.status).toBe(201);

    // Try to signup another user with the same email
    const signupResponse2 = await request.post("/api/v1/auth/signup").send({
      username: "user2",
      email: "duplicate@example.com",
      password: "AnotherStrongPassword123!",
      role: "Newsmaker",
    });

    expect(signupResponse2.status).toBe(400);
    expect(signupResponse2.body).toHaveProperty(
      "error",
      "Email is already registered"
    );
  });

  it("should handle weak password during signup", async () => {
    const response = await request.post("/api/v1/auth/signup").send({
      username: "testuser",
      email: "test@example.com",
      password: "weak",
      role: "Newsmaker",
    });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty(
      "error",
      "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&)"
    );
  });
});

describe("Assign Role Tests", () => {
  let adminUser;
  let newsroomUser;

  beforeEach(async () => {
    jest.setTimeout(20000);
    await User.deleteMany({});

    // Create an admin user
    adminUser = await request.post("/api/v1/auth/signup").send({
      username: "adminuser",
      email: "admin@example.com",
      password: "StrongPassword123!",
      role: "Admin",
    });

    // Create a newsroom user
    newsroomUser = await request.post("/api/v1/auth/signup").send({
      username: "newsroomuser",
      email: "newsroom@example.com",
      password: "StrongPassword456!",
      role: "Newsroom",
    });
  });

  it("should allow admin to update user role to Support", async () => {
    // Login admin user
    const adminLoginResponse = await request.post("/api/v1/auth/login").send({
      email: "admin@example.com",
      password: "StrongPassword123!",
    });

    expect(adminLoginResponse.status).toBe(200);

    // Assign Support role to newsroom user
    const assignRoleResponse = await request
      .patch(
        `/api/v1/auth/assign/${adminUser.body._id}/${newsroomUser.body._id}`
      )
      .set("Authorization", `Bearer ${adminLoginResponse.body.jwt}`)
      .send({ role: "Support" });

    expect(assignRoleResponse.status).toBe(200);
    expect(assignRoleResponse.body).toHaveProperty("username", "newsroomuser");
    expect(assignRoleResponse.body).toHaveProperty(
      "email",
      "newsroom@example.com"
    );
    expect(assignRoleResponse.body).toHaveProperty("role", "Support");
  });

  it("should handle assigning role by non-admin user", async () => {
    // Login newsroom user
    const newsroomLoginResponse = await request
      .post("/api/v1/auth/login")
      .send({
        email: "newsroom@example.com",
        password: "StrongPassword456!",
      });

    expect(newsroomLoginResponse.status).toBe(200);

    const assignRoleResponse = await request
      .patch(
        `/api/v1/auth/assign/${newsroomLoginResponse.body._id}/${newsroomUser.body._id}`
      )
      .set("Authorization", `Bearer ${newsroomLoginResponse.body.jwt}`)
      .send({ role: "Support" });

    expect(assignRoleResponse.status).toBe(403);
    expect(assignRoleResponse.body).toHaveProperty(
      "error",
      "Permission denied. Only admins can assign roles."
    );
  });
});
