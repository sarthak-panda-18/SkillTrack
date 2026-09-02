import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export class StorageService {
  private baseDir: string;

  constructor() {
    this.baseDir = path.join(process.cwd(), 'uploads', 'evidence');
    if (!fs.existsSync(this.baseDir)) {
      fs.mkdirSync(this.baseDir, { recursive: true });
    }
  }

  getStorageDirectory(userId: string, outcomeId: string): string {
    const dir = path.join(this.baseDir, 'user', userId, 'outcome', outcomeId);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    return dir;
  }

  generateStoredFileName(originalName: string): string {
    const ext = path.extname(originalName).toLowerCase();
    const uniqueId = crypto.randomUUID();
    return `${uniqueId}${ext}`;
  }

  saveFile(userId: string, outcomeId: string, file: Express.Multer.File): { storedFileName: string; storagePath: string } {
    const dir = this.getStorageDirectory(userId, outcomeId);
    const storedFileName = this.generateStoredFileName(file.originalname);
    const storagePath = path.join(dir, storedFileName);

    if (file.path) {
      // If multer diskStorage already created a temp file
      fs.renameSync(file.path, storagePath);
    } else if (file.buffer) {
      // If multer memoryStorage
      fs.writeFileSync(storagePath, file.buffer);
    }

    return { storedFileName, storagePath };
  }

  saveDocumentFile(userId: string, file: Express.Multer.File): { storedFileName: string; storagePath: string; fileUrl: string } {
    const docsDir = path.join(process.cwd(), 'uploads', 'documents', userId);
    if (!fs.existsSync(docsDir)) {
      fs.mkdirSync(docsDir, { recursive: true });
    }
    const storedFileName = this.generateStoredFileName(file.originalname);
    const storagePath = path.join(docsDir, storedFileName);

    if (file.path) {
      fs.renameSync(file.path, storagePath);
    } else if (file.buffer) {
      fs.writeFileSync(storagePath, file.buffer);
    }

    const fileUrl = `/uploads/documents/${userId}/${storedFileName}`;
    return { storedFileName, storagePath, fileUrl };
  }

  deleteFile(storagePath: string): boolean {
    try {
      if (fs.existsSync(storagePath)) {
        fs.unlinkSync(storagePath);
        return true;
      }
    } catch (err) {
      console.warn(`[StorageService] Failed to delete file at ${storagePath}:`, err);
    }
    return false;
  }

  fileExists(storagePath: string): boolean {
    return fs.existsSync(storagePath);
  }
}

export const storageService = new StorageService();
