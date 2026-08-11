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
    startHint: 'Toque no botão e a verificação começa automaticamente',
    simulationNotice:
      'Modo simulado: os resultados são gerados localmente até que a integração com o dispositivo de detecção seja configurada.',
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
    capturing: 'Capturando...',
    permissionTitle: 'Precisamos da sua câmera',
    permissionDescription:
      'A câmera é usada apenas durante a verificação dos equipamentos de proteção individual. Nenhuma imagem sai do aparelho enquanto o modo simulado estiver ativo.',
    permissionRequestButton: 'Permitir câmera',
    permissionDeniedTitle: 'Permissão de câmera negada',
    permissionDeniedDescription:
      'Autorize o acesso à câmera nas configurações do aparelho para realizar a verificação.',
    openSettingsButton: 'Abrir configurações',
    unavailableTitle: 'Câmera indisponível',
    unavailableDescription:
      'Este dispositivo não possui uma câmera compatível para realizar a verificação.',
    captureErrorTitle: 'Não foi possível capturar',
    captureErrorDescription: 'Tente novamente mantendo o aparelho estável.',
  },

  scan: {
    title: 'Verificação em andamento',
    analyzing: 'Analisando...',
    analyzingHint: 'Identificando os equipamentos de proteção individual.',
    opening: 'Iniciando verificação...',
    openingHint: 'Aguarde um instante.',
    faceScanning: 'Reconhecendo usuário...',
    faceScanningHint: 'Olhe para a câmera e permaneça parado.',
    epiDetecting: 'Verificando equipamentos...',
    checklistTitle: 'Equipamentos',
    waiting: 'Aguardando',
    detected: 'Detectado',
    notDetected: 'Não detectado',
    cancelledTitle: 'Verificação interrompida',
    cancelledDescription: 'A verificação foi cancelada antes de terminar.',
    errorTitle: 'Falha na verificação',
    errorDescription: 'Não foi possível concluir a verificação. Tente novamente.',
    retryButton: 'Tentar novamente',
  },

  face: {
    unknownTitle: 'Usuário não reconhecido',
    unknownDescription: 'Nenhum cadastro correspondeu ao rosto capturado.',
    registrationLabel: 'Matrícula',
    confidenceLabel: 'Confiança',
    recognizedTitle: 'Usuário identificado',
  },

  result: {
    approvedTitle: 'Acesso liberado',
    approvedSubtitle: 'Todos os equipamentos de proteção individual foram verificados.',
    rejectedTitle: 'Acesso negado',
    rejectedReasonPrefix: 'Equipamentos não identificados:',
    rejectedNoDetection: 'Nenhum equipamento de proteção individual foi identificado.',
    approvedHeadline: 'Acesso Liberado',
    warningHeadline: 'Atenção',
    rejectedHeadline: 'Acesso Negado',
    approvedCardTitle: 'Todos os EPIs confirmados',
    warningCardTitle: 'Verificação parcial',
    rejectedCardTitle: 'EPIs obrigatórios ausentes',
    warningSubtitle:
      'A verificação identificou pendências ou baixa confiança. Confira os itens antes de liberar o acesso.',
    verifiedSuffix: 'equipamentos verificados',
    confidenceLabel: 'Confiança',
    accessValidBadge: 'Acesso válido',
    accessInvalidBadge: 'Acesso bloqueado',
    accessReviewBadge: 'Revisar antes de liberar',
    backHomeButton: 'Voltar ao início',
    missingResultTitle: 'Resultado indisponível',
    missingResultDescription: 'Nenhuma verificação em andamento. Inicie uma nova.',
  },

  notFound: {
    title: 'Tela não encontrada',
    description: 'Esta rota não faz parte do terminal de verificação.',
  },

  counts: {
    detectedCountLabel: 'detectados',
    detectedCountLabelSingular: 'detectado',
    missingCountLabel: 'ausentes',
    missingCountLabelSingular: 'ausente',
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
