import Router from "express"
import * as NC from "../notes/notes.services.js"
const noteRouter = Router()
noteRouter.post("",NC.addNote)
noteRouter.patch("/all",NC.updateAllTitle)
noteRouter.patch("/:noteId",NC.updateNote)
noteRouter.put("/replace/:noteId",NC.replaceNote)
noteRouter.delete("",NC.DeleteAllNotes)
noteRouter.delete("/:noteId",NC.deleteNote)
noteRouter.get("/note-by-content",NC.getNoteBycontent)
noteRouter.get("/aggregate",NC.getNotebyTitle)
noteRouter.get("/paginate-sort",NC.getPaginatedNotes)
noteRouter.get("/note-with-user",NC.getNoteWithUser)
noteRouter.get("/:noteId",NC.getNoteByID)



export default noteRouter