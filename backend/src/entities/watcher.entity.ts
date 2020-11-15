import {BaseEntity, Column, Entity, PrimaryColumn} from 'typeorm';
import {generateId} from '../utils/generate-id.helper';

@Entity('watchers')
export class WatcherEntity extends BaseEntity {
  @PrimaryColumn()
  public watcherId: string = generateId();

  @Column({nullable: false})
  public username!: string;

  @Column({nullable: false})
  public secretTokenHash!: string;
}
