import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

export enum NaicsLevel {
  SECTOR = 'SECTOR',
  SUBSECTOR = 'SUBSECTOR',
  INDUSTRY_GROUP = 'INDUSTRY_GROUP',
  NAICS_INDUSTRY = 'NAICS_INDUSTRY',
  NATIONAL_INDUSTRY = 'NATIONAL_INDUSTRY',
}

@Entity('naics_codes')
@Unique(['code', 'versionYear'])
@Index(['parentId'])
@Index(['level'])
@Index(['versionYear'])
@Index(['isActive'])
export class NaicsCode {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 6 })
  code: string;

  @Column({ type: 'smallint', name: 'version_year' })
  versionYear: number;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'enum', enum: NaicsLevel })
  level: NaicsLevel;

  @Column({ type: 'uuid', name: 'parent_id', nullable: true })
  parentId: string | null;

  @ManyToOne(() => NaicsCode, (code) => code.children, { nullable: true })
  @JoinColumn({ name: 'parent_id' })
  parent: NaicsCode | null;

  @OneToMany(() => NaicsCode, (code) => code.parent)
  children: NaicsCode[];

  @Column({ type: 'boolean', name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
