import { Router } from 'express';
import * as emergencyContactController from '../controllers/emergencyContactController';
import { authenticate } from '../middlewares/auth';

// ==========================================
// 📡 LAYER: Interface (Route)
// Purpose: Define emergency contact management endpoints
// ==========================================
const router = Router();

// All routes require authentication
router.use(authenticate);

// Routes nested under elders
router.post('/elders/:elderId/emergency-contacts', emergencyContactController.createEmergencyContact);
router.get('/elders/:elderId/emergency-contacts', emergencyContactController.getEmergencyContacts);

// Direct emergency contact routes
router.put('/emergency-contacts/:id', emergencyContactController.updateEmergencyContact);
router.delete('/emergency-contacts/:id', emergencyContactController.deleteEmergencyContact);

export default router;
