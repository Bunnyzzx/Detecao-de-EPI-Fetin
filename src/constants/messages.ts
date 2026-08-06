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
    analyzing: 'Analisando...',
    analyzingHint: 'Identificando os equipamentos de proteção individual.',
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
