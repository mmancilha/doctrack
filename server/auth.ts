import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import session from "express-session";
import { storage } from "./storage";
import bcrypt from "bcryptjs";
import type { Express, RequestHandler } from "express";
import type { User } from "@shared/schema";
import connectPgSimple from "connect-pg-simple";
import { pool } from "./db";

declare global {
  namespace Express {
    interface User {
      id: string;
      username: string;
      role: string;
      displayName: string | null;
      avatarUrl: string | null;
    }
  }
}

export function setupAuth(app: Express) {
  const PgSession = connectPgSimple(session);

  const sessionSettings: session.SessionOptions = {
    store: new PgSession({
      pool,
      tableName: "user_sessions",
      createTableIfMissing: true,
    }),
    secret: process.env.SESSION_SECRET || "doctrack-secret-key-change-in-production",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
    },
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user) {
          return done(null, false, { message: "Invalid username or password" });
        }

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
          return done(null, false, { message: "Invalid username or password" });
        }

        return done(null, {
          id: user.id,
          username: user.username,
          role: user.role,
          displayName: user.displayName,
          avatarUrl: user.avatarUrl,
        });
      } catch (error) {
        return done(error);
      }
    })
  );

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await storage.getUser(id);
      if (!user) {
        return done(null, false);
      }
      done(null, {
        id: user.id,
        username: user.username,
        role: user.role,
        displayName: user.displayName,
        avatarUrl: user.avatarUrl,
      });
    } catch (error) {
      done(error);
    }
  });

  app.post("/api/auth/login", (req, res, next) => {
    passport.authenticate("local", (err: any, user: Express.User | false, info: any) => {
      if (err) {
        return res.status(500).json({ error: "Authentication failed" });
      }
      if (!user) {
        return res.status(401).json({ error: info?.message || "Invalid credentials" });
      }
      req.logIn(user, (loginErr) => {
        if (loginErr) {
          return res.status(500).json({ error: "Login failed" });
        }
        return res.json({
          id: user.id,
          username: user.username,
          role: user.role,
          displayName: user.displayName,
          avatarUrl: user.avatarUrl,
        });
      });
    })(req, res, next);
  });

  app.post("/api/auth/logout", (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ error: "Logout failed" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/auth/me", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    res.json(req.user);
  });

  // Atualizar perfil do usuário logado
  app.patch("/api/auth/profile", requireAuth, async (req, res) => {
    try {
      const { displayName, avatarUrl } = req.body;
      const userId = req.user!.id;

      const updates: { displayName?: string; avatarUrl?: string | null } = {};
      
      if (displayName !== undefined) {
        if (typeof displayName === "string" && displayName.trim().length > 0 && displayName.length <= 100) {
          updates.displayName = displayName.trim();
        } else if (displayName === "" || displayName === null) {
          updates.displayName = undefined;
        }
      }
      
      if (avatarUrl !== undefined) {
        if (avatarUrl === null || avatarUrl === "") {
          updates.avatarUrl = null;
        } else if (typeof avatarUrl === "string") {
          // Aceita URLs base64 (data:image/...) ou URLs normais
          if (avatarUrl.startsWith("data:image/")) {
            // Validar tamanho máximo (~2MB em base64)
            if (avatarUrl.length > 3 * 1024 * 1024) {
              return res.status(400).json({ error: "Image too large (max 2MB)" });
            }
            updates.avatarUrl = avatarUrl;
          } else {
            // Validação de URL normal
            try {
              new URL(avatarUrl);
              updates.avatarUrl = avatarUrl;
            } catch {
              return res.status(400).json({ error: "Invalid avatar URL" });
            }
          }
        }
      }

      if (Object.keys(updates).length === 0) {
        return res.status(400).json({ error: "No valid updates provided" });
      }

      const user = await storage.updateUser(userId, updates);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Atualizar a sessão com os novos dados (aguardar conclusão)
      const updatedUserData = {
        id: user.id,
        username: user.username,
        role: user.role,
        displayName: user.displayName,
        avatarUrl: user.avatarUrl,
      };

      req.login(updatedUserData, (err) => {
        if (err) {
          console.error("Error updating session:", err);
          return res.status(500).json({ error: "Failed to update session" });
        }
        
        // Só envia a resposta após o login ser atualizado
        res.json(updatedUserData);
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ error: "Failed to update profile" });
    }
  });

  app.get("/api/users", requireAuth, requireRole(["admin"]), async (req, res) => {
    try {
      const users = await storage.getUsers();
      res.json(users.map(u => ({
        id: u.id,
        username: u.username,
        role: u.role,
        displayName: u.displayName,
        avatarUrl: u.avatarUrl,
      })));
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });

  app.post("/api/users", requireAuth, requireRole(["admin"]), async (req, res) => {
    try {
      const { username, password, role } = req.body;
      if (!username || !password) {
        return res.status(400).json({ error: "Username and password required" });
      }

      const existing = await storage.getUserByUsername(username);
      if (existing) {
        return res.status(400).json({ error: "Username already exists" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await storage.createUser({
        username,
        password: hashedPassword,
        role: role || "reader",
      });

      res.status(201).json({
        id: user.id,
        username: user.username,
        role: user.role,
        displayName: user.displayName,
        avatarUrl: user.avatarUrl,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to create user" });
    }
  });

  app.patch("/api/users/:id", requireAuth, requireRole(["admin"]), async (req, res) => {
    try {
      const { id } = req.params;
      const { role, password } = req.body;

      const updates: any = {};
      if (role && ["reader", "editor", "admin"].includes(role)) {
        updates.role = role;
      }
      if (password) {
        updates.password = await bcrypt.hash(password, 10);
      }

      if (Object.keys(updates).length === 0) {
        return res.status(400).json({ error: "No valid updates provided" });
      }

      const user = await storage.updateUser(id, updates);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      res.json({
        id: user.id,
        username: user.username,
        role: user.role,
        displayName: user.displayName,
        avatarUrl: user.avatarUrl,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to update user" });
    }
  });

  app.delete("/api/users/:id", requireAuth, requireRole(["admin"]), async (req, res) => {
    try {
      const { id } = req.params;

      // Prevent admin from deleting themselves
      if (req.user!.id === id) {
        return res.status(400).json({ error: "Cannot delete your own account" });
      }

      await storage.deleteUser(id);
      res.json({ message: "User deleted successfully" });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete user" });
    }
  });
}

export const requireAuth: RequestHandler = (req, res, next) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: "Authentication required" });
  }
  next();
};

export const requireRole = (roles: string[]): RequestHandler => {
  return (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Authentication required" });
    }
    if (!roles.includes(req.user!.role)) {
      return res.status(403).json({ error: "Insufficient permissions" });
    }
    next();
  };
};

export const canEditDocuments: RequestHandler = (req, res, next) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: "Authentication required" });
  }
  if (!["editor", "admin"].includes(req.user!.role)) {
    return res.status(403).json({ error: "Edit permission required" });
  }
  next();
};

export const canDeleteDocuments: RequestHandler = (req, res, next) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: "Authentication required" });
  }
  if (req.user!.role !== "admin") {
    return res.status(403).json({ error: "Admin permission required" });
  }
  next();
};
