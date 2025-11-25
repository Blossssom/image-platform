import { Column, Entity, Index, OneToMany } from "typeorm";
import { Comments } from "./Comments";
import { ImageLikes } from "./ImageLikes";
import { Posts } from "./Posts";
import { SocialAccounts } from "./SocialAccounts";
import { ApiProperty } from "@nestjs/swagger";

@Index("UQ_users_email", ["email"], { unique: true })
@Index("PK_users", ["id"], { unique: true })
@Entity("users", { schema: "public" })
export class Users {
  @ApiProperty()
  @Column("uuid", {
    primary: true,
    name: "id",
    default: () => "uuid_generate_v4()",
  })
  id: string;

  @ApiProperty()
  @Column("character varying", { name: "email", unique: true })
  email: string;

  @ApiProperty({ nullable: true })
  @Column("character varying", { name: "nickname", nullable: true })
  nickname: string | null;

  @ApiProperty({ nullable: true })
  @Column("character varying", { name: "avatar_url", nullable: true })
  avatarUrl: string | null;

  @ApiProperty({ enum: ["USER", "ADMIN", "MODERATOR"] })
  @Column("enum", {
    name: "role",
    enum: ["USER", "ADMIN", "MODERATOR"],
    default: () => "'USER'",
  })
  role: "USER" | "ADMIN" | "MODERATOR";

  @ApiProperty({ enum: ["SHOW", "BLUR", "HIDE"] })
  @Column("enum", {
    name: "nsfw_filter",
    enum: ["SHOW", "BLUR", "HIDE"],
    default: () => "'BLUR'",
  })
  nsfwFilter: "SHOW" | "BLUR" | "HIDE";

  @ApiProperty()
  @Column("timestamp with time zone", {
    name: "created_at",
    default: () => "now()",
  })
  createdAt: Date;

  @ApiProperty()
  @Column("timestamp with time zone", {
    name: "updated_at",
    default: () => "now()",
  })
  updatedAt: Date;

  @ApiProperty({ nullable: true })
  @Column("timestamp with time zone", { name: "deleted_at", nullable: true })
  deletedAt: Date | null;

  @ApiProperty({ type: () => [Comments] })
  @OneToMany(() => Comments, (comments) => comments.user)
  comments: Comments[];

  @ApiProperty({ type: () => [ImageLikes] })
  @OneToMany(() => ImageLikes, (imageLikes) => imageLikes.user)
  imageLikes: ImageLikes[];

  @ApiProperty({ type: () => [Posts] })
  @OneToMany(() => Posts, (posts) => posts.user)
  posts: Posts[];

  @ApiProperty({ type: () => [SocialAccounts] })
  @OneToMany(() => SocialAccounts, (socialAccounts) => socialAccounts.user)
  socialAccounts: SocialAccounts[];
}
