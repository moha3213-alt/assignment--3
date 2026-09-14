import express from "express";
import fs from "fs";

const app = express();
app.use(express.json());

const FILE_PATH = "./users.json";

const readUsers = () => {
  if (!fs.existsSync(FILE_PATH)) fs.writeFileSync(FILE_PATH, "[]");
  const data = fs.readFileSync(FILE_PATH, "utf-8");
  return JSON.parse(data || "[]");
};

const writeUsers = (users) => {
  fs.writeFileSync(FILE_PATH, JSON.stringify(users, null, 2));
};

app.post("/user", (req, res) => {
  const { name, age, email } = req.body;
  const users = readUsers();

  const emailExists = users.some((u) => u.email === email);
  if (emailExists) {
    return res.status(400).json({ message: "Email already exists." });
  }

  const newUser = { id: Date.now(), name, age, email };
  users.push(newUser);
  writeUsers(users);

  res.status(201).json({ message: "User added successfully." });
});

app.get("/user/getByName", (req, res) => {
  const { name } = req.query;
  const users = readUsers();

  const user = users.find((u) => u.name.toLowerCase() === name?.toLowerCase());
  if (!user) {
    return res.status(404).json({ message: "User name not found." });
  }

  res.json(user);
});

app.get("/user/filter", (req, res) => {
  const { minAge } = req.query;
  const users = readUsers();

  const filtered = users.filter((u) => u.age >= Number(minAge));
  if (filtered.length === 0) {
    return res.status(404).json({ message: "no user found" });
  }

  res.json(filtered);
});

app.get("/user", (req, res) => {
  const users = readUsers();
  res.json(users);
});

app.get("/user/:id", (req, res) => {
  const { id } = req.params;
  const users = readUsers();

  const user = users.find((u) => u.id == id);
  if (!user) {
    return res.status(404).json({ message: "User not found." });
  }

  res.json(user);
});

app.patch("/user/:id", (req, res) => {
  const { id } = req.params;
  const { name, age, email } = req.body;
  const users = readUsers();

  const userIndex = users.findIndex((u) => u.id == id);
  if (userIndex === -1) {
    return res.status(404).json({ message: "User ID not found." });
  }

  if (name) users[userIndex].name = name;
  if (age) users[userIndex].age = age;
  if (email) users[userIndex].email = email;

  writeUsers(users);
  res.json({ message: "User age updated successfully." });
});

// app.delete('/user/:id?', (req, res) => {
//   const id = req.params.id || req.body.id;
//   let users = readUsers();

//   const userExists = users.some(u => u.id == id);
//   if (!userExists) {
//     return res.status(404).json({ message: "User ID not found." });
//   }
app.delete(["/user", "/user/:id"], (req, res) => {
  const id = req.params.id || req.body.id;
  let users = readUsers();

  const userExists = users.some((u) => u.id == id);
  if (!userExists) {
    return res.status(404).json({ message: "User ID not found." });
  }

  users = users.filter((u) => u.id != id);
  writeUsers(users);

  res.json({ message: "User deleted successfully." });
});

app.listen(3000, () => console.log("Server running on port 3000"));
