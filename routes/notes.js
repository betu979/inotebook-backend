const express = require('express');
const router = express.Router()
const fetchuser = require('../middleware/fetchuser');
const { check, validationResult } = require("express-validator");
const Notes = require('../models/Notes')

// Route 1: Get all the Notes using: GET "/notes/fetchallnotes". Login required
router.get('/fetchallnotes', fetchuser, async (req, res)=>{
    try {
        const notes = await Notes.find({user: req.user.id})
        res.json(notes)
    } catch(error){
        console.error(error.message);
        res.status(500).send("Internal Server Error")
    }
    
})

// Route 2: Adding a new Note using: POST "/notes/addnote". Login required
router.post('/addnote', fetchuser, [
    check("title").isLength({ min: 3}).withMessage("Enter a valid title"),
    check("description").isLength({ min: 5}).withMessage("Description must be atleast 5 characters")
], async (req, res)=>{

    // If there are errors return bad request and the errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
        const { title, description, tag } = req.body
        const note = new Notes({
            title, description, tag, user: req.user.id
        })
        const savedNote = await note.save()
        res.json(note)
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error")
    }
    
})

// Route 3: Update an existing Note using: PUT "/notes/updatenote". Login required
router.put('/updatenote/:id', fetchuser, async (req, res)=>{
    
    try {
        const { title, description, tag } = req.body
        // Create a new Note Object
        const newNote = {}
        if(title){newNote.title = title}
        if(description){newNote.description = description}
        if(tag){newNote.tag = tag}

        // Find the note to be updated and update it
        let note = await Notes.findById(req.params.id)
        if(!note){return res.status(404).send("Not Found")}

        if(note.user.toString() !== req.user.id){
            return res.status(401).send("Not Allowed")
        }

        note = await Notes.findByIdAndUpdate(req.params.id, {$set: newNote}, {new:true})
        res.json(note)
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error")
    }
})

// Route 3: Delete an existing Note using: DELETE "/notes/deletenote". Login required
router.delete('/deletenote/:id', fetchuser, async (req, res)=>{
    try {
        // Find the note to be deleted and delete it
        let note = await Notes.findById(req.params.id)
        if(!note){return res.status(404).send("Not Found")}

        // Allow deletion only if user owns this Note
        if(note.user.toString() !== req.user.id){
            return res.status(401).send("Not Allowed")
        }

        note = await Notes.findByIdAndUpdate(req.params.id)
        res.json({ "Success": "Note has been deleted", note: note})
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error")
    }
})

module.exports = router