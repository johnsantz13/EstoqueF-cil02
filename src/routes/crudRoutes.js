const express = require('express');
const crudController = require('../controllers/crudController');

function crudRoutes(model) {
  const router = express.Router();
  const controller = crudController(model);

  router.get('/', controller.index);
  router.get('/:id', controller.show);
  router.post('/', controller.store);
  router.put('/:id', controller.update);
  router.patch('/:id', controller.update);
  router.delete('/:id', controller.destroy);

  return router;
}

module.exports = crudRoutes;
