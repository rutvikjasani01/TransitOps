export const health = (req, res) => res.json({ success: true, data: { status: "ok", storage: "postgresql" } });
export const protectedExample = (req, res) => res.json({ success: true, data: { message: "Authenticated request accepted.", user: req.auth.user } });
