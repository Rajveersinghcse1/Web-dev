import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { prisma } from '../utils/database';
import { asyncHandler, createError } from '../middleware/errorHandler';
import { authenticateToken } from '../middleware/auth';
import { logger } from '../utils/logger';
import { 
  voiceValidation, 
  validateRequest, 
  customValidators, 
  fileValidation 
} from '../utils/validation';

const router = Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/voice-samples');
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: fileValidation.audioFile.maxSize,
  },
  fileFilter: (req, file, cb) => {
    if (fileValidation.audioFile.allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid audio file format. Allowed formats: MP3, WAV, FLAC, AAC, OGG'));
    }
  }
});

// Upload voice sample for cloning
router.post('/upload', 
  authenticateToken, 
  upload.single('audio'), 
  voiceValidation.uploadAudio,
  validateRequest,
  asyncHandler(async (req: Request, res: Response) => {
  // Validate uploaded file
  customValidators.isValidAudioFile(req.file);

  const audioFileUrl = `/uploads/voice-samples/${req.file!.filename}`;

  res.json({
    success: true,
    message: 'Audio file uploaded successfully',
    data: {
      audioFileUrl,
      filename: req.file!.filename,
      size: req.file!.size,
    }
  });
}));

// Create voice clone job
router.post('/clone', 
  authenticateToken, 
  voiceValidation.createModel,
  validateRequest,
  asyncHandler(async (req: Request, res: Response) => {

  const userId = (req as any).user.userId;
  const { modelName, audioFileUrl, language, gender, description, tags, isPublic } = req.body;

  // Create voice clone job
  const cloneJob = await prisma.voiceCloneJob.create({
    data: {
      userId,
      modelName,
      audioFileUrl,
      language,
      gender,
      description: description || '',
      tags: tags || [],
      isPublic: isPublic || false,
      status: 'PENDING',
    }
  });

  // Here you would typically start the voice cloning process
  // For now, we'll simulate it with a simple response
  
  logger.info(`Voice clone job created: ${cloneJob.id} for user: ${userId}`);

  res.status(201).json({
    success: true,
    message: 'Voice clone job created successfully',
    data: cloneJob
  });
}));

// Get user's voice models
router.get('/models', authenticateToken, asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user.userId;

  const models = await prisma.voiceModel.findMany({
    where: { ownerId: userId },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      description: true,
      language: true,
      gender: true,
      isPublic: true,
      quality: true,
      sampleAudioUrl: true,
      tags: true,
      createdAt: true,
    }
  });

  res.json({
    success: true,
    data: models
  });
}));

// Get specific voice model
router.get('/models/:id', authenticateToken, asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = (req as any).user.userId;

  if (!id) {
    throw createError('Model ID is required', 400);
  }

  const model = await prisma.voiceModel.findFirst({
    where: {
      id,
      OR: [
        { ownerId: userId },
        { isPublic: true }
      ]
    },
    select: {
      id: true,
      name: true,
      description: true,
      language: true,
      gender: true,
      isPublic: true,
      quality: true,
      sampleAudioUrl: true,
      tags: true,
      createdAt: true,
      owner: {
        select: {
          name: true,
        }
      }
    }
  });

  if (!model) {
    throw createError('Voice model not found', 404);
  }

  res.json({
    success: true,
    data: model
  });
}));

// Delete voice model
router.delete('/models/:id', authenticateToken, asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = (req as any).user.userId;

  if (!id) {
    throw createError('Model ID is required', 400);
  }

  const model = await prisma.voiceModel.findFirst({
    where: {
      id,
      ownerId: userId
    }
  });

  if (!model) {
    throw createError('Voice model not found or unauthorized', 404);
  }

  await prisma.voiceModel.delete({
    where: { id: id! }
  });

  logger.info(`Voice model deleted: ${id} by user: ${userId}`);

  res.json({
    success: true,
    message: 'Voice model deleted successfully'
  });
}));

// Synthesize speech with voice model
router.post('/synthesize', 
  authenticateToken, 
  voiceValidation.synthesize,
  validateRequest,
  asyncHandler(async (req: Request, res: Response) => {

  const userId = (req as any).user.userId;
  const { voiceModelId, text, language, emotionMode, speed, pitch } = req.body;

  // Check if user has access to the voice model
  const model = await prisma.voiceModel.findFirst({
    where: {
      id: voiceModelId,
      OR: [
        { ownerId: userId },
        { isPublic: true }
      ]
    }
  });

  if (!model) {
    throw createError('Voice model not found or unauthorized', 404);
  }

  // Create synthesis task
  const synthesisTask = await prisma.synthesisTask.create({
    data: {
      voiceModelId,
      text,
      language: language || model.language,
      emotionMode: emotionMode || 'NEUTRAL',
      speed: speed || 1.0,
      pitch: pitch || 1.0,
      status: 'PENDING',
    }
  });

  // Here you would typically start the speech synthesis process
  // For now, we'll simulate it
  
  logger.info(`Speech synthesis task created: ${synthesisTask.id}`);

  res.status(201).json({
    success: true,
    message: 'Speech synthesis task created successfully',
    data: synthesisTask
  });
}));

// Get synthesis job status
router.get('/synthesis/:id', authenticateToken, asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id) {
    throw createError('Task ID is required', 400);
  }

  const task = await prisma.synthesisTask.findUnique({
    where: { id: id! },
    include: {
      voiceModel: {
        select: {
          name: true,
          ownerId: true,
        }
      }
    }
  });

  if (!task) {
    throw createError('Synthesis task not found', 404);
  }

  res.json({
    success: true,
    data: task
  });
}));

export default router;