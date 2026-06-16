import { Router } from 'express';
import multer from 'multer';
import {
  ALLOWED_UPLOAD_TYPES,
  MAX_UPLOAD_BYTES,
  mediaTypeFromContentType,
  type UploadPurpose,
} from '../config/uploads.js';
import { optionalAuth } from '../middleware/auth.js';
import {
  purposeAllowsUnauthenticated,
  resolveUploadOwner,
} from '../services/creatorProfile.js';
import {
  buildObjectKey,
  createPresignedUploadUrl,
  uploadBufferToS3,
} from '../services/s3.js';

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_UPLOAD_BYTES, files: 1 },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_UPLOAD_TYPES.has(file.mimetype)) {
      cb(new Error('Unsupported file type. Upload JPG, PNG, WEBP, MP4, MOV, or WEBM.'));
      return;
    }
    cb(null, true);
  },
});

function parsePurpose(value: unknown): UploadPurpose | null {
  if (value === 'profile-picture' || value === 'portfolio') return value;
  return null;
}

router.post('/presign', optionalAuth, async (req, res) => {
  try {
    const { filename, contentType, purpose, uploadSessionId } = req.body as {
      filename?: string;
      contentType?: string;
      purpose?: UploadPurpose;
      uploadSessionId?: string;
    };

    const parsedPurpose = parsePurpose(purpose);
    if (!parsedPurpose || !filename?.trim() || !contentType?.trim()) {
      return res.status(400).json({ error: 'filename, contentType, and purpose are required' });
    }
    if (!ALLOWED_UPLOAD_TYPES.has(contentType)) {
      return res.status(400).json({ error: 'Unsupported file type' });
    }

    const owner = resolveUploadOwner(req, uploadSessionId);
    if (!owner) {
      return res.status(400).json({ error: 'Login required or provide uploadSessionId' });
    }
    if (!req.user && !purposeAllowsUnauthenticated(parsedPurpose)) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const key = buildObjectKey(parsedPurpose, filename.trim(), owner);
    const mediaType = mediaTypeFromContentType(contentType);
    if (!mediaType) return res.status(400).json({ error: 'Unsupported file type' });

    const result = await createPresignedUploadUrl(key, contentType);
    return res.json({
      ...result,
      type: mediaType,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message ?? 'Presign failed' });
  }
});

router.post('/file', optionalAuth, (req, res) => {
  upload.single('file')(req, res, async (err) => {
    if (err) {
      const message = err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE'
        ? `File too large. Maximum size is ${Math.round(MAX_UPLOAD_BYTES / (1024 * 1024))}MB.`
        : err.message ?? 'Upload failed';
      return res.status(400).json({ error: message });
    }

    try {
      if (!req.file) return res.status(400).json({ error: 'file is required' });

      const parsedPurpose = parsePurpose(req.body?.purpose);
      const uploadSessionId = req.body?.uploadSessionId as string | undefined;
      if (!parsedPurpose) return res.status(400).json({ error: 'purpose is required' });

      const owner = resolveUploadOwner(req, uploadSessionId);
      if (!owner) {
        return res.status(400).json({ error: 'Login required or provide uploadSessionId' });
      }
      if (!req.user && !purposeAllowsUnauthenticated(parsedPurpose)) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const mediaType = mediaTypeFromContentType(req.file.mimetype);
      if (!mediaType) return res.status(400).json({ error: 'Unsupported file type' });

      const key = buildObjectKey(parsedPurpose, req.file.originalname, owner);
      const url = await uploadBufferToS3(req.file.buffer, key, req.file.mimetype);

      return res.json({
        url,
        key,
        type: mediaType,
      });
    } catch (uploadErr: any) {
      return res.status(500).json({ error: uploadErr.message ?? 'Upload failed' });
    }
  });
});

export default router;
