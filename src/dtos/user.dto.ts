import { UserRole } from '../common/enum/roles.enum';
import { Expose } from 'class-transformer';

export class GetMeResDto {
  @Expose()
  username: string;

  @Expose()
  teamName: string;

  @Expose()
  role: UserRole;
}
