import express from 'express';
import Admin from './Admin';

const router = express.Router();

router.use('/admin', Admin);

export default router;
