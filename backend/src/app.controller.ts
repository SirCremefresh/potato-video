import {Controller, Get, Param, Req, Res} from '@nestjs/common';
import {Request, Response} from 'express';
import * as fs from 'fs';
import {AppService} from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {
  }

  @Get('video/:videoId/watch.mp4')
  setFile(@Param('videoId') videoId: string, @Req() req: Request, @Res() res: Response) {
    const filename = `/tmp/videos/${videoId}`;

    const stat = fs.statSync(filename);
    const fileSize = stat.size;
    const range = req.headers.range;

    console.log(`got request with range: ${range}`);

    if (range) {
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1]
        ? parseInt(parts[1], 10)
        : fileSize - 1;

      const chunksize = (end - start) + 1;
      const file = fs.createReadStream(filename, {start, end});
      const head = {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': 'video/mp4',
      };

      res.writeHead(206, head);
      file.pipe(res);
    } else {
      const head = {
        'Content-Length': fileSize,
        'Content-Type': 'video/mp4',
      };
      res.writeHead(200, head);
      fs.createReadStream(filename).pipe(res);
    }
  }
}
