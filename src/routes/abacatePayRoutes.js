const express = require('express');
const controller = require('../controllers/abacatePayController');

const router = express.Router();

router.post('/pix', controller.createPix);
router.get('/pix', controller.listPix);
router.get('/pix/:id', controller.checkPix);
router.post('/pix/:id/simular', controller.simulatePix);

router.post('/checkouts', controller.createCheckout);
router.get('/checkouts', controller.listCheckouts);
router.get('/checkouts/:id', controller.getCheckout);

router.post('/clientes', controller.createCustomer);
router.get('/clientes', controller.listCustomers);
router.get('/clientes/:id', controller.getCustomer);
router.post('/clientes/:id/remover', controller.deleteCustomer);

router.post('/produtos', controller.createProduct);
router.get('/produtos', controller.listProducts);
router.get('/produtos/:id', controller.getProduct);
router.post('/produtos/:id/remover', controller.deleteProduct);

router.get('/loja', controller.getStore);

module.exports = router;
