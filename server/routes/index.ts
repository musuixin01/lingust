import { Router } from 'express';
import translateRouter from './translateRoute';
import ocrRouter from './ocrRoute';
import testConnectionRouter from './testConnectionRoute';

const router = Router();

router.use(translateRouter);
router.use(ocrRouter);
router.use(testConnectionRouter);

export default router;
