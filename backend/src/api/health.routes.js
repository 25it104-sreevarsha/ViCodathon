import { Router } from "express";
import { curriculumService } from "../curriculum/curriculum.service.js";
import { candidatesService } from "../candidates/candidates.service.js";

export const healthRouter = Router();

/**
 * GET /health
 * Reports whether the server is up and whether both data files load and
 * validate. Why check the data layer here: if curriculum.json or
 * candidates.json is missing/malformed, we want that visible immediately
 * rather than surfacing as a confusing 500 on the first real request.
 */
healthRouter.get("/health", (req, res) => {
  const curriculumOk = curriculumService.isAvailable();
  const candidatesOk = candidatesService.isAvailable();
  const allOk = curriculumOk && candidatesOk;

  res.status(allOk ? 200 : 503).json({
    status: allOk ? "ok" : "degraded",
    server: "running",
    dataLayer: {
      curriculum: curriculumOk ? "available" : "unavailable",
      candidates: candidatesOk ? "available" : "unavailable",
    },
    timestamp: new Date().toISOString(),
  });
});
