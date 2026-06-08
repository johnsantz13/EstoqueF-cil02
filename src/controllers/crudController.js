function crudController(model) {
  return {
    async index(req, res, next) {
      try {
        const items = await model.findAll(req.query);
        res.json(items);
      } catch (error) {
        next(error);
      }
    },

    async show(req, res, next) {
      try {
        const item = await model.findById(req.params.id);
        if (!item) return res.status(404).json({ error: 'Registro nao encontrado.' });
        return res.json(item);
      } catch (error) {
        return next(error);
      }
    },

    async store(req, res, next) {
      try {
        const item = await model.create(req.body);
        res.status(201).json(item);
      } catch (error) {
        next(error);
      }
    },

    async update(req, res, next) {
      try {
        const item = await model.update(req.params.id, req.body);
        if (!item) return res.status(404).json({ error: 'Registro nao encontrado.' });
        return res.json(item);
      } catch (error) {
        return next(error);
      }
    },

    async destroy(req, res, next) {
      try {
        const result = await model.remove(req.params.id);
        res.json(result);
      } catch (error) {
        next(error);
      }
    }
  };
}

module.exports = crudController;
