import {BaseEntity, Column, Entity, PrimaryColumn} from 'typeorm';
import {generateId} from '../utils/generate-id.helper';

@Entity('watches')
export class WatchEntity extends BaseEntity {
  @PrimaryColumn()
  public watchId: string = generateId();

  @Column({nullable: false})
  public watchToken!: string;

  @Column({nullable: false})
  public secretTokenHash!: string;

  @Column({nullable: false})
  public playlist: string = "[]";
}
