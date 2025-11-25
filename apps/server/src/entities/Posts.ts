import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from "typeorm";
import { Images } from "./Images";
import { Users } from "./Users";
import { ApiProperty } from "@nestjs/swagger";

@Index("PK_posts", ["id"], { unique: true })
@Index("IDX_posts_user_id", ["userId"], {})
@Entity("posts", { schema: "public" })
export class Posts {
  @ApiProperty()
  @Column("uuid", {
    primary: true,
    name: "id",
    default: () => "uuid_generate_v4()",
  })
  id: string;

  @ApiProperty()
  @Column("character varying", { name: "title" })
  title: string;

  @ApiProperty({ nullable: true })
  @Column("text", { name: "description", nullable: true })
  description: string | null;

  @ApiProperty()
  @Column("integer", { name: "view_count", default: () => "0" })
  viewCount: number;

  @ApiProperty()
  @Column("uuid", { name: "user_id" })
  userId: string;

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

  @ApiProperty({ type: () => [Images] })
  @OneToMany(() => Images, (images) => images.post)
  images: Images[];

  @ApiProperty({ type: () => Users })
  @ManyToOne(() => Users, (users) => users.posts)
  @JoinColumn([{ name: "user_id", referencedColumnName: "id" }])
  user: Users;
}
