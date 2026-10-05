const test = require("node:test");
const assert = require("node:assert");

const BASE_URL = process.env.TEST_API_URL || "http://localhost:5000/api";

const request = async (endpoint, options = {}) => {
  const url = `${BASE_URL}${endpoint}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });
  let data = null;
  try {
    data = await res.json();
  } catch (err) {
    data = null;
  }
  return { status: res.status, ok: res.ok, data };
};

let demoToken = "";
let demoUser = null;
let aliceToken = "";
let aliceUser = null;
let testProjectId = null;
let testTaskId = null;
let aliceNotificationId = null;

test("1. Health Check", async () => {
  const res = await request("/health");
  assert.strictEqual(res.status, 200, "Health check should return 200");
  assert.strictEqual(res.data.status, "OK", "Status should be OK");
});

test("2.1 Rejects invalid login credentials", async () => {
  const res = await request("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email: "admin@taskflow.io", password: "WrongPassword!" }),
  });
  assert.strictEqual(res.status, 401, "Invalid password should return 401");
  assert.strictEqual(res.data.success, false);
});

test("2.2 Authenticates admin user (creator)", async () => {
  const res = await request("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email: "admin@taskflow.io", password: "admin123" }),
  });
  assert.strictEqual(res.status, 200, "Admin login should return 200");
  assert.ok(res.data.token, "Should return JWT token");
  demoToken = res.data.token;
  demoUser = res.data.user;
  assert.strictEqual(demoUser.email, "admin@taskflow.io");
});

test("2.3 Authenticates Alice (collaborator)", async () => {
  const res = await request("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email: "alice@taskflow.io", password: "membre123" }),
  });
  assert.strictEqual(res.status, 200, "Alice login should return 200");
  assert.ok(res.data.token, "Should return JWT token");
  aliceToken = res.data.token;
  aliceUser = res.data.user;
  assert.strictEqual(aliceUser.email, "alice@taskflow.io");
});

test("2.4 Verifies current user identity via /auth/me", async () => {
  const res = await request("/auth/me", {
    headers: { Authorization: `Bearer ${demoToken}` },
  });
  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.data.user.id, demoUser.id);
});

test("3.1 Creates a new project", async () => {
  const res = await request("/projects", {
    method: "POST",
    headers: { Authorization: `Bearer ${demoToken}` },
    body: JSON.stringify({
      titre: "Projet Test MVP",
      description: "Projet automatisé pour tests d'intégration",
      couleur: "#0284c7",
      visibilite: "prive",
    }),
  });
  assert.strictEqual(res.status, 201, "Project creation should return 201");
  assert.ok(res.data.data.id, "Project should have an ID");
  testProjectId = res.data.data.id;
});

test("3.2 Adds Alice as collaborator to the project", async () => {
  const res = await request(`/projects/${testProjectId}/members`, {
    method: "POST",
    headers: { Authorization: `Bearer ${demoToken}` },
    body: JSON.stringify({
      user_id: aliceUser.id,
      role: "editor",
    }),
  });
  assert.strictEqual(res.status, 200, "Adding member should return 200");
});

test("4.1 Self-assignment guard: Creator cannot assign task to self", async () => {
  const res = await request(`/projects/${testProjectId}/tasks`, {
    method: "POST",
    headers: { Authorization: `Bearer ${demoToken}` },
    body: JSON.stringify({
      titre: "Tâche auto-assignée illégale",
      assigne_a: demoUser.id, // Self assignment attempt
    }),
  });
  assert.strictEqual(res.status, 400, "Self assignment should be forbidden with 400");
  assert.match(
    res.data.message,
    /pas à vous-même|collaborateur ajouté/i,
    "Error message should mention self-assignment restriction"
  );
});

test("4.2 Creates task with Cover, Checklist, Attachments & Assigns to Alice", async () => {
  const res = await request(`/projects/${testProjectId}/tasks`, {
    method: "POST",
    headers: { Authorization: `Bearer ${demoToken}` },
    body: JSON.stringify({
      titre: "Implémentation Module MVP",
      description: "Spécification et tests complets",
      priorite: "haute",
      statut: "todo",
      assigne_a: aliceUser.id,
      couverture: "#3b82f6",
      checklists: [
        { id: "item-1", text: "Rédiger spécification", done: false },
        { id: "item-2", text: "Exécuter tests unitaires", done: false },
      ],
      pieces_jointes: [
        { id: "att-1", name: "Figma Mockup", url: "https://figma.com/file/sample" },
      ],
    }),
  });
  assert.strictEqual(
    res.status,
    201,
    `Task creation should return 201: ${res.data?.message || JSON.stringify(res.data)}`
  );
  testTaskId = res.data.data.id;
  assert.strictEqual(res.data.data.couverture, "#3b82f6");
  assert.strictEqual(res.data.data.checklists.length, 2);
  assert.strictEqual(res.data.data.pieces_jointes.length, 1);
  assert.strictEqual(res.data.data.assigne_a, aliceUser.id);
});

test("4.3 Updates checklist item to done (interactive subtask)", async () => {
  const updatedChecklists = [
    { id: "item-1", text: "Rédiger spécification", done: true },
    { id: "item-2", text: "Exécuter tests unitaires", done: false },
  ];
  const res = await request(`/projects/${testProjectId}/tasks/${testTaskId}`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${demoToken}` },
    body: JSON.stringify({
      checklists: updatedChecklists,
    }),
  });
  assert.strictEqual(res.status, 200, "Updating task should return 200");
  assert.strictEqual(res.data.data.checklists[0].done, true);
  assert.strictEqual(res.data.data.checklists[1].done, false);
});

