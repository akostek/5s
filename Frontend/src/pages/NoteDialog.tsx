import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Typography,
    Box,
    CircularProgress,
    Alert
} from '@mui/material';
import { CloudUpload, Image as ImageIcon } from '@mui/icons-material';
import apiService from '../services/api';

interface NoteDialogProps {
    open: boolean;
    title: string;
    description?: string;
    onClose: () => void;
    onConfirm: (note: string, imageUrl?: string) => void;
    confirmLabel?: string;
    requireImage?: boolean;
    showImageUpload?: boolean;
}

const NoteDialog: React.FC<NoteDialogProps> = ({
    open,
    title,
    description,
    onClose,
    onConfirm,
    confirmLabel = 'Kaydet',
    requireImage = false,
    showImageUpload = true
}) => {
    const [note, setNote] = useState('');
    const [imageUrl, setImageUrl] = useState<string | undefined>(undefined);
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);

    const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            setUploadError('Lütfen geçerli bir görsel dosyası seçin.');
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            setUploadError('Dosya boyutu 5MB\'dan küçük olmalıdır.');
            return;
        }

        setUploading(true);
        setUploadError(null);

        try {
            const result = await apiService.uploadImage(file);
            setImageUrl(result.imageUrl);
        } catch (error: any) {
            console.error('Image upload error:', error);
            setUploadError(error?.response?.data?.message || 'Görsel yüklenirken hata oluştu.');
        } finally {
            setUploading(false);
        }
    };

    const handleConfirm = () => {
        onConfirm(note, imageUrl);
        setNote('');
        setImageUrl(undefined);
        setUploadError(null);
    };

    const handleClose = () => {
        setNote('');
        setImageUrl(undefined);
        setUploadError(null);
        onClose();
    };

    const isConfirmDisabled = requireImage ? (!note.trim() || !imageUrl) : !note.trim();

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth sx={{ zIndex: 2000 }}>
            <DialogTitle>{title}</DialogTitle>
            <DialogContent>
                {description && (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {description}
                    </Typography>
                )}

                {/* Image Upload Section */}
                {showImageUpload && (
                    <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                            Kanıt Görseli {requireImage && <span style={{ color: 'red' }}>*</span>}
                        </Typography>

                        {uploadError && (
                            <Alert severity="error" sx={{ mb: 1, fontSize: '0.8rem' }}>
                                {uploadError}
                            </Alert>
                        )}

                        {imageUrl ? (
                            <Box sx={{ position: 'relative', display: 'inline-block' }}>
                                <img
                                    src={imageUrl.startsWith('http') ? imageUrl :
                                        `${process.env.REACT_APP_API_URL?.replace('/api', '') || `http://${window.location.hostname}:5000`}${imageUrl.startsWith('/') ? imageUrl : '/' + imageUrl}`}
                                    alt="Kanıt görseli"
                                    style={{
                                        maxWidth: '100%',
                                        maxHeight: 200,
                                        borderRadius: 4,
                                        border: '1px solid #e0e0e0'
                                    }}
                                />
                                <Button
                                    size="small"
                                    color="error"
                                    onClick={() => setImageUrl(undefined)}
                                    sx={{ position: 'absolute', top: 4, right: 4, minWidth: 'auto', p: 0.5 }}
                                >
                                    ✕
                                </Button>
                            </Box>
                        ) : (
                            <Button
                                component="label"
                                variant="outlined"
                                startIcon={uploading ? <CircularProgress size={16} /> : <CloudUpload />}
                                disabled={uploading}
                                sx={{ width: '100%', py: 2 }}
                            >
                                {uploading ? 'Yükleniyor...' : 'Görsel Yükle'}
                                <input
                                    type="file"
                                    hidden
                                    accept="image/*"
                                    onChange={handleFileSelect}
                                />
                            </Button>
                        )}
                    </Box>
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
                <Button onClick={handleClose}>İptal</Button>
                <Button onClick={handleConfirm} variant="contained" disabled={isConfirmDisabled}>
                    {confirmLabel}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default NoteDialog;
