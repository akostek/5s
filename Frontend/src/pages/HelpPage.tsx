import React, { useState } from 'react';
import {
  Typography,
  Box,
  Card,
  CardContent,
  Container,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Avatar,
  Divider,
  Alert,
  Button,
} from '@mui/material';
import {
  ExpandMore,
  Assignment,
  Assessment,
  Settings,
  People,
  Business,
  Help,
  CheckCircle,
  Star,
  TrendingUp,
  Lightbulb,
  School,
  ContactSupport,
  Email,
  Phone,
} from '@mui/icons-material';

const HelpPage: React.FC = () => {
  const [expandedPanel, setExpandedPanel] = useState<string | false>('5s-methodology');

  const handleChange = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpandedPanel(isExpanded ? panel : false);
  };

  const fiveSSteps = [
    {
      name: '1S - Seiri (Ayırt Etme)',
      description: 'Gereksiz eşyaları ayırt etme ve kaldırma',
      details: [
        'Çalışma alanında sadece gerekli eşyaları tutun',
        'Gereksiz malzemeleri belirleyin ve kaldırın',
        'Kullanılmayan araç gereçleri depolayın',
        'Düzenli olarak gözden geçirin',
      ],
      color: '#e3f2fd',
      icon: '🔍'
    },
    {
      name: '2S - Seiton (Düzenleme)',
      description: 'Her şey için bir yer, her yer için bir şey',
      details: [
        'Her eşya için belirli bir yer tanımlayın',
        'Etiketleme sistemi oluşturun',
        'Kolay erişilebilir yerler seçin',
        'Görsel işaretlemeler kullanın',
      ],
      color: '#e8f5e8',
      icon: '📋'
    },
    {
      name: '3S - Seiso (Temizlik)',
      description: 'Temizlik ve bakım standartları',
      details: [
        'Çalışma alanını düzenli temizleyin',
        'Ekipmanları bakımda tutun',
        'Temizlik programları oluşturun',
        'Kirlilik kaynaklarını belirleyin',
      ],
      color: '#fff3e0',
      icon: '🧹'
    },
    {
      name: '4S - Seiketsu (Standartlaştırma)',
      description: 'İlk 3S için standartlar oluşturma',
      details: [
        'Standart işlem prosedürleri yazın',
        'Görsel kontroller oluşturun',
        'Sorumlulukları tanımlayın',
        'Düzenli denetimler yapın',
      ],
      color: '#f3e5f5',
      icon: '📊'
    },
    {
      name: '5S - Shitsuke (Sürdürme)',
      description: 'Disiplin ve sürekli iyileştirme',
      details: [
        'Eğitim programları düzenleyin',
        'Düzenli denetimler yapın',
        'Geri bildirim sistemleri kurun',
        'Sürekli iyileştirme kültürü oluşturun',
      ],
      color: '#fce4ec',
      icon: '🎯'
    },
  ];

  const systemFeatures = [
    {
      title: 'Denetim Yönetimi',
      icon: <Assignment color="primary" />,
      description: 'Kapsamlı denetim oluşturma ve yönetimi',
      features: [
        'Yeni denetim oluşturma',
        'Soru cevaplama sistemi',
        'Otomatik aksiyon planı',
        'Görsel belgeleme',
      ]
    },
    {
      title: 'Raporlama',
      icon: <Assessment color="success" />,
      description: 'Detaylı analiz ve raporlama',
      features: [
        'Performans analizi',
        'Bölüm karşılaştırması',
        '5S kırılım raporları',
        'Excel export',
      ]
    },
    {
      title: 'Kullanıcı Yönetimi',
      icon: <People color="info" />,
      description: 'Rol tabanlı erişim kontrolü',
      features: [
        'Admin, Denetçi, Bölüm Sorumlusu rolleri',
        'Yetki yönetimi',
        'Kullanıcı profilleri',
        'Aktivite takibi',
      ]
    },
    {
      title: 'Ayarlar',
      icon: <Settings color="warning" />,
      description: 'Sistem konfigürasyonu',
      features: [
        'Soru yönetimi',
        'Puan sistemi ayarları',
        'Bildirim ayarları',
        'Genel sistem ayarları',
      ]
    },
  ];

  const faqs = [
    {
      question: 'Yeni denetim nasıl oluşturulur?',
      answer: 'Sol menüden "Yeni Denetim" seçeneğine tıklayın. Bölüm, denetim alanı ve denetleyen bilgilerini girin. Ardından soruları yanıtlayarak denetimi tamamlayın.'
    },
    {
      question: 'Aksiyon planı nasıl çalışır?',
      answer: 'Sorulara "Düşük" veya "Orta" cevabı verdiğinizde otomatik olarak aksiyon formu açılır. Bu formda uygunsuzluk, önerilen faaliyet ve sorumlu kişi bilgilerini girebilirsiniz.'
    },
    {
      question: 'Raporları nasıl görüntüleyebilirim?',
      answer: 'Sol menüden "Raporlar" seçeneğine tıklayın. Burada bölüm bazlı performans, 5S kırılımları ve detaylı analizleri görüntüleyebilirsiniz.'
    },
    {
      question: 'Kullanıcı rolleri nelerdir?',
      answer: 'Admin: Tüm yetkiler, Denetçi: Denetim yapabilir, Bölüm Sorumlusu: Kendi bölümünü görüntüleyebilir ve raporları inceleyebilir.'
    },
    {
      question: 'Denetim sonuçları nasıl değerlendirilir?',
      answer: 'Her soru için Yüksek (5 puan), Orta (3 puan), Düşük (1 puan) verilir. Toplam puan yüzdesine göre 5S seviyesi belirlenir.'
    }
  ];

  return (
    <Container maxWidth="xl" sx={{ py: 0, px: 0.5 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
            <Help />
          </Avatar>
          <Typography variant="h4" component="h1" sx={{ fontSize: '1.5rem', fontWeight: 700 }}>
            Yardım ve Destek
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
          5S Denetim Platformu kullanım kılavuzu ve sistem bilgileri
        </Typography>
      </Box>

      {/* Quick Links */}
      <Alert severity="info" sx={{ mb: 3, fontSize: '0.8rem' }}>
        <Typography variant="body2" sx={{ fontSize: '0.8rem', fontWeight: 600, mb: 1 }}>
          Hızlı Erişim
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Button size="small" variant="outlined" href="/audits/new" sx={{ fontSize: '0.7rem' }}>
            Yeni Denetim
          </Button>
          <Button size="small" variant="outlined" href="/reports" sx={{ fontSize: '0.7rem' }}>
            Raporlar
          </Button>
          <Button size="small" variant="outlined" href="/audits" sx={{ fontSize: '0.7rem' }}>
            Denetim Geçmişi
          </Button>
        </Box>
      </Alert>

      {/* 5S Methodology */}
      <Accordion 
        expanded={expandedPanel === '5s-methodology'} 
        onChange={handleChange('5s-methodology')}
        sx={{ mb: 2 }}
      >
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Star sx={{ mr: 1, color: 'warning.main' }} />
            <Typography sx={{ fontSize: '1rem', fontWeight: 600 }}>
              5S Metodolojisi
            </Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Typography variant="body2" sx={{ mb: 2, fontSize: '0.85rem' }}>
            5S, iş yerinde düzen, temizlik ve verimliliği artırmak için kullanılan Japon kökenli bir yönetim tekniğidir.
          </Typography>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {fiveSSteps.map((step, index) => (
              <Card key={index} sx={{ bgcolor: step.color, border: '1px solid', borderColor: 'grey.200' }}>
                <CardContent sx={{ p: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Typography sx={{ fontSize: '1.5rem', mr: 1 }}>{step.icon}</Typography>
                    <Typography variant="h6" sx={{ fontSize: '0.9rem', fontWeight: 600 }}>
                      {step.name}
                    </Typography>
                  </Box>
                  <Typography variant="body2" sx={{ fontSize: '0.8rem', mb: 1, fontStyle: 'italic' }}>
                    {step.description}
                  </Typography>
                  <List dense>
                    {step.details.map((detail, idx) => (
                      <ListItem key={idx} sx={{ py: 0.25, px: 0 }}>
                        <ListItemIcon sx={{ minWidth: 20 }}>
                          <CheckCircle sx={{ fontSize: 14, color: 'success.main' }} />
                        </ListItemIcon>
                        <ListItemText 
                          primary={detail} 
                          primaryTypographyProps={{ fontSize: '0.75rem' }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            ))}
          </Box>
        </AccordionDetails>
      </Accordion>

      {/* System Features */}
      <Accordion 
        expanded={expandedPanel === 'system-features'} 
        onChange={handleChange('system-features')}
        sx={{ mb: 2 }}
      >
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Lightbulb sx={{ mr: 1, color: 'info.main' }} />
            <Typography sx={{ fontSize: '1rem', fontWeight: 600 }}>
              Sistem Özellikleri
            </Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            {systemFeatures.map((feature, index) => (
              <Card key={index} sx={{ flex: '1 1 300px', minWidth: 250 }}>
                <CardContent sx={{ p: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    {feature.icon}
                    <Typography variant="h6" sx={{ fontSize: '0.9rem', fontWeight: 600, ml: 1 }}>
                      {feature.title}
                    </Typography>
                  </Box>
                  <Typography variant="body2" sx={{ fontSize: '0.8rem', mb: 1, color: 'text.secondary' }}>
                    {feature.description}
                  </Typography>
                  <List dense>
                    {feature.features.map((item, idx) => (
                      <ListItem key={idx} sx={{ py: 0.25, px: 0 }}>
                        <ListItemIcon sx={{ minWidth: 20 }}>
                          <CheckCircle sx={{ fontSize: 12, color: 'primary.main' }} />
                        </ListItemIcon>
                        <ListItemText 
                          primary={item} 
                          primaryTypographyProps={{ fontSize: '0.75rem' }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            ))}
          </Box>
        </AccordionDetails>
      </Accordion>

      {/* FAQ */}
      <Accordion 
        expanded={expandedPanel === 'faq'} 
        onChange={handleChange('faq')}
        sx={{ mb: 2 }}
      >
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <ContactSupport sx={{ mr: 1, color: 'success.main' }} />
            <Typography sx={{ fontSize: '1rem', fontWeight: 600 }}>
              Sık Sorulan Sorular
            </Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {faqs.map((faq, index) => (
              <Card key={index} variant="outlined">
                <CardContent sx={{ p: 2 }}>
                  <Typography variant="subtitle2" sx={{ fontSize: '0.85rem', fontWeight: 600, mb: 1 }}>
                    {faq.question}
                  </Typography>
                  <Typography variant="body2" sx={{ fontSize: '0.8rem', color: 'text.secondary' }}>
                    {faq.answer}
                  </Typography>
                </CardContent>
              </Card>
            ))}
          </Box>
        </AccordionDetails>
      </Accordion>

      {/* Getting Started */}
      <Accordion 
        expanded={expandedPanel === 'getting-started'} 
        onChange={handleChange('getting-started')}
        sx={{ mb: 2 }}
      >
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <School sx={{ mr: 1, color: 'warning.main' }} />
            <Typography sx={{ fontSize: '1rem', fontWeight: 600 }}>
              Başlangıç Kılavuzu
            </Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Card sx={{ bgcolor: 'primary.light', color: 'white' }}>
              <CardContent sx={{ p: 2 }}>
                <Typography variant="h6" sx={{ fontSize: '0.9rem', fontWeight: 600, mb: 1 }}>
                  1. İlk Denetim Oluşturma
                </Typography>
                <List dense>
                  <ListItem sx={{ py: 0.25, px: 0 }}>
                    <ListItemText 
                      primary="Sol menüden 'Yeni Denetim' seçeneğine tıklayın"
                      primaryTypographyProps={{ fontSize: '0.75rem', color: 'inherit' }}
                    />
                  </ListItem>
                  <ListItem sx={{ py: 0.25, px: 0 }}>
                    <ListItemText 
                      primary="Bölüm, alan, denetleyen ve sorumlu bilgilerini doldurun"
                      primaryTypographyProps={{ fontSize: '0.75rem', color: 'inherit' }}
                    />
                  </ListItem>
                  <ListItem sx={{ py: 0.25, px: 0 }}>
                    <ListItemText 
                      primary="Her soruyu Yüksek, Orta veya Düşük olarak değerlendirin"
                      primaryTypographyProps={{ fontSize: '0.75rem', color: 'inherit' }}
                    />
                  </ListItem>
                  <ListItem sx={{ py: 0.25, px: 0 }}>
                    <ListItemText 
                      primary="Düşük/Orta skorlar için otomatik açılan aksiyon formunu doldurun"
                      primaryTypographyProps={{ fontSize: '0.75rem', color: 'inherit' }}
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>

            <Card sx={{ bgcolor: 'success.light', color: 'white' }}>
              <CardContent sx={{ p: 2 }}>
                <Typography variant="h6" sx={{ fontSize: '0.9rem', fontWeight: 600, mb: 1 }}>
                  2. Raporları İnceleme
                </Typography>
                <List dense>
                  <ListItem sx={{ py: 0.25, px: 0 }}>
                    <ListItemText 
                      primary="Raporlar sayfasından genel istatistikleri görüntüleyin"
                      primaryTypographyProps={{ fontSize: '0.75rem', color: 'inherit' }}
                    />
                  </ListItem>
                  <ListItem sx={{ py: 0.25, px: 0 }}>
                    <ListItemText 
                      primary="Bölüm bazlı 5S kırılım tablosunu inceleyin"
                      primaryTypographyProps={{ fontSize: '0.75rem', color: 'inherit' }}
                    />
                  </ListItem>
                  <ListItem sx={{ py: 0.25, px: 0 }}>
                    <ListItemText 
                      primary="Filtreleme seçeneklerini kullanarak detaylı analiz yapın"
                      primaryTypographyProps={{ fontSize: '0.75rem', color: 'inherit' }}
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>

            <Card sx={{ bgcolor: 'warning.light', color: 'white' }}>
              <CardContent sx={{ p: 2 }}>
                <Typography variant="h6" sx={{ fontSize: '0.9rem', fontWeight: 600, mb: 1 }}>
                  3. Aksiyon Takibi
                </Typography>
                <List dense>
                  <ListItem sx={{ py: 0.25, px: 0 }}>
                    <ListItemText 
                      primary="Denetimler sayfasından aksiyon adetine tıklayın"
                      primaryTypographyProps={{ fontSize: '0.75rem', color: 'inherit' }}
                    />
                  </ListItem>
                  <ListItem sx={{ py: 0.25, px: 0 }}>
                    <ListItemText 
                      primary="Aksiyonları düzenleyin veya tamamlandı olarak işaretleyin"
                      primaryTypographyProps={{ fontSize: '0.75rem', color: 'inherit' }}
                    />
                  </ListItem>
                  <ListItem sx={{ py: 0.25, px: 0 }}>
                    <ListItemText 
                      primary="Hedef tarihleri revize edin"
                      primaryTypographyProps={{ fontSize: '0.75rem', color: 'inherit' }}
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Box>
        </AccordionDetails>
      </Accordion>

      {/* Contact */}
      <Card sx={{ mt: 3, bgcolor: 'grey.50' }}>
        <CardContent sx={{ p: 2 }}>
          <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 600, mb: 2 }}>
            İletişim ve Destek
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Email sx={{ mr: 1, color: 'primary.main', fontSize: 20 }} />
              <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>
                akostek@gmail.com
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Phone sx={{ mr: 1, color: 'success.main', fontSize: 20 }} />
              <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>
                +90 (545) 999 99 99
              </Typography>
            </Box>
          </Box>
          <Divider sx={{ my: 2 }} />
          <Typography variant="caption" sx={{ fontSize: '0.7rem', color: 'text.secondary' }}>
            5S Denetim Platformu v1.0 - Tüm hakları saklıdır.
          </Typography>
        </CardContent>
      </Card>
    </Container>
  );
};

export default HelpPage;
