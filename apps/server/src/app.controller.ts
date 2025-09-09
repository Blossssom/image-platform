import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  constructor() {}

  @Get()
  getHello(): string {
    console.log(process.env.APP_TEST);
    return 'hello';
  }
}
