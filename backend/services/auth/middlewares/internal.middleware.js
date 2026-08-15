// Guards routes that are only meant to be called by other internal
// services (billing, agent), never directly by a client through the gateway.
export const requireInternalSecret = (req, res, next) => {

  const provided = req.headers["x-internal-secret"];

  if (!process.env.INTERNAL_SERVICE_SECRET) {
    // Fail closed: if the secret isn't configured, refuse rather than
    // silently allowing unauthenticated access.
    console.error("INTERNAL_SERVICE_SECRET is not set — refusing internal request.");
    return res.status(500).json({
      success: false,
      message: "Internal service misconfiguration"
    });
  }

  if (!provided || provided !== process.env.INTERNAL_SERVICE_SECRET) {
    return res.status(403).json({
      success: false,
      message: "Forbidden"
    });
  }

  next();
};
