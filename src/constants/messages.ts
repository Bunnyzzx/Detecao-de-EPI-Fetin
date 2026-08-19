/**
 * Todos os textos visíveis ao usuário. Centralizados para manter a consistência
 * com o protótipo e facilitar revisão/tradução futura.
 */
export const APP_MESSAGES = {
  home: {
    title: 'Verificação de EPIs',
    subtitle: 'Identifique-se e verifique seus equipamentos de proteção individual.',
    equipmentCountSuffix: 'equipamentos exigidos',
    equipmentCountSuffixSingular: 'equipamento exigido',
    startButton: 'Iniciar',
    simulationNotice:
      'Modo simulado: os resultados são gerados localmente até que a integração com a detecção real seja configurada.',
    noEquipmentTitle: 'Nenhum equipamento ativo',
    noEquipmentDescription: 'Nenhum equipamento está configurado para verificação neste terminal.',
  },

  steps: {
    start: 'Início',
    identification: 'Identificação',
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
    title: 'Verificação de EPIs',
    analyzing: 'Analisando...',
    epiDetecting: 'Verificando equipamentos...',
    epiDetectingHint: 'Permaneça na posição marcada até o fim da verificação.',
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
    title: 'Identificação Facial',
    instruction: 'Posicione seu rosto dentro da área indicada.',
    startButton: 'Iniciar Reconhecimento',
    scanning: 'Identificando funcionário...',
    scanningHint: 'Mantenha o rosto posicionado e olhe para a câmera.',
    unknownTitle: 'Funcionário não identificado',
    unknownDescription: 'Verifique sua posição e tente novamente.',
    retryButton: 'Tentar Novamente',
    backHomeButton: 'Voltar ao Início',
    errorTitle: 'Falha na identificação',
    errorDescription: 'Não foi possível concluir a identificação. Tente novamente.',
    registrationLabel: 'Matrícula',
    sectorLabel: 'Setor',
    confidenceLabel: 'Confiança',
  },

  preparation: {
    title: 'Funcionário identificado',
    positionInstruction:
      'Dirija-se à posição marcada no chão para realizar a verificação dos equipamentos.',
    positionDetail:
      'Permaneça na posição indicada e certifique-se de que todo o corpo esteja visível para a câmera.',
    startButton: 'Iniciar Verificação de EPI',
    missingEmployeeTitle: 'Nenhum funcionário identificado',
    missingEmployeeDescription: 'Faça a identificação facial antes de verificar os equipamentos.',
  },

  result: {
    approvedTitle: 'ACESSO LIBERADO',
    rejectedTitle: 'ACESSO NEGADO',
    checklistTitle: 'Equipamentos analisados',
    /** Compõe "Verificação reprovada por ausência de N equipamento(s) obrigatório(s)." */
    rejectedReasonPrefix: 'Verificação reprovada por ausência de',
    rejectedReasonSuffixSingular: 'equipamento obrigatório.',
    rejectedReasonSuffix: 'equipamentos obrigatórios.',
    rejectedLowConfidence:
      'Verificação reprovada: os equipamentos não foram reconhecidos com confiança suficiente.',
    retryQuestion: 'Deseja realizar a verificação dos EPIs novamente?',
    retryButton: 'Verificar Novamente',
    exitButton: 'Sair',
    backHomeButton: 'Voltar ao Início',
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
