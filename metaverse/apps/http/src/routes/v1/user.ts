import { Router } from "express";
import client from "@repo/db/client";
export const userRouter = Router();

userRouter.post('/metadata', async (req, res) => {});    
userRouter.get('/metadata/bulk/:id', async (req, res) => {});   