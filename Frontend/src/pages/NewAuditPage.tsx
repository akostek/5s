import React, { useState, useEffect, useMemo } from 'react';
import {
  Typography, Box, Button, Card, CardContent, LinearProgress,
  FormControlLabel, Checkbox, RadioGroup, FormControlLabel as RadioLabel, Radio,
  Chip, IconButton, Alert, CircularProgress, Select, MenuItem, FormControl, InputLabel,
  TextField, Collapse, Divider, Snackbar,
} from '@mui/material';
import { ArrowBack, ArrowForward, Save, Delete, CloudUpload, Close } from '@mui/icons-material';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';
import { Question, User } from '../types';

interface QuestionResponse {
  questionId: number;
  response: 'High' | 'Medium' | 'Low' | null;
}

const categories = [
  { id: 1, name: '1S - Seiri (Ayıklama)' },
  { id: 2, name: '2S - Seiton (Düzenleme)' },
  { id: 3, name: '3S - Seiso (Temizlik)' },
  { id: 4, name: '4S - Seiketsu (Standartlaştırma)' },
  { id: 5, name: '5S - Shitsuke (Disiplin)' },
];

const NewAuditPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const auditId = parseInt(searchParams.get('auditId') || '0');

  const [questions, setQuestions] = useState<Question[]>([]);
  const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [showUnansweredOnly, setShowUnansweredOnly] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<Map<number, 'High' | 'Medium' | 'Low'>>(new Map());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [actionForms, setActionForms] = useState<Map<number, ActionFormData[]>>(new Map());
  const [auditInfo, setAuditInfo] = useState<{ areaSupervisor?: string } | null>(null);
  const [questionImages, setQuestionImages] = useState<Map<number, string[]>>(new Map());
  const [actionImages, setActionImages] = useState<Map<string, string[]>>(new Map()); // key: "questionId-actionIndex"

  interface ActionFormData {
    id?: number; // ID of existing action, undefined for new actions
    identified_non_conformity: string;
    proposed_activity: string;
    planned_activity: string;
    responsible_person: string;
    target_date: string;
    priority: 'Düşük' | 'Orta' | 'Yüksek';
  }

  // Load questions and users
  useEffect(() => {
    const loadData = async () => {
      if (!auditId) {
        setError('Denetim ID bulunamadı');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const [allQuestions, allUsers, audits, existingResponses, existingActions] = await Promise.all([
          apiService.getQuestions(undefined, true, auditId), // Pass auditId to filter questions
          apiService.getUsers(),
          apiService.getAudits(),
          apiService.getAuditResponsesByAuditId(auditId).catch(() => []),
          apiService.getActionsByAuditId(auditId).catch(() => []),
        ]);
        setQuestions(allQuestions);
        setFilteredQuestions(allQuestions);
        setUsers(allUsers || []);

        // Get audit info for area supervisor
        const currentAudit = audits.find((a: any) => a.id === auditId);
        const areaSupervisor = currentAudit?.area_supervisor;
        if (currentAudit) {
          setAuditInfo({
            areaSupervisor: currentAudit.area_supervisor,
          });
        }

        // Load existing responses
        const responsesMap = new Map<number, 'High' | 'Medium' | 'Low'>();
        const imagesMap = new Map<number, string[]>();
        existingResponses.forEach((r: any) => {
          // Map backend enum to frontend string
          const responseValue = r.response || r.Response;
          const questionId = r.questionId || r.QuestionId;
          if (responseValue === 'High' || responseValue === 'Medium' || responseValue === 'Low') {
            responsesMap.set(questionId, responseValue);
          } else if (responseValue === 0 || responseValue === '0') {
            responsesMap.set(questionId, 'Low');
          } else if (responseValue === 1 || responseValue === '1') {
            responsesMap.set(questionId, 'Medium');
          } else if (responseValue === 2 || responseValue === '2') {
            responsesMap.set(questionId, 'High');
          }

          // Load existing images - convert to full URLs if needed
          if (r.imageUrls && Array.isArray(r.imageUrls) && r.imageUrls.length > 0) {
            const fullUrls = r.imageUrls.map((url: string) => {
              // If URL doesn't start with http, add base URL
              if (url.startsWith('/')) {
                const baseURL = process.env.REACT_APP_API_URL || `http://${window.location.hostname}:5000`;
                return baseURL.replace('/api', '') + url;
              }
              return url;
            });
            imagesMap.set(questionId, fullUrls);
          }
        });

        // Load existing actions
        const actionsMap = new Map<number, ActionFormData[]>();
        const actionImagesMap = new Map<string, string[]>();

        // Group actions by questionId
        const actionsByQuestion = new Map<number, any[]>();
        existingActions.forEach((action: any) => {
          // Backend uses camelCase (questionId), frontend uses snake_case (question_id)
          const questionId = action.questionId || action.question_id;
          if (!actionsByQuestion.has(questionId)) {
            actionsByQuestion.set(questionId, []);
          }
          actionsByQuestion.get(questionId)!.push(action);
        });

        // Convert actions to ActionFormData format
        actionsByQuestion.forEach((actions, questionId) => {
          const actionFormsData: ActionFormData[] = actions.map((action: any, index: number) => {
            // Load action images if exists
            const actionKey = `${questionId}-${index}`;
            // Backend uses camelCase (imagePath), frontend uses snake_case (image_path)
            const imagePath = action.imagePath || action.image_path;
            if (imagePath) {
              // If image_path is a single path, convert to array
              const imagePaths = imagePath.split(',').map((path: string) => path.trim()).filter((path: string) => path);
              const fullUrls = imagePaths.map((url: string) => {
                if (url.startsWith('/')) {
                  const baseURL = process.env.REACT_APP_API_URL || `http://${window.location.hostname}:5000`;
                  return baseURL.replace('/api', '') + url;
                }
                return url;
              });
              actionImagesMap.set(actionKey, fullUrls);
            }

            // Backend uses camelCase (suggestedActivity, plannedActivity, etc.)
            // Frontend uses snake_case (suggested_activity, planned_activity, etc.)
            const suggestedActivity = action.suggestedActivity || action.suggested_activity || '';
            const plannedActivity = action.plannedActivity || action.planned_activity || '';
            const responsiblePerson = action.responsiblePerson || action.responsible_person || areaSupervisor || '';
            const targetDate = action.targetDate || action.target_date;
            const targetDateStr = targetDate ? (typeof targetDate === 'string' ? targetDate : targetDate.toString()).split('T')[0] : '';

            return {
              id: action.id || action.Id, // Store action ID for update operations
              identified_non_conformity: action.description || action.identified_non_conformity || '',
              proposed_activity: suggestedActivity,
              planned_activity: plannedActivity,
              responsible_person: responsiblePerson,
              target_date: targetDateStr,
              priority: (action.priority === 'Düşük' || action.priority === 'Orta' || action.priority === 'Yüksek')
                ? action.priority
                : 'Orta' as 'Düşük' | 'Orta' | 'Yüksek',
            };
          });

          if (actionFormsData.length > 0) {
            actionsMap.set(questionId, actionFormsData);
          }
        });

        setActionForms(actionsMap);
        setActionImages(actionImagesMap);

        // If actions exist for a question but response is not set, ensure response is set to Low or Medium
        // This ensures action forms are visible when page loads
        actionsMap.forEach((actions, questionId) => {
          if (actions.length > 0 && !responsesMap.has(questionId)) {
            // If question has actions but no response, set response to Low (default for actions)
            responsesMap.set(questionId, 'Low');
          }
        });

        // Set all state at the end
        setResponses(responsesMap);
        setQuestionImages(imagesMap);
      } catch (err: any) {
        const errorMessage = err.response?.data?.error || err.response?.data?.message || err.message || 'Bilinmeyen hata';
        const innerException = err.response?.data?.innerException;
        console.error('Error loading data:', err.response?.data || err);
        setError(`Veriler yüklenirken hata oluştu: ${errorMessage}${innerException ? ' | ' + innerException : ''}`);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [auditId]);

  // Filter questions by category
  useEffect(() => {
    let filtered = questions;

    if (selectedCategoryId) {
      filtered = filtered.filter(q => q.categoryId === selectedCategoryId);
    }

    if (showUnansweredOnly) {
      filtered = filtered.filter(q => !responses.has(q.id));
    }

    setFilteredQuestions(filtered);

    // Reset to first question if current index is out of bounds
    if (currentQuestionIndex >= filtered.length && filtered.length > 0) {
      setCurrentQuestionIndex(0);
    } else if (filtered.length === 0) {
      setCurrentQuestionIndex(0);
    }
  }, [selectedCategoryId, showUnansweredOnly, questions, responses, currentQuestionIndex]);

  const currentQuestion = filteredQuestions[currentQuestionIndex];
  const answeredCount = responses.size;
  const totalCount = filteredQuestions.length;
  const progress = totalCount > 0 ? (answeredCount / totalCount) * 100 : 0;

  const handleResponseChange = (response: 'High' | 'Medium' | 'Low') => {
    if (!currentQuestion) return;

    const newResponses = new Map(responses);
    newResponses.set(currentQuestion.id, response);
    setResponses(newResponses);

    // If Low or Medium, ensure action form exists
    if ((response === 'Low' || response === 'Medium') && !actionForms.has(currentQuestion.id)) {
      const newActionForms = new Map(actionForms);
      newActionForms.set(currentQuestion.id, [{
        identified_non_conformity: '',
        proposed_activity: '',
        planned_activity: '',
        responsible_person: auditInfo?.areaSupervisor || '',
        target_date: '',
        priority: 'Orta',
      }]);
      setActionForms(newActionForms);
    } else if (response === 'High') {
      // Remove action form if response is High
      const newActionForms = new Map(actionForms);
      newActionForms.delete(currentQuestion.id);
      setActionForms(newActionForms);
    }
  };

  const handleAddAction = () => {
    if (!currentQuestion) return;
    const newActionForms = new Map(actionForms);
    const currentActions = newActionForms.get(currentQuestion.id) || [];
    newActionForms.set(currentQuestion.id, [...currentActions, {
      identified_non_conformity: '',
      proposed_activity: '',
      planned_activity: '',
      responsible_person: auditInfo?.areaSupervisor || '',
      target_date: '',
      priority: 'Orta',
    }]);
    setActionForms(newActionForms);
  };

  const handleRemoveAction = (actionIndex: number) => {
    if (!currentQuestion) return;
    const newActionForms = new Map(actionForms);
    const currentActions = newActionForms.get(currentQuestion.id) || [];
    if (currentActions.length > 1) {
      currentActions.splice(actionIndex, 1);
      newActionForms.set(currentQuestion.id, currentActions);
    } else {
      newActionForms.delete(currentQuestion.id);
    }
    setActionForms(newActionForms);
  };

  const handleActionFieldChange = (actionIndex: number, field: keyof ActionFormData, value: string) => {
    if (!currentQuestion) return;
    const newActionForms = new Map(actionForms);
    const currentActions = [...(newActionForms.get(currentQuestion.id) || [])];
    currentActions[actionIndex] = { ...currentActions[actionIndex], [field]: value };
    newActionForms.set(currentQuestion.id, currentActions);
    setActionForms(newActionForms);
  };

  const handleQuestionImageUpload = async (questionId: number, files: FileList | null) => {
    if (!files || files.length === 0) return;
    const currentImages = questionImages.get(questionId) || [];
    const remainingSlots = 3 - currentImages.length;
    if (remainingSlots <= 0) {
      setError('Her soru için maksimum 3 görsel yüklenebilir');
      return;
    }

    const filesToAdd = Array.from(files).slice(0, remainingSlots);

    try {
      setError(null);
      const uploadResult = await apiService.uploadImages(filesToAdd);

      // Update images with uploaded URLs
      const updatedImages = new Map(questionImages);
      updatedImages.set(questionId, [...currentImages, ...uploadResult.imageUrls]);
      setQuestionImages(updatedImages);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Resim yüklenirken hata oluştu';
      setError(errorMessage);
      console.error('Error uploading images:', err);
    }
  };

  const handleRemoveQuestionImage = (questionId: number, imageIndex: number) => {
    const currentImages = questionImages.get(questionId) || [];
    const updatedImages = currentImages.filter((_, idx) => idx !== imageIndex);
    const updatedMap = new Map(questionImages);
    if (updatedImages.length === 0) {
      updatedMap.delete(questionId);
    } else {
      updatedMap.set(questionId, updatedImages);
    }
    setQuestionImages(updatedMap);
  };

  const handleActionImageUpload = async (questionId: number, actionIndex: number, files: FileList | null) => {
    if (!files || files.length === 0) return;
    const key = `${questionId}-${actionIndex}`;
    const currentImages = actionImages.get(key) || [];
    const remainingSlots = 3 - currentImages.length;
    if (remainingSlots <= 0) {
      setError('Her aksiyon için maksimum 3 görsel yüklenebilir');
      return;
    }

    const filesToAdd = Array.from(files).slice(0, remainingSlots);

    try {
      setError(null);
      const uploadResult = await apiService.uploadImages(filesToAdd);

      // Update images with uploaded URLs
      const updatedImages = new Map(actionImages);
      updatedImages.set(key, [...currentImages, ...uploadResult.imageUrls]);
      setActionImages(updatedImages);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Resim yüklenirken hata oluştu';
      setError(errorMessage);
      console.error('Error uploading images:', err);
    }
  };

  const handleRemoveActionImage = (questionId: number, actionIndex: number, imageIndex: number) => {
    const key = `${questionId}-${actionIndex}`;
    const currentImages = actionImages.get(key) || [];
    const updatedImages = currentImages.filter((_, idx) => idx !== imageIndex);
    const updatedMap = new Map(actionImages);
    if (updatedImages.length === 0) {
      updatedMap.delete(key);
    } else {
      updatedMap.set(key, updatedImages);
    }
    setActionImages(updatedMap);
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < filteredQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handleSave = async () => {
    // Check if at least one question is answered
    if (responses.size === 0) {
      setError('Lütfen en az bir soru cevaplayın.');
      return;
    }

    // Validate action forms for Low/Medium responses
    const responsesArray = Array.from(responses.entries());
    for (const [questionId, response] of responsesArray) {
      if ((response === 'Low' || response === 'Medium')) {
        const actions = actionForms.get(questionId) || [];
        if (actions.length === 0) {
          const question = questions.find(q => q.id === questionId);
          setError(`"${question?.text || 'Soru'}" için Düşük veya Orta seçildiğinde en az bir aksiyon planı gereklidir`);
          return;
        }
        for (let i = 0; i < actions.length; i++) {
          const action = actions[i];
          if (!action.identified_non_conformity || !action.proposed_activity || !action.planned_activity || !action.responsible_person || !action.target_date) {
            setError(`"${questions.find(q => q.id === questionId)?.text || 'Soru'}" için Aksiyon ${i + 1} alanlarının tümü doldurulmalıdır`);
            return;
          }
        }
      }
    }

    try {
      setSaving(true);
      setError(null);

      // Save all audit responses
      const responsesArray = Array.from(responses.entries());
      for (const [questionId, response] of responsesArray) {
        // Get images for this question
        const images = questionImages.get(questionId) || [];

        await apiService.submitAuditResponse({
          auditId,
          questionId,
          response,
          imageUrls: images.length > 0 ? images : undefined,
        });

        // Save actions if Low or Medium
        if ((response === 'Low' || response === 'Medium')) {
          const actions = actionForms.get(questionId) || [];
          for (let actionIndex = 0; actionIndex < actions.length; actionIndex++) {
            const action = actions[actionIndex];
            try {
              // Convert target_date to ISO format if it exists
              let targetDateISO: string | undefined = undefined;
              if (action.target_date) {
                const dateStr = action.target_date;
                if (dateStr.length === 10) {
                  targetDateISO = new Date(dateStr + 'T00:00:00').toISOString();
                } else {
                  targetDateISO = new Date(dateStr).toISOString();
                }
              }

              // Get images for this action
              const actionKey = `${questionId}-${actionIndex}`;
              const actionImagesList = actionImages.get(actionKey) || [];

              // If action has an ID, update it; otherwise create a new one
              if (action.id) {
                // Update existing action
                await apiService.updateAction(action.id, {
                  description: action.identified_non_conformity,
                  suggestedActivity: action.proposed_activity,
                  plannedActivity: action.planned_activity,
                  responsiblePerson: action.responsible_person,
                  targetDate: targetDateISO,
                  imageUrls: actionImagesList.length > 0 ? actionImagesList : undefined,
                });
              } else {
                // Create new action
                await apiService.createAction({
                  questionId: questionId,
                  auditId: auditId,
                  description: action.identified_non_conformity,
                  suggestedActivity: action.proposed_activity,
                  plannedActivity: action.planned_activity,
                  responsiblePerson: action.responsible_person,
                  targetDate: targetDateISO,
                  imageUrls: actionImagesList.length > 0 ? actionImagesList : undefined,
                });
              }
            } catch (actionError: any) {
              console.error('Error creating action:', actionError);
              const errorMsg = actionError?.response?.data?.error || actionError?.response?.data?.message || actionError?.message || 'Bilinmeyen hata';
              const innerException = actionError?.response?.data?.innerException;
              throw new Error(`Aksiyon kaydedilirken hata: ${errorMsg}${innerException ? ' | İç Hata: ' + innerException : ''}`);
            }
          }
        }
      }

      // Show success message and navigate back
      setSaveSuccess(true);
      setTimeout(() => {
        navigate('/audits', { replace: true });
        // Force reload to refresh audit status
        window.location.reload();
      }, 1500);
    } catch (err: any) {
      setError('Yanıt kaydedilirken hata oluştu: ' + (err.message || 'Bilinmeyen hata'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (!auditId) {
    return (
      <Box p={3}>
        <Alert severity="error">Denetim ID bulunamadı. Lütfen denetimler sayfasından tekrar deneyin.</Alert>
      </Box>
    );
  }

  if (filteredQuestions.length === 0) {
    return (
      <Box p={3}>
        <Alert severity="info">
          {selectedCategoryId ? 'Seçilen kategoride soru bulunamadı.' : 'Soru bulunamadı.'}
        </Alert>
      </Box>
    );
  }

  const currentResponse = currentQuestion ? responses.get(currentQuestion.id) : null;

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        Denetim Soruları
      </Typography>

      {/* Category Filter and Options */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Kategori Seç</InputLabel>
          <Select
            value={selectedCategoryId || ''}
            label="Kategori Seç"
            onChange={(e) => setSelectedCategoryId(e.target.value ? Number(e.target.value) : null)}
          >
            <MenuItem value="">Tüm Kategoriler</MenuItem>
            {categories.map(cat => (
              <MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControlLabel
          control={
            <Checkbox
              checked={showUnansweredOnly}
              onChange={(e) => setShowUnansweredOnly(e.target.checked)}
            />
          }
          label="Sadece cevaplanmamış soruları göster"
        />

        <Box sx={{ ml: 'auto' }}>
          <Chip
            label={`${answeredCount} / ${totalCount} cevaplandı`}
            color={answeredCount === totalCount ? 'success' : 'default'}
          />
        </Box>
      </Box>

      {/* Progress Bar */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="body2" color="text.secondary">
            İlerleme
          </Typography>
          <Typography variant="body2" color="text.secondary">
            %{Math.round(progress)}
          </Typography>
        </Box>
        <LinearProgress variant="determinate" value={progress} sx={{ height: 8, borderRadius: 4 }} />
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Question Card */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ mb: 2 }}>
            <Chip
              label={currentQuestion?.categoryName || 'Kategori'}
              color="primary"
              size="small"
              sx={{ mb: 2 }}
            />
            <Typography variant="h5" gutterBottom>
              Soru {currentQuestionIndex + 1} / {filteredQuestions.length}
            </Typography>
            <Typography variant="h6" sx={{ mt: 2, mb: 3 }}>
              {currentQuestion?.text}
            </Typography>
          </Box>

          {/* Main Content: Split into 2 columns */}
          <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', md: 'row' } }}>
            {/* Left Column: Response Options */}
            <Box sx={{ flex: 1 }}>
              <FormControl component="fieldset" fullWidth>
                <RadioGroup
                  value={currentResponse || ''}
                  onChange={(e) => handleResponseChange(e.target.value as 'High' | 'Medium' | 'Low')}
                >
                  <RadioLabel
                    value="High"
                    control={<Radio />}
                    label={
                      <Box>
                        <Typography variant="body1" fontWeight="bold">
                          Yüksek ({currentQuestion?.pointsHigh || 3} puan)
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Tam uyum - Tüm kriterler karşılanıyor
                        </Typography>
                      </Box>
                    }
                    sx={{ mb: 2, p: 1, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}
                  />
                  <RadioLabel
                    value="Medium"
                    control={<Radio />}
                    label={
                      <Box>
                        <Typography variant="body1" fontWeight="bold">
                          Orta ({currentQuestion?.pointsMedium || 2} puan)
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Kısmi uyum - Bazı kriterler karşılanıyor
                        </Typography>
                      </Box>
                    }
                    sx={{ mb: 2, p: 1, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}
                  />
                  <RadioLabel
                    value="Low"
                    control={<Radio />}
                    label={
                      <Box>
                        <Typography variant="body1" fontWeight="bold">
                          Düşük ({currentQuestion?.pointsLow || 1} puan)
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Düşük uyum - Kriterler karşılanmıyor
                        </Typography>
                      </Box>
                    }
                    sx={{ mb: 2, p: 1, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}
                  />
                </RadioGroup>
              </FormControl>
            </Box>

            {/* Right Column: Image Upload */}
            <Box sx={{ flex: 1, minWidth: { xs: '100%', md: '300px' } }}>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                Soru Görselleri (Max 3)
              </Typography>
              <Box sx={{ border: '2px dashed', borderColor: 'divider', borderRadius: 2, p: 2, mb: 2 }}>
                <input
                  accept="image/*"
                  style={{ display: 'none' }}
                  id={`question-image-upload-${currentQuestion?.id}`}
                  type="file"
                  multiple
                  onChange={(e) => {
                    if (currentQuestion && e.target.files) {
                      handleQuestionImageUpload(currentQuestion.id, e.target.files);
                    }
                  }}
                />
                <label htmlFor={`question-image-upload-${currentQuestion?.id}`}>
                  <Button
                    component="span"
                    variant="outlined"
                    startIcon={<CloudUpload />}
                    fullWidth
                    disabled={(questionImages.get(currentQuestion?.id || 0) || []).length >= 3}
                    sx={{ mb: 2 }}
                  >
                    Görsel Yükle
                  </Button>
                </label>
                {(questionImages.get(currentQuestion?.id || 0) || []).length > 0 && (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {(questionImages.get(currentQuestion?.id || 0) || []).map((image, idx) => (
                      <Box key={idx} sx={{ position: 'relative', width: 80, height: 80 }}>
                        <img
                          src={image.startsWith('http') ? image : `${process.env.REACT_APP_API_URL?.replace('/api', '') || `http://${window.location.hostname}:5000`}${image.startsWith('/') ? image : '/' + image}`}
                          alt={`Soru görseli ${idx + 1}`}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            borderRadius: 4,
                            border: '1px solid #e0e0e0',
                          }}
                          onError={(e) => {
                            console.error('Image load error:', image);
                            (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="80" height="80"%3E%3Crect fill="%23ddd" width="80" height="80"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23999"%3EResim Yüklenemedi%3C/text%3E%3C/svg%3E';
                          }}
                        />
                        <IconButton
                          size="small"
                          onClick={() => currentQuestion && handleRemoveQuestionImage(currentQuestion.id, idx)}
                          sx={{
                            position: 'absolute',
                            top: -8,
                            right: -8,
                            bgcolor: 'error.main',
                            color: 'white',
                            width: 24,
                            height: 24,
                            '&:hover': { bgcolor: 'error.dark' },
                          }}
                        >
                          <Close fontSize="small" />
                        </IconButton>
                      </Box>
                    ))}
                  </Box>
                )}
              </Box>
            </Box>
          </Box>

          {/* Action Plan Form - Show when Low or Medium is selected */}
          {currentResponse && (currentResponse === 'Low' || currentResponse === 'Medium') && (
            <Box sx={{ mt: 3 }}>
              <Divider sx={{ mb: 2 }} />
              <Typography variant="h6" sx={{ mb: 2, color: 'warning.main' }}>
                Aksiyon Planı
              </Typography>
              {(actionForms.get(currentQuestion.id) || []).map((action, actionIndex) => (
                <Card key={actionIndex} sx={{ mb: 2, bgcolor: 'warning.50', border: '1px solid', borderColor: 'warning.200' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="subtitle1" fontWeight="bold" color="warning.dark">
                        Aksiyon #{actionIndex + 1}
                      </Typography>
                      {(actionForms.get(currentQuestion.id) || []).length > 1 && (
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleRemoveAction(actionIndex)}
                        >
                          <Delete />
                        </IconButton>
                      )}
                    </Box>
                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
                      <TextField
                        label="Uygunsuzluk Tespiti"
                        fullWidth
                        size="small"
                        multiline
                        rows={2}
                        value={action.identified_non_conformity}
                        onChange={(e) => handleActionFieldChange(actionIndex, 'identified_non_conformity', e.target.value)}
                        required
                      />
                      <TextField
                        label="Önerilen Faaliyet"
                        fullWidth
                        size="small"
                        multiline
                        rows={2}
                        value={action.proposed_activity}
                        onChange={(e) => handleActionFieldChange(actionIndex, 'proposed_activity', e.target.value)}
                        required
                      />
                      <TextField
                        label="Planlanan Faaliyet"
                        fullWidth
                        size="small"
                        multiline
                        rows={2}
                        value={action.planned_activity}
                        onChange={(e) => handleActionFieldChange(actionIndex, 'planned_activity', e.target.value)}
                        required
                      />
                      <TextField
                        label="Sorumlu Kişi"
                        fullWidth
                        size="small"
                        value={action.responsible_person}
                        onChange={(e) => handleActionFieldChange(actionIndex, 'responsible_person', e.target.value)}
                        required
                      />
                      <TextField
                        label="Hedef Tarih"
                        type="date"
                        fullWidth
                        size="small"
                        value={action.target_date}
                        onChange={(e) => handleActionFieldChange(actionIndex, 'target_date', e.target.value)}
                        InputLabelProps={{ shrink: true }}
                        required
                      />
                      <FormControl fullWidth size="small">
                        <InputLabel>Öncelik</InputLabel>
                        <Select
                          value={action.priority}
                          label="Öncelik"
                          onChange={(e) => handleActionFieldChange(actionIndex, 'priority', e.target.value)}
                        >
                          <MenuItem value="Düşük">Düşük</MenuItem>
                          <MenuItem value="Orta">Orta</MenuItem>
                          <MenuItem value="Yüksek">Yüksek</MenuItem>
                        </Select>
                      </FormControl>
                    </Box>

                    {/* Action Images */}
                    <Box sx={{ mt: 2, gridColumn: '1 / -1' }}>
                      <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600, fontSize: '0.85rem' }}>
                        Aksiyon Görselleri (Max 3)
                      </Typography>
                      <Box sx={{ border: '2px dashed', borderColor: 'divider', borderRadius: 2, p: 1.5 }}>
                        <input
                          accept="image/*"
                          style={{ display: 'none' }}
                          id={`action-image-upload-${currentQuestion?.id}-${actionIndex}`}
                          type="file"
                          multiple
                          onChange={(e) => {
                            if (currentQuestion && e.target.files) {
                              handleActionImageUpload(currentQuestion.id, actionIndex, e.target.files);
                            }
                          }}
                        />
                        <label htmlFor={`action-image-upload-${currentQuestion?.id}-${actionIndex}`}>
                          <Button
                            component="span"
                            variant="outlined"
                            size="small"
                            startIcon={<CloudUpload />}
                            disabled={(actionImages.get(`${currentQuestion?.id || 0}-${actionIndex}`) || []).length >= 3}
                            sx={{ mb: 1 }}
                          >
                            Görsel Yükle
                          </Button>
                        </label>
                        {(actionImages.get(`${currentQuestion?.id || 0}-${actionIndex}`) || []).length > 0 && (
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                            {(actionImages.get(`${currentQuestion?.id || 0}-${actionIndex}`) || []).map((image, idx) => (
                              <Box key={idx} sx={{ position: 'relative', width: 60, height: 60 }}>
                                <img
                                  src={image.startsWith('http') ? image : `${process.env.REACT_APP_API_URL?.replace('/api', '') || `http://${window.location.hostname}:5000`}${image.startsWith('/') ? image : '/' + image}`}
                                  alt={`Aksiyon görseli ${idx + 1}`}
                                  style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover',
                                    borderRadius: 4,
                                    border: '1px solid #e0e0e0',
                                  }}
                                  onError={(e) => {
                                    console.error('Image load error:', image);
                                    (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="60" height="60"%3E%3Crect fill="%23ddd" width="60" height="60"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23999"%3EResim Yüklenemedi%3C/text%3E%3C/svg%3E';
                                  }}
                                />
                                <IconButton
                                  size="small"
                                  onClick={() => currentQuestion && handleRemoveActionImage(currentQuestion.id, actionIndex, idx)}
                                  sx={{
                                    position: 'absolute',
                                    top: -6,
                                    right: -6,
                                    bgcolor: 'error.main',
                                    color: 'white',
                                    width: 20,
                                    height: 20,
                                    '&:hover': { bgcolor: 'error.dark' },
                                  }}
                                >
                                  <Close fontSize="small" />
                                </IconButton>
                              </Box>
                            ))}
                          </Box>
                        )}
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              ))}
              <Button
                variant="outlined"
                size="small"
                onClick={handleAddAction}
                sx={{ mt: 1 }}
              >
                + Aksiyon Ekle
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBack />}
          onClick={handlePrevious}
          disabled={currentQuestionIndex === 0}
        >
          Önceki
        </Button>

        <Button
          variant="contained"
          startIcon={saving ? <CircularProgress size={20} /> : <Save />}
          onClick={handleSave}
          disabled={!currentResponse || saving}
        >
          {saving ? 'Kaydediliyor...' : 'Kaydet'}
        </Button>

        <Button
          variant="outlined"
          endIcon={<ArrowForward />}
          onClick={handleNext}
          disabled={currentQuestionIndex === filteredQuestions.length - 1}
        >
          Sonraki
        </Button>
      </Box>

      {/* Success Snackbar */}
      <Snackbar
        open={saveSuccess}
        autoHideDuration={2000}
        onClose={() => setSaveSuccess(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity="success" onClose={() => setSaveSuccess(false)}>
          Kaydedildi!
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default NewAuditPage;
