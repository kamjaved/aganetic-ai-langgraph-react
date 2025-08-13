// import express, { Request, Response } from 'express';
// import { checkpointer } from '../agent';
// import { CheckpointListOptions } from '@langchain/langgraph-checkpoint';

// const router = express.Router();

// router.post('/', async (req: Request, res: Response) => {
//   try {
//     const options: CheckpointListOptions = {
//       limit: 2,
//     };

//     const threadId = req.body.threadId || 'default-chat-thread-124';
//     const config = { configurable: { thread_id: threadId } };

//     // GET
//     const checkpointerGet = await checkpointer.get(config);

//     // LIST
//     const checkpointsList = [];
//     for await (const checkpoint of checkpointer.list(config, options)) {
//       checkpointsList.push({
//         checkpointId: checkpoint?.config?.configurable?.checkpoint_id,
//         timestamp: new Date(checkpoint.checkpoint.ts).toLocaleString(),
//       });
//     }

//     // GET NEXT VERSION
//     const currentVersion = 8;
//     const nextVersion = await checkpointer.getNextVersion(currentVersion);

//     res.send({
//       status: 200,
//       nextVersion: nextVersion,
//       checkpointsList: checkpointsList,
//       checkpointerGet: checkpointerGet,
//     });
//   } catch (error) {
//     res.status(500).json({ error: 'Could not fetch Checkpointer.' });
//   }
// });

// export default router;
