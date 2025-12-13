import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Typography
} from '@mui/material';

interface NoteDialogProps {
    open: boolean;
    title: string;
    description?: string;
    onClose: () => void;
    onConfirm: (note: string) => void;
    confirmLabel?: string;
}

const NoteDialog: React.FC<NoteDialogProps> = ({
    open,
    title,
    description,
    onClose,
    onConfirm,
    confirmLabel = 'Kaydet'
}) => {
    const [note, setNote] = useState('');

    const handleConfirm = () => {
        onConfirm(note);
        setNote('');
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>{title}</DialogTitle>
            <DialogContent>
                {description && (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {description}
                    </Typography>
                )}
                <TextField
                    autoFocus
                    margin="dense"
                    label="Not / Açıklama"
                    fullWidth
                    multiline
                    rows={4}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    variant="outlined"
                    placeholder="Lütfen açıklama giriniz..."
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>İptal</Button>
                <Button onClick={handleConfirm} variant="contained" disabled={!note.trim()}>
                    {confirmLabel}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default NoteDialog;
