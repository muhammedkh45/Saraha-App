import Router from "express";
import * as NC from "../notes/notes.services.js";
import { Authentication } from "../../middleware/authentication.js";
const noteRouter = Router();
noteRouter.post("", Authentication, NC.addNote);
noteRouter.patch("/all", Authentication, NC.updateAllTitle);
noteRouter.patch("/:noteId", Authentication, NC.updateNote);
noteRouter.put("/replace/:noteId", Authentication, NC.replaceNote);
noteRouter.delete("", Authentication, NC.DeleteAllNotes);
noteRouter.delete("/:noteId", Authentication, NC.deleteNote);
noteRouter.get("/note-by-content", Authentication, NC.getNoteBycontent);
noteRouter.get("/aggregate", Authentication, NC.getNotebyTitle);
noteRouter.get("/paginate-sort", Authentication, NC.getPaginatedNotes);
noteRouter.get("/note-with-user", Authentication, NC.getNoteWithUser);
noteRouter.get("/:noteId", Authentication, NC.getNoteByID);

export default noteRouter;
