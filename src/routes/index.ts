import express from 'express';
import agentRoutes from './agentRoutes';
import userRoutes from './userRoutes';
import messageRoutes from './messageRoutes';
import stateGraphRoutes from './stateGraphRoutes';

const router = express.Router();

// Register all routes with their respective prefixes
router.use('/agent', agentRoutes);
router.use('/user', userRoutes);
// router.use('/checkpointer', checkpointRoutes);
router.use('/state-graph', stateGraphRoutes);
router.use('/messages', messageRoutes);
export default router;
