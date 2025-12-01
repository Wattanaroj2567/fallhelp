import { Router } from 'express';
import * as elderController from '../controllers/elderController';
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

// Member management
router.get('/:id/members', elderController.getElderMembers);
router.post('/:id/members', elderController.inviteMember);
router.delete('/:id/members/:userId', elderController.removeMember);

export default router;
