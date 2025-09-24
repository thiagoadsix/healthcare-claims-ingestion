import { Request, Response, NextFunction } from 'express';
import multer from 'multer';

const FILE_SIZE_LIMIT = 10 * 1024 * 1024; // 10MB limit

const validateFileExtension = (mimetype: string): boolean => {
  const allowedMimeTypes = [
    'text/csv',
    'application/csv',
    'text/plain'
  ];
  return allowedMimeTypes.includes(mimetype);
};

const multerFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: CallableFunction
) => {
  const isFileValid = validateFileExtension(file.mimetype);
  if (isFileValid) {
    cb(null, true);
  } else {
    cb(new Error('Only CSV files are allowed'));
  }
};

const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: multerFilter,
  limits: {
    fileSize: FILE_SIZE_LIMIT,
    files: 1
  }
});

const uploadSingle = upload.single('file');

export const fileUploadMiddleware = (req: Request, res: Response, next: NextFunction) => {
  uploadSingle(req, res, (err: unknown) => {
    if (err) {
      console.error('Multer error:', err);
      return res.status(400).json({
        error: 'File upload error',
        message: err instanceof Error ? err.message : 'Invalid file upload'
      });
    }

    next();
  });
};
