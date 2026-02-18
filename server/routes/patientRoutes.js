const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patientController');
const authMiddleware = require('../middleware/authMiddleware');


router.use(authMiddleware);

// 1. GET list of patients
router.get('/list', authMiddleware, patientController.listPatients);

// 2. CREATE a new patient
router.post('/add', authMiddleware, patientController.addPatient);

// 3. UPDATE an existing patient
router.put('/update/:id', authMiddleware, patientController.updatePatient);

// 4. DELETE a patient
router.delete('/delete/:id',authMiddleware, patientController.deletePatient);

module.exports = router;