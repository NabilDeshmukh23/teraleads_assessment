const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patientController');
const protect = require('../middleware/authMiddleware'); 

router.use(protect);

router.get('/insights', patientController.getInsights);
router.get('/list', patientController.listPatients);
router.post('/add', patientController.addPatient);
router.put('/update/:id', patientController.updatePatient);
router.delete('/delete/:id', patientController.deletePatient);

module.exports = router;