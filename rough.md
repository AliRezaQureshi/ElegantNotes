<dialog id="noteDialog" class="note-dialog">
        <div class="dialog-content">
            <div class="dialog-header">
                <h2 class="dialog-title" id="dialogTitle">Add New Note</h2>
                <button class="close-btn" onclick="closeNoteDialog()">❌</button>
            </div>
            <form id="noteForm">
                <label for="noteContent" class="form-label">Content</label>
                <textarea  id="noteContent" class="form-textarea" placeholder="Write your note here..." required></textarea>

                <div class="dialog-actions">
                    <button type="button" class="cancel-btn" onclick="closeNoteDialog()">Cancel</button>
                    <button type="submit" class="save-btn">Save Note</button>
                </div>
            </form>
        </div>

</dialog>
