import { NextResponse } from 'next/server';
import archiver from 'archiver';
import { Readable } from 'stream';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    // Create a transform stream to bundle the files
    const archive = archiver('zip', {
      zlib: { level: 9 }, // Sets the compression level
    });

    // Create a Readable stream from the archive
    const stream = new Readable().wrap(archive);

    // Define the root directory of the project
    const rootDir = process.cwd();

    // Add files and directories to the archive
    // We exclude node_modules, .next, .git, and other build artifacts
    const entries = fs.readdirSync(rootDir);

    for (const entry of entries) {
      const fullPath = path.join(rootDir, entry);
      const stats = fs.statSync(fullPath);

      if (
        entry === 'node_modules' ||
        entry === '.next' ||
        entry === '.git' ||
        entry === '.turbo' ||
        entry === '.vercel' ||
        entry === 'dist' ||
        entry === '.env.local' ||
        entry === '.env'
      ) {
        continue;
      }

      if (stats.isDirectory()) {
        archive.directory(fullPath, entry);
      } else {
        archive.file(fullPath, { name: entry });
      }
    }

    // Finalize the archive (this tells the stream we're done adding files)
    archive.finalize();

    // Return the stream as a response
    return new NextResponse(stream as any, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': 'attachment; filename="source-code.zip"',
      },
    });
  } catch (error: any) {
    console.error('Error creating zip:', error);
    return NextResponse.json({ error: 'Failed to create zip file' }, { status: 500 });
  }
}
