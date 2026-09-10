import jwt from "jsonwebtoken";

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (secret) return secret;
  if (process.env.NODE_ENV === "production") {
    throw new Error("JWT_SECRET is required in production");
  }
  return "1990-local-development-secret";
}

export function signAuthToken(user) {
  return jwt.sign(
    { sub: user.id, email: user.email, role: user.role || "customer" },
    getJwtSecret(),
    { expiresIn: "7d" }
  );
}

export function requireAuth(req, res, next) {
  const authorization = req.headers.authorization ?? "";
  const token = authorization.startsWith("Bearer ")
    ? authorization.slice(7)
    : null;

  if (!token) {
    return res.status(401).json({ message: "Authentication required" });
  }

  try {
    const payload = jwt.verify(token, getJwtSecret());
    req.auth = {
      userId: Number(payload.sub),
      email: payload.email,
      role: payload.role || "customer",
    };
    next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.auth) {
      return res.status(401).json({ message: "Authentication required" });
    }
    if (!roles.includes(req.auth.role)) {
      return res.status(403).json({ message: "Forbidden: insufficient permissions" });
    }
    next();
  };
}

