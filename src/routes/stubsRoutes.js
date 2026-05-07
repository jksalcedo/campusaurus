import { Router } from "express";

/**
 * Stub route helper.
 * Returns 501 so frontend collaborators can work against stable endpoints.
 */
export function createNotImplementedRouter(featureName) {
    const router = Router();

    router.all(/.*/, (req, res) => {
        res.status(501).json({
        error: "not_implemented",
        feature: featureName,
        path: req.originalUrl,
        message: `Backend for '${featureName}' isn't implemented yet.`
        });
    });

    return router;
}
