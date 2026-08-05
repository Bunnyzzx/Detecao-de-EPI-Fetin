/**
 * Todos os textos visíveis ao usuário. Centralizados para manter a consistência
 * com o protótipo e facilitar revisão/tradução futura.
 */
export const APP_MESSAGES = {
  system: {
    terminalLabel: 'PPE Verification System · Terminal 04',
    connected: 'Conectado',
    offline: 'Sem conexão',
  },

  home: {
    title: 'Verificação de EPI',
    subtitle:
      'Sistema automatizado de verificação de equipamentos de proteção individual por câmera inteligente.',
    restrictedBadge: 'Área de Acesso Restrito',
    readyTitle: 'Pronto para iniciar?',
    readyDescription:
      'Posicione-se em frente à câmera e toque no botão abaixo. O sistema verificará seus EPIs automaticamente.',
    equipmentCountSuffix: 'equipamentos ativos para verificação',
    equipmentCountSuffixSingular: 'equipamento ativo para verificação',
    startButton: 'Iniciar Verificação',
    galleryButton: 'Escolher da galeria',
    startHint: 'Toque no botão para ativar a câmera de verificação',
    simulationNotice:
      'Modo simulado: os resultados são gerados localmente até que a API de detecção seja configurada.',
    historyButton: 'Histórico de análises',
    noEquipmentTitle: 'Nenhum equipamento ativo',
    noEquipmentDescription:
      'Ative pelo menos um equipamento na área administrativa para iniciar uma verificação.',
  },

  steps: {
    start: 'Início',
    verification: 'Verificação',
    access: 'Acesso',
  },

  camera: {
    title: 'Verificação',
    back: 'Voltar',
    frameHint: 'Posicione-se dentro do quadro e permaneça parado',
    captureLabel: 'Capturar foto',
    flipLabel: 'Alternar câmera',
    galleryLabel: 'Abrir galeria',
    capturing: 'Capturando...',
    permissionTitle: 'Precisamos da sua câmera',
    permissionDescription:
      'A câmera é usada apenas para capturar a foto analisada na verificação dos equipamentos de proteção individual. Nenhuma imagem é enviada para fora do aparelho enquanto o modo simulado estiver ativo.',
    permissionRequestButton: 'Permitir câmera',
    permissionDeniedTitle: 'Permissão de câmera negada',
    permissionDeniedDescription:
      'Autorize o acesso à câmera nas configurações do aparelho para realizar a verificação. Você também pode enviar uma imagem da galeria.',
    openSettingsButton: 'Abrir configurações',
    unavailableTitle: 'Câmera indisponível',
    unavailableDescription:
      'Este dispositivo não possui uma câmera compatível. Use uma imagem da galeria para realizar a análise.',
    captureErrorTitle: 'Não foi possível capturar',
    captureErrorDescription: 'Tente novamente mantendo o aparelho estável.',
  },

  gallery: {
    permissionDeniedTitle: 'Permissão da galeria negada',
    permissionDeniedDescription:
      'Autorize o acesso às suas fotos nas configurações do aparelho para escolher uma imagem.',
    emptySelectionTitle: 'Nenhuma imagem selecionada',
    emptySelectionDescription: 'Escolha uma imagem da galeria ou use a câmera para continuar.',
    errorTitle: 'Não foi possível abrir a galeria',
    errorDescription: 'Tente novamente em alguns instantes.',
  },

  preview: {
    title: 'Pré-visualização',
    description: 'Confira o enquadramento antes de enviar a imagem para análise.',
    analyzeButton: 'Analisar imagem',
    retakeCameraButton: 'Tirar outra foto',
    retakeGalleryButton: 'Escolher outra imagem',
    analyzing: 'Analisando imagem...',
    analyzingHint: 'Identificando os equipamentos de proteção individual.',
    invalidImageTitle: 'Imagem indisponível',
    invalidImageDescription:
      'Não foi possível carregar a imagem selecionada. Capture ou escolha outra imagem.',
    missingImageTitle: 'Nenhuma imagem para analisar',
    missingImageDescription: 'Volte ao início e capture ou selecione uma imagem.',
    analysisErrorTitle: 'Falha na análise',
    analysisErrorDescription: 'Não foi possível concluir a verificação. Tente novamente.',
  },

  result: {
    title: 'Resultado da verificação',
    approvedHeadline: 'Acesso Liberado',
    approvedSubtitle: 'Todos os equipamentos de proteção individual foram verificados com sucesso.',
    approvedCardTitle: 'Todos os EPIs confirmados',
    warningHeadline: 'Atenção',
    warningSubtitle:
      'A verificação identificou pendências ou baixa confiança. Confira os itens abaixo antes de liberar o acesso.',
    warningCardTitle: 'Verificação parcial',
    rejectedHeadline: 'Acesso Negado',
    rejectedSubtitle:
      'Equipamentos obrigatórios não foram identificados. O acesso à área não pode ser liberado.',
    rejectedCardTitle: 'EPIs obrigatórios ausentes',
    verifiedSuffix: 'Equipamentos verificados',
    detectedSectionTitle: 'EPIs detectados',
    missingSectionTitle: 'EPIs ausentes',
    confidenceLabel: 'Nível de confiança',
    accessTimeLabel: 'Horário de acesso',
    accessValidBadge: 'Acesso válido',
    accessInvalidBadge: 'Acesso bloqueado',
    accessReviewBadge: 'Revisar antes de liberar',
    continueButton: 'Continuar para a área',
    newAnalysisButton: 'Nova análise',
    backHomeButton: 'Voltar ao início',
    noDetectionTitle: 'Nenhum equipamento reconhecido',
    noDetectionDescription:
      'A análise não identificou nenhum equipamento na imagem. Refaça a foto com o corpo inteiro enquadrado e boa iluminação.',
    lowConfidenceTitle: 'Confiança baixa',
    lowConfidenceDescription:
      'Os equipamentos foram reconhecidos com baixa confiança. Recomenda-se refazer a análise com melhor iluminação.',
    disclaimer:
      'Este sistema auxilia a inspeção de EPIs, mas não substitui a avaliação de um profissional de segurança do trabalho.',
    missingResultTitle: 'Resultado indisponível',
    missingResultDescription: 'Não encontramos essa análise. Realize uma nova verificação.',
  },

  history: {
    title: 'Histórico',
    subtitle: 'Análises realizadas neste aparelho',
    emptyTitle: 'Nenhuma análise ainda',
    emptyDescription: 'As verificações realizadas aparecerão aqui.',
    clearButton: 'Apagar histórico',
    clearConfirmTitle: 'Apagar histórico?',
    clearConfirmDescription: 'Todas as análises salvas neste aparelho serão removidas.',
    removeConfirmTitle: 'Remover análise?',
    removeConfirmDescription: 'Esta análise será removida do histórico.',
    detectedCountLabel: 'detectados',
    detectedCountLabelSingular: 'detectado',
    missingCountLabel: 'ausentes',
    missingCountLabelSingular: 'ausente',
    errorTitle: 'Não foi possível carregar o histórico',
    errorDescription: 'Tente novamente em alguns instantes.',
  },

  states: {
    loading: 'Carregando...',
    genericErrorTitle: 'Algo deu errado',
    genericErrorDescription: 'Não foi possível concluir a operação. Tente novamente.',
    offlineTitle: 'Sem conexão',
    offlineDescription:
      'A análise por API precisa de internet. Verifique sua conexão e tente novamente.',
    retryButton: 'Tentar novamente',
  },

  common: {
    confirm: 'Confirmar',
    cancel: 'Cancelar',
    close: 'Fechar',
    delete: 'Apagar',
    remove: 'Remover',
    edit: 'Editar',
    back: 'Voltar',
  },
} as const;
