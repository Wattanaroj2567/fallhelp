import { Router } from 'express';
import * as elderController from '../controllers/elderController';
import * as emergencyContactController from '../controllers/emergencyContactController';
import { authenticate } from '../middlewares/auth';

// ==========================================
// 📡 LAYER: Interface (Route)
// Purpose: Define elder management endpoints
// ==========================================
const router = Router();

// All routes require authentication
router.use(authenticate);

router.post('/', elderController.createElder);
router.get('/', elderController.getElders);
router.get('/:id', elderController.getElderById);
router.put('/:id', elderController.updateElder);
router.patch('/:id/deactivate', elderController.deactivateElder);
router.delete('/:id', elderController.deleteElder);

// Member management
router.get('/:id/members', elderController.getElderMembers);
router.post('/:id/members', elderController.inviteMember);
router.delete('/:id/members/:userId', elderController.removeMember);

// Emergency Contacts (Nested under elders)
router.get('/:id/emergency-contacts', emergencyContactController.getEmergencyContacts);
router.post('/:id/emergency-contacts', emergencyContactController.createEmergencyContact);
router.put('/:id/emergency-contacts/reorder', emergencyContactController.reorderEmergencyContacts);

export default router;