test("4.3b Board automation rule_auto_done marks all checklists as done when task moved to done", async () => {
  // 1. Enable rule_auto_done on project
  await request(`/projects/${testProjectId}`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${demoToken}` },
    body: JSON.stringify({ automations: ["rule_auto_done"] }),
  });

  // 2. Move task to done
  const res = await request(`/projects/${testProjectId}/tasks/${testTaskId}/status`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${demoToken}` },
    body: JSON.stringify({ statut: "done" }),
  });
  assert.strictEqual(res.status, 200, "Update status should return 200");
  assert.strictEqual(res.data.data.statut, "done");
  assert.strictEqual(
    res.data.data.checklists.every((c) => c.termine && c.done),
    true,
    "All checklists must be auto-completed when task status becomes done"
  );
});

test("4.4 Adds comment on task and dispatches notification", async () => {
  const res = await request(`/projects/${testProjectId}/tasks/${testTaskId}/comments`, {
    method: "POST",
    headers: { Authorization: `Bearer ${demoToken}` },
    body: JSON.stringify({
      contenu: "Super travail Alice, vérifie la checklist s'il te plaît !",
    }),
  });
  assert.strictEqual(res.status, 201, "Adding comment should return 201");
  assert.ok(res.data.data.id, "Comment should be created");
});

test("5.1 Alice fetches notifications and finds assignment notification", async () => {
  const res = await request("/notifications", {
    headers: { Authorization: `Bearer ${aliceToken}` },
  });
  assert.strictEqual(res.status, 200, "Fetching notifications should return 200");
  assert.ok(Array.isArray(res.data.data), "Should return array of notifications");
  assert.ok(res.data.unreadCount > 0, "Unread count should be > 0");

  const assignNotif = res.data.data.find(
    (n) => n.tache_id === testTaskId && n.type === "task_assigned"
  );
  assert.ok(assignNotif, "Alice should have received task_assigned notification");
  aliceNotificationId = assignNotif.id;
});

test("5.2 Alice marks notification as read", async () => {
  const res = await request(`/notifications/${aliceNotificationId}/read`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${aliceToken}` },
  });
  assert.strictEqual(res.status, 200, "Marking notification read should return 200");
  assert.strictEqual(res.data.data.lu, true);
});

test("5.3 Alice marks all notifications as read", async () => {
  const res = await request("/notifications/read-all", {
    method: "PUT",
    headers: { Authorization: `Bearer ${aliceToken}` },
  });
  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.data.success, true);
});

test("6.1 Deletes test task", async () => {
  const res = await request(`/projects/${testProjectId}/tasks/${testTaskId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${demoToken}` },
  });
  assert.strictEqual(res.status, 200, "Task deletion should return 200");
});

test("6.2 Deletes test project", async () => {
  const res = await request(`/projects/${testProjectId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${demoToken}` },
  });
  assert.strictEqual(res.status, 200, "Project deletion should return 200");
});
