import React from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField } from "@mui/material";
import { Editor} from "draft-js";
import { stateToHTML } from 'draft-js-export-html';
import { updateOrderInState } from "../../utils/orderUtils";
import { sendEmailAPI } from "../../services/orderService";

const EmailModal = ({ open, handleClose, emailData, setEmailData, setOrders}) => {

    const handleEditorChange = (editorState) => {
        setEmailData({ ...emailData, body: stateToHTML(editorState.getCurrentContent()), bodyFrontend: editorState });
      };

      const handleSendEmail = async () => {
        if (!emailData.to || !emailData.subject || !emailData.body) {
          alert("Email recipient, subject, and body are required.");
          return;
        }
      
        try {
          const updatedOrder = await sendEmailAPI(emailData);
      
          if (updatedOrder) {
            // Ensure updated order contains valid JSON properties
            setOrders((prevOrders) => updateOrderInState(prevOrders, updatedOrder));
          } else {
            console.error("Failed to update order: No response received.");
          }
        } catch (error) {
          console.error("Error sending email:", error);
          alert("An error occurred while sending the email.");
        }
      
        handleClose(false);
      };
    

  return (
    <Dialog open={open} onClose={handleClose} disableEnforceFocus>
    <DialogTitle>Send Email</DialogTitle>
    <DialogContent>
      <TextField
        label="Recipient Email"
        value={emailData.to}
        fullWidth
        onChange={(e) => setEmailData({ ...emailData, to: e.target.value })}
        margin="normal"
      />
      <TextField
        label="Subject"
        value={emailData.subject}
        fullWidth
        onChange={(e) => setEmailData({ ...emailData, subject: e.target.value })}
        margin="normal"
      />
      <div style={{ border: '1px solid black', minHeight: '200px', padding: '10px', marginTop: '10px' }}>
        <Editor
          editorState={emailData.bodyFrontend}
          onChange={handleEditorChange}
        />
      </div>
    </DialogContent>
    <DialogActions>
      <Button onClick={handleClose} color="secondary">Close</Button>
      <Button onClick={handleSendEmail} color="primary">Send Email</Button>
    </DialogActions>
  </Dialog>
  );
};

export default EmailModal;
