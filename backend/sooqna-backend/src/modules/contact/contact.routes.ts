import { Router } from "express";
import { postContact } from "./contact.controller";

export const contactRouter = Router();

contactRouter.post("/", postContact);
