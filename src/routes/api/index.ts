import { Router } from "express";
import { appRouter } from "./app";
import { adminRouter } from "./admin";

export const apiRouter = Router();

apiRouter.use("/app", appRouter)
apiRouter.use("/admin", adminRouter)