import React, { useEffect, useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Box,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    CircularProgress,
    IconButton
} from '@mui/material';
import { Close } from '@mui/icons-material';
import { format } from 'date-fns';
import { apiService } from '../services/api';
import { ActionHistory } from '../types';

interface ActionHistoryDialogProps {
    open: boolean;
    onClose: () => void;
    actionId: number;
}

const getStatusLabel = (status: string | number) => {
    const s = String(status).toLowerCase();
    switch (s) {
        case 'open':
        case '0':
        case 'açık':
        case 'aksiyon sahibinde':
            return 'Aksiyon Sahibinde';
        case 'pending_approval':
        case 'pendingapproval':
        case '2':
        case 'denetçi onayı bekliyor':
        case 'denetçi kontrolünde':
            return 'Denetçi Kontrolünde';
        case 'completed':
        case 'closed':
        case '3':
        case 'tamamlandı':
        case 'kapandı':
            return 'Kapandı';
        case 'in_progress':
        case '1':
        case 'devam ediyor':
            return 'Devam Ediyor';
        default:
            return s;
    }
};

const ActionHistoryDialog: React.FC<ActionHistoryDialogProps> = ({ open, onClose, actionId }) => {
    const [history, setHistory] = useState<ActionHistory[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const loadHistory = async () => {
            if (open && actionId) {
                setLoading(true);
                try {
                    const data = await apiService.getActionHistory(actionId);
                    setHistory(data);
                } catch (error) {
                    console.error('Error loading history:', error);
                } finally {
                    setLoading(false);
                }
            }
        };

        loadHistory();
    }, [open, actionId]);

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography variant="h6">Aksiyon Tarihçesi</Typography>
                    <IconButton onClick={onClose} size="small">
                        <Close />
                    </IconButton>
                </Box>
            </DialogTitle>
            <DialogContent dividers>
                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                        <CircularProgress />
                    </Box>
                ) : history.length === 0 ? (
                    <Typography sx={{ p: 2, textAlign: 'center' }}>Kayıt bulunamadı.</Typography>
                ) : (
                    <TableContainer component={Paper} variant="outlined">
                        <Table size="small">
                            <TableHead>
                                <TableRow sx={{ bgcolor: 'grey.100' }}>
                                    <TableCell>Tarih</TableCell>
                                    <TableCell>İşlemi Yapan</TableCell>
                                    <TableCell>Önceki Durum</TableCell>
                                    <TableCell>Yeni Durum</TableCell>
                                    <TableCell>Açıklama</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {history.map((record) => (
                                    <TableRow key={record.id} hover>
                                        <TableCell sx={{ fontSize: '0.8rem' }}>
                                            {format(new Date(record.createdAt), 'dd.MM.yyyy HH:mm')}
                                        </TableCell>
                                        <TableCell sx={{ fontSize: '0.8rem' }}>{record.changedBy || '-'}</TableCell>
                                        <TableCell sx={{ fontSize: '0.8rem' }}>{getStatusLabel(record.statusFrom)}</TableCell>
                                        <TableCell sx={{ fontSize: '0.8rem', fontWeight: 500 }}>{getStatusLabel(record.statusTo)}</TableCell>
                                        <TableCell sx={{ fontSize: '0.8rem' }}>{record.comment || '-'}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Kapat</Button>
            </DialogActions>
        </Dialog>
    );
};

export default ActionHistoryDialog;
