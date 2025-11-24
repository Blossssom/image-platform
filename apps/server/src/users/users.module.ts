import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Users } from '../entities/Users';
import { SocialAccounts } from '../entities/SocialAccounts';

@Module({
  imports: [TypeOrmModule.forFeature([Users, SocialAccounts])],
  controllers: [], // Add controllers later
  providers: [],   // Add services later
  exports: [],     // Export services if needed by other modules
})
export class UsersModule {}
