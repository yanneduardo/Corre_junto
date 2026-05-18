const homeController = {
  index: (req, res) => {
    res.json({
      sistema: 'CorreJunto',
      descricao: 'API do sistema para corredores',
      versao: '1.0.0',
      status: 'online',
    });
  },

  health: (req, res) => {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
    });
  },
};

module.exports = homeController;
